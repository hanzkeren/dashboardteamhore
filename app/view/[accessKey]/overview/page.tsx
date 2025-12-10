"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Wallet, RotateCcw } from "lucide-react";

export default function ClientBudgetsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessKey = params.accessKey as string;
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTopup: 0,
    totalSpend: 0,
    sisaBalance: 0,
  });
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (fromDate) query.set("from", fromDate);
        if (toDate) query.set("to", toDate);
        const queryString = query.toString();

        // Fetch data (reports mengikuti filter, budgets tetap all time)
        const res = await fetch(
          queryString
            ? `/api/public-view/${accessKey}?${queryString}`
            : `/api/public-view/${accessKey}`
        );
        const data = await res.json();

        // 1. Hitung Total Topup (Uang Masuk) - Sama seperti admin
        const totalTopup = (data.budgets || [])
          .filter((b: any) => b.jenis === "topup")
          .reduce((sum: number, b: any) => sum + Number(b.nominal), 0);

        // 2. Total Spend (Uang Keluar) - Pakai total spend ALL TIME dari API
        const totalSpend = data.totalSpendAllTime || 0;

        // 3. Hitung Sisa Balance (Sama persis rumus Admin)
        const netBalance = totalTopup * 0.95; // Fee 5%
        const sisaBalance = netBalance - totalSpend;

        setStats({ totalTopup, totalSpend, sisaBalance });
        setReports(Array.isArray(data.reports) ? data.reports : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessKey, fromDate, toDate]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  const formatNumber = (val: number) => new Intl.NumberFormat("en-US").format(val);

  const handleResetFilter = () => {
    router.push(`/view/${accessKey}/overview`);
  };

  // Check if there's an active date filter
  const hasDateFilter = searchParams.has("from") || searchParams.has("to");

  if (loading) return <div className="p-8">Memuat Data Budget...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Ringkasan saldo topup, pemakaian, dan performa laporan harian.
          </p>
        </div>
        {hasDateFilter && (
          <Button
            variant="outline"
            onClick={handleResetFilter}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filter
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* CARD 1: TOTAL BUDGET (TOPUP) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budget (Topup)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalTopup)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total deposit masuk (belum potong fee)
            </p>
          </CardContent>
        </Card>

        {/* CARD 2: TOTAL SPEND */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalSpend)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total pemakaian iklan sejauh ini
            </p>
          </CardContent>
        </Card>

        {/* CARD 3: SISA SALDO */}
        <Card
          className={
            stats.sisaBalance < 0
              ? "bg-red-50 border-red-200"
              : "bg-emerald-50 border-emerald-200"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">
              Sisa Saldo (Est)
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.sisaBalance < 0 ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {formatCurrency(stats.sisaBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Topup - 5% Fee) - Spend
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Data Report {fromDate ? `(${fromDate} sd ${toDate ?? fromDate})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Memuat data laporan...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>ID Akun</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Belum ada data.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {new Date(report.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {report.idAccount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(report.spend))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(report.clicks || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(report.impressions || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(report.conversions || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
