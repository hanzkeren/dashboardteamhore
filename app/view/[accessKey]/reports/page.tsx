"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, DollarSign, MousePointer, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ... Interface AdReport dll ...

export default function ClientReportsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessKey = params.accessKey as string;

  // Ambil tanggal dari URL (Layout yang nge-set ini)
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Kirim filter date ke API backend lu
        const query = new URLSearchParams();
        if (fromDate) query.set("from", fromDate);
        if (toDate) query.set("to", toDate);

        const res = await fetch(
          `/api/public-view/${accessKey}?${query.toString()}`
        );
        const data = await res.json();
        setReports(data.reports || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessKey, fromDate, toDate]); // Re-fetch kalau tanggal berubah

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  // Hitung totals dari reports yang sudah difilter
  const totalSpend = reports.reduce((sum, r) => sum + Number(r.spend), 0);
  const totalClicks = reports.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalImpressions = reports.reduce((sum, r) => sum + (r.impressions || 0), 0);

  const handleResetFilter = () => {
    router.push(`/view/${accessKey}/reports`);
  };

  // Check if there's an active date filter
  const hasDateFilter = searchParams.has('from') || searchParams.has('to');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Laporan Detail</h2>
          <p className="text-muted-foreground">
            Pemantauan performa iklan lengkap: spend, klik, tayangan, dan konversi.
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpend)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total budget terpakai {fromDate && toDate && `(${fromDate} - ${toDate})`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalClicks)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total klik iklan {fromDate && toDate && `(${fromDate} - ${toDate})`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalImpressions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total tayangan iklan {fromDate && toDate && `(${fromDate} - ${toDate})`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABEL DATA */}
      <Card>
        <CardHeader>
          <CardTitle>
            Data Report {fromDate ? `(${fromDate} sd ${toDate})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
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
                  reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {new Date(r.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {r.idAccount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(r.spend)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(r.clicks || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(r.impressions || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(r.conversions || 0)}
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
