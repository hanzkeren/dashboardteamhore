import { getDashboardStats } from "@/features/dashboard/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Activity,
  BarChart3,
  TrendingUp,
  PlusCircle,
  FileText,
  Wallet,
} from "lucide-react";
import Link from "next/link"; // Buat navigasi button

// Format Currency Helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    // HAPUS class "p-4 md:p-8 pt-6" dari sini karena sudah ada di layout
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* ... SISA KODINGAN KE BAWAH TETAP SAMA JANGAN DIUBAH ... */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* ... Card Content ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Klien</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Klien aktif saat ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">Total topup masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSpend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pengeluaran iklan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Laporan tergenerate</p>
          </CardContent>
        </Card>
      </div>

      {/* ... Bottom Section (Recent Activity & Quick Actions) tetap sama ... */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Aktivitas Terkini (Lebar 4/7 di Desktop) */}
        <Card className="col-span-1 lg:col-span-4 h-full">
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <CardDescription>Transaksi budget 5 terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentActivity.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                  Belum ada aktivitas
                </div>
              ) : (
                stats.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.client}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.type} •{" "}
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium text-sm">
                      +{formatCurrency(item.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions (Lebar 3/7 di Desktop) */}
        <Card className="col-span-1 lg:col-span-3 h-full">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jalan pintas pengelolaan.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/dashboard/clients/" className="w-full">
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Tambah Klien Baru
              </Button>
            </Link>

            <Link href="/dashboard/budgets/" className="w-full">
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Input Budget
              </Button>
            </Link>

            <Link href="/dashboard/reports/" className="w-full">
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base"
              >
                <FileText className="mr-2 h-5 w-5" />
                Buat Laporan Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
