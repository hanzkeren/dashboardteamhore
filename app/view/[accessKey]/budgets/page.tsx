"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, ArrowDownLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DepositEntry {
  id: string;
  tanggal: string;
  jenis: string;
  nominal: number;
  catatan?: string | null;
}

export default function ClientBudgetsPage() {
  const params = useParams();
  const accessKey = params.accessKey as string;

  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<DepositEntry[]>([]);
  const [stats, setStats] = useState({
    totalTopup: 0,
    totalSpend: 0,
    sisaBalance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public-view/${accessKey}`);
        const data = await res.json();

        // 1. Gunakan data budgets & totalSpendAllTime sama seperti halaman overview
        const budgetItems = Array.isArray(data.budgets) ? data.budgets : [];
        const topupBudgets = budgetItems
          .filter((b: any) => b.jenis === "topup")
          .map((b: any) => ({
            id: b.id,
            tanggal: b.tanggal,
            jenis: b.jenis,
            nominal: Number(b.nominal),
            catatan: b.catatan,
          }));
        setDeposits(topupBudgets);

        const totalTopup = budgetItems
          .filter((b: any) => b.jenis === "topup")
          .reduce((sum: number, b: any) => sum + Number(b.nominal), 0);

        const totalSpend = Number(data.totalSpendAllTime) || 0;

        // 3. Hitung Sisa Balance
        const netBalance = totalTopup * 0.95; // Fee 5%
        const sisaBalance = netBalance - totalSpend;

        setStats({ totalTopup, totalSpend, sisaBalance });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessKey]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  if (loading) return <div className="p-8 text-center">Memuat Data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Status</h2>
        <p className="text-muted-foreground">
          Monitoring deposit dan penggunaan saldo iklan.
        </p>
      </div>

      {/* 3 KARTU UTAMA */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Topup (Gross)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalTopup)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total uang masuk
            </p>
          </CardContent>
        </Card>

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
              Total pemakaian iklan
            </p>
          </CardContent>
        </Card>

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

      {/* TABEL RIWAYAT TOPUP */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Riwayat Deposit</h3>
          <Badge variant="outline">{deposits.length} Transaksi</Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Belum ada deposit.
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>
                        {new Date(deposit.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                          <span>
                            {deposit.jenis === "topup" ? "Deposit Masuk" : deposit.jenis}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        + {formatCurrency(deposit.nominal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800"
                        >
                          Success
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
