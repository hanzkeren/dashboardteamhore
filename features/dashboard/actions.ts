"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getTotalTopupByClient } from "@/features/budgets/actions";
import { getReportAggregateByClient } from "@/features/reports/actions";
import { Decimal } from "decimal.js";

// --- 1. GLOBAL DASHBOARD ---
export async function getDashboardStats() {
  // A. Total Klien
  const totalClients = await prisma.client.count();

  // B. Total Budget (Semua Client)
  const budgetAgg = await prisma.budget.aggregate({
    _sum: { nominal: true },
  });
  // FIX: Pakai ?? 0 untuk handle jika database kosong (null)
  const rawBudget = budgetAgg._sum.nominal ?? 0;
  const totalBudget = new Decimal(rawBudget).toNumber();

  // C. Total Spend (Semua Report)
  const reportAgg = await prisma.adReport.aggregate({
    _sum: { spend: true },
  });
  // FIX: Pakai ?? 0 untuk handle null
  const rawSpend = reportAgg._sum.spend ?? 0;
  const totalSpend = new Decimal(rawSpend).toNumber();

  // D. Total Jumlah Laporan
  const totalReports = await prisma.adReport.count();

  // E. Recent Activity (5 Budget Terakhir)
  const recentBudgets = await prisma.budget.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { nama: true },
      },
    },
  });

  // F. Mapping Data
  const recentActivity = recentBudgets.map((b) => ({
    id: b.id,
    client: b.client.nama,
    // FIX: Pastikan nominal masuk ke Decimal dulu baru toNumber
    amount: new Decimal(b.nominal ?? 0).toNumber(),
    type: b.jenis,
    date: b.tanggal,
  }));

  return {
    totalClients,
    totalBudget,
    totalSpend,
    totalReports,
    recentActivity,
  };
}

// --- 2. SINGLE CLIENT DASHBOARD ---
export async function getClientDashboardSummary(clientId: string) {
  const [totalTopupRaw, reportAgg] = await Promise.all([
    getTotalTopupByClient(clientId),
    getReportAggregateByClient(clientId),
  ]);

  // FIX: Bungkus input dengan Decimal() dan handle null/undefined dengan "|| 0"
  // "as any" dipakai agar TS tidak rewel soal tipe input yang kompleks dari Prisma
  const totalTopup = new Decimal((totalTopupRaw as any) || 0);
  const totalSpend = new Decimal((reportAgg.totalSpend as any) || 0);

  // Operasi matematika aman karena sudah jadi object Decimal
  const sisaSaldo = totalTopup.minus(totalSpend);

  return {
    totalTopup: totalTopup.toNumber(),
    totalSpend: totalSpend.toNumber(),
    sisaSaldo: sisaSaldo.toNumber(),
    totalClicks: reportAgg.totalClicks || 0,
    totalImpressions: reportAgg.totalImpressions || 0,
    totalConversions: reportAgg.totalConversions || 0,
  };
}
