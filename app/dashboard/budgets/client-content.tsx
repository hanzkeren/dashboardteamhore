"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  Wallet,
  TrendingDown,
} from "lucide-react";

// --- Helper Formatter Currency (USD) ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface Budget {
  id: string;
  tanggal: string;
  jenis: "topup" | "bonus" | "adj";
  nominal: number;
  catatan: string | null;
  client: {
    id: string;
    name?: string;
    nama?: string;
  };
}

// Interface untuk Report (ambil spend)
interface AdReport {
  id: string;
  spend: number;
  client: {
    id: string;
  };
}

interface Client {
  id: string;
  name?: string;
  nama?: string;
}

export default function BudgetsContent() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get("clientId");

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [reports, setReports] = useState<AdReport[]>([]); // State untuk data spend
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [selectedClient, setSelectedClient] = useState(urlClientId || "all");

  const [formData, setFormData] = useState({
    clientId: urlClientId || "",
    tanggal: new Date().toISOString().split("T")[0],
    jenis: "topup", // Default & Locked to Topup
    nominal: "",
    catatan: "",
  });

  // --- FETCH FUNCTIONS ---

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      const clientList = Array.isArray(data) ? data : data.data || [];
      setClients(clientList);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Budgets
      const urlBudget =
        selectedClient !== "all"
          ? `/api/budgets?clientId=${selectedClient}`
          : "/api/budgets";
      const resBudget = await fetch(urlBudget);
      const dataBudget = await resBudget.json();
      setBudgets(
        Array.isArray(dataBudget) ? dataBudget : dataBudget.data || []
      );

      // 2. Fetch Reports (untuk dapat data Spend)
      const urlReport =
        selectedClient !== "all"
          ? `/api/reports?clientId=${selectedClient}`
          : "/api/reports";
      const resReport = await fetch(urlReport);
      const dataReport = await resReport.json();
      setReports(
        Array.isArray(dataReport) ? dataReport : dataReport.data || []
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClient]);

  // --- EFFECTS ---

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (urlClientId) {
      setFormData((prev) => ({ ...prev, clientId: urlClientId }));
      setSelectedClient(urlClientId);
    }
  }, [urlClientId]);

  // --- HANDLERS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBudget
        ? `/api/budgets/${editingBudget.id}`
        : "/api/budgets";
      const method = editingBudget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchData();
        setShowCreateForm(false);
        setEditingBudget(null);
        setFormData({
          clientId: selectedClient !== "all" ? selectedClient : "",
          tanggal: new Date().toISOString().split("T")[0],
          jenis: "topup",
          nominal: "",
          catatan: "",
        });
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus budget ini?")) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      clientId: budget.client.id,
      tanggal: new Date(budget.tanggal).toISOString().split("T")[0],
      jenis: "topup", // Force logic to topup even if editing old data
      nominal: budget.nominal.toString(),
      catatan: budget.catatan || "",
    });
    setShowCreateForm(true);
  };

  // --- CALCULATIONS ---

  // 1. Filter Budget Display
  const filteredBudgets = budgets.filter((budget) => {
    const clientName = budget.client.name || budget.client.nama || "";
    const term = searchTerm.toLowerCase();
    // Hanya tampilkan topup jika user ingin strict, tapi untuk history biarkan semua jenis muncul di tabel
    return (
      clientName.toLowerCase().includes(term) ||
      (budget.catatan && budget.catatan.toLowerCase().includes(term))
    );
  });

  // 2. Hitung Total Budget (Hanya TOPUP)
  const totalTopup = filteredBudgets
    .filter((b) => b.jenis === "topup")
    .reduce((sum, budget) => sum + Number(budget.nominal), 0);

  // 3. Hitung Total Spend (Dari Reports)
  // Note: Filter reports locally just in case API didn't filter perfectly or for search term match
  const totalSpend = reports.reduce(
    (sum, report) => sum + Number(report.spend),
    0
  );

  // 4. Hitung Net Budget (Potong Fee 5%)
  const netBudget = totalTopup * 0.95;

  // 5. Hitung Sisa Saldo (Net Budget - Spend)
  const sisaSaldo = netBudget - totalSpend;

  if (loading && budgets.length === 0) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Budget
          </h1>
          <p className="text-muted-foreground">
            Kelola deposit client dan pantau sisa saldo (Budget - 5% Fee -
            Spend)
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Input Topup
        </Button>
      </div>

      {/* Stats Cards - REVISED */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Card 1: Total Topup Murni */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budget (Topup)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalTopup)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total uang masuk (belum potong fee)
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Spend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pemakaian iklan
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Sisa Saldo Sementara */}
        <Card
          className={
            sisaSaldo < 0
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Sisa Saldo (Est)
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                sisaSaldo < 0 ? "text-red-700" : "text-green-700"
              }`}
            >
              {formatCurrency(sisaSaldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              (Topup - 5% Fee) - Spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari client / catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filter Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Client</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name || client.nama || "No Name"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => fetchData()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Form Input - SIMPLIFIED (No Bonus/Adj) */}
      {showCreateForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>
              {editingBudget ? "Edit Topup" : "Input Topup Baru"}
            </CardTitle>
            <CardDescription>
              Masukkan data deposit client baru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name || client.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Jenis Dihilangkan (Hidden), default 'topup' di state */}

                <div>
                  <Label htmlFor="tanggal">Tanggal *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nominal">Nominal Topup ($) *</Label>
                  <Input
                    id="nominal"
                    type="number"
                    step="0.01"
                    value={formData.nominal}
                    onChange={(e) =>
                      setFormData({ ...formData, nominal: e.target.value })
                    }
                    placeholder="Contoh: 1000"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="catatan">Catatan</Label>
                <Textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                  placeholder="Keterangan transfer, bank, dll..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingBudget(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {editingBudget ? "Update Data" : "Simpan Topup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Table / List */}
      <div className="grid gap-4">
        {filteredBudgets.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Belum ada data budget yang cocok.
              </p>
              {!searchTerm && selectedClient === "all" && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Topup
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredBudgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">
                        {budget.client.name || budget.client.nama}
                      </h3>
                      {/* Badge hanya muncul jika jenis bukan topup (data lama) */}
                      {budget.jenis !== "topup" && (
                        <Badge variant="outline">
                          {budget.jenis.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(budget.nominal)}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Fee Vendor (5%): {formatCurrency(budget.nominal * 0.05)}
                    </p>

                    {budget.catatan && (
                      <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded inline-block mt-2">
                        {budget.catatan}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground pt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(budget.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
