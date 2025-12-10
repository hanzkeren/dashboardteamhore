"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Edit, Trash2, Plus } from "lucide-react";
// API functions
const getReports = async () => {
  const res = await fetch('/api/reports');
  return res.json();
};

const getClients = async () => {
  const res = await fetch('/api/clients');
  const json = await res.json();
  return json?.data || [];
};

const createReport = async (data: any) => {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

const updateReport = async (id: string, data: any) => {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

const deleteReport = async (id: string) => {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export default function ReportsContent() {
  const [reports, setReports] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    tanggal: "",
    idAccount: "",
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    clientId: "",
  });

  const searchParams = useSearchParams();

  // Load data
  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, clientsData] = await Promise.all([
        getReports(),
        getClients(),
      ]);
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      setReports([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    report.idAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.client?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReport) {
        await updateReport(editingReport.id, formData);
      } else {
        await createReport(formData);
      }
      setIsModalOpen(false);
      setEditingReport(null);
      setFormData({
        tanggal: "",
        idAccount: "",
        spend: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
        clientId: "",
      });
      loadData();
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    setFormData({
      tanggal: report.tanggal,
      idAccount: report.idAccount,
      spend: report.spend,
      clicks: report.clicks,
      impressions: report.impressions,
      conversions: report.conversions,
      clientId: report.clientId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus report ini?")) {
      try {
        await deleteReport(id);
        loadData();
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Iklan</h1>
          <p className="text-muted-foreground">
            Kelola data laporan iklan untuk semua klien
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingReport(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? "Edit Report" : "Tambah Report Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
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
              <div className="space-y-2">
                <Label htmlFor="client">Klien</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clientId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih klien" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idAccount">ID Akun</Label>
                <Input
                  id="idAccount"
                  value={formData.idAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, idAccount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spend">Spend</Label>
                  <Input
                    id="spend"
                    type="number"
                    step="0.01"
                    value={formData.spend}
                    onChange={(e) =>
                      setFormData({ ...formData, spend: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clicks">Clicks</Label>
                  <Input
                    id="clicks"
                    type="number"
                    value={formData.clicks}
                    onChange={(e) =>
                      setFormData({ ...formData, clicks: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="impressions">Impressions</Label>
                  <Input
                    id="impressions"
                    type="number"
                    value={formData.impressions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        impressions: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversions">Conversions</Label>
                  <Input
                    id="conversions"
                    type="number"
                    value={formData.conversions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conversions: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {editingReport ? "Update" : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari berdasarkan nama klien atau ID akun..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>ID Akun</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {new Date(report.tanggal).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>{report.client?.nama}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.idAccount}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(report.spend)}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.clicks?.toLocaleString("id-ID") || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.impressions?.toLocaleString("id-ID") || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.conversions?.toLocaleString("id-ID") || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(report)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}