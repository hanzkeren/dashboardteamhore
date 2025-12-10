import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Cache analytics data for 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache: any = null;
let cacheTime = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId") || "all";
    const days = parseInt(searchParams.get("days") || "30");

    // Check cache
    const cacheKey = `${clientId}-${days}`;
    const now = Date.now();

    if (cache && cache.key === cacheKey && (now - cacheTime) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Build where clause
    const whereClause: any = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (clientId !== "all") {
      whereClause.clientId = clientId;
    }

    // Use database aggregation for better performance
    const [totals, totalBudget] = await Promise.all([
      // Get total aggregates
      prisma.adReport.aggregate({
        where: whereClause,
        _sum: {
          spend: true,
          clicks: true,
          impressions: true,
          conversions: true,
        },
        _avg: {
          spend: true,
          clicks: true,
          impressions: true,
          conversions: true,
        },
        _count: true,
      }),

      // Get total budget
      prisma.budget.aggregate({
        where: whereClause,
        _sum: {
          nominal: true,
        },
      }),
    ]);

    // Get spend by client with optimized query
    const clientsWithAggregates = await prisma.client.findMany({
      where: clientId !== "all" ? { id: clientId } : {},
      include: {
        reports: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            spend: true,
            clicks: true,
            impressions: true,
            conversions: true,
          },
        },
      },
    });

    // Process client data
    const spendByClient = clientsWithAggregates
      .map(client => {
        const reports = client.reports;
        const spend = reports.reduce((sum, r) => sum + parseFloat(r.spend.toString()), 0);
        const clicks = reports.reduce((sum, r) => sum + (r.clicks || 0), 0);
        const impressions = reports.reduce((sum, r) => sum + (r.impressions || 0), 0);
        const conversions = reports.reduce((sum, r) => sum + (r.conversions || 0), 0);

        return {
          clientName: client.nama,
          spend,
          clicks,
          impressions,
          conversions,
        };
      })
      .filter(client => client.spend > 0)
      .sort((a, b) => b.spend - a.spend);

    // Get monthly data with optimized approach
    const reportsGrouped = await prisma.adReport.groupBy({
      by: ['tanggal', 'clientId'],
      where: whereClause,
      _sum: {
        spend: true,
        clicks: true,
        impressions: true,
        conversions: true,
      },
    });

    // Group by month
    const monthMap = new Map<string, any>();
    reportsGrouped.forEach(report => {
      const date = new Date(report.tanggal);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthName,
          spend: 0,
          clicks: 0,
          impressions: 0,
          conversions: 0,
        });
      }

      const monthData = monthMap.get(monthKey);
      monthData.spend += parseFloat(report._sum.spend?.toString() || "0");
      monthData.clicks += report._sum.clicks || 0;
      monthData.impressions += report._sum.impressions || 0;
      monthData.conversions += report._sum.conversions || 0;
    });

    const spendByMonth = Array.from(monthMap.values()).sort((a, b) => {
      // Sort by month descending
      const monthA = new Date(a.month.split(' ')[1], new Date(a.month + ' 1').getMonth());
      const monthB = new Date(b.month.split(' ')[1], new Date(b.month + ' 1').getMonth());
      return monthB.getTime() - monthA.getTime();
    });

    // Calculate derived metrics
    const totalSpend = parseFloat(totals._sum.spend?.toString() || "0");
    const totalClicks = totals._sum.clicks || 0;
    const totalImpressions = totals._sum.impressions || 0;
    const totalConversions = totals._sum.conversions || 0;
    const budgetTotal = parseFloat(totalBudget._sum.nominal?.toString() || "0");

    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const budgetUtilization = budgetTotal > 0 ? (totalSpend / budgetTotal) * 100 : 0;

    // Find top performers from the aggregated data
    const topPerformers = {
      bestCTR: spendByClient.reduce((best, current) => {
        const currentCTR = current.impressions > 0 ? (current.clicks / current.impressions) * 100 : 0;
        const bestCTR = best.impressions > 0 ? (best.clicks / best.impressions) * 100 : 0;
        return currentCTR > bestCTR ? current : best;
      }, spendByClient[0] || { clientName: '-', impressions: 1, clicks: 0 }),
      bestCPC: spendByClient.reduce((best, current) => {
        const currentCPC = current.clicks > 0 ? current.spend / current.clicks : Infinity;
        const bestCPC = best.clicks > 0 ? best.spend / best.clicks : Infinity;
        return currentCPC < bestCPC ? current : best;
      }, spendByClient[0] || { clientName: '-', clicks: 1, spend: 0 }),
      mostConversions: spendByClient.reduce((best, current) =>
        current.conversions > best.conversions ? current : best,
      spendByClient[0] || { clientName: '-', conversions: 0 }
      ),
    };

    const analyticsData = {
      totalSpend,
      totalClicks,
      totalImpressions,
      totalConversions,
      avgCPC,
      avgCTR,
      totalBudget: budgetTotal,
      budgetUtilization,
      spendByClient,
      spendByMonth,
      topPerformers,
    };

    // Update cache
    cache = {
      key: cacheKey,
      data: analyticsData,
    };
    cacheTime = now;

    return NextResponse.json({
      success: true,
      data: analyticsData,
      cached: false,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}