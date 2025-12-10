"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Eye, Copy, ExternalLink } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  isActive: boolean
  createdAt: string
  accessKey: string
  _count: {
    budgets: number
    adReports: number
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [copiedText, setCopiedText] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    isActive: true
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data.data || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'
      const method = editingClient ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchClients()
        setShowCreateForm(false)
        setEditingClient(null)
        setFormData({ name: "", email: "", phone: "", company: "", isActive: true })
      }
    } catch (error) {
      console.error('Failed to save client:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus client ini?')) return

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchClients()
      }
    } catch (error) {
      console.error('Failed to delete client:', error)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
      isActive: client.isActive
    })
    setShowCreateForm(true)
  }

  const handleCopyAccessKey = async (client: Client) => {
    const clientLink = `${window.location.origin}/view/${client.accessKey}`
    try {
      await navigator.clipboard.writeText(clientLink)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleOpenActionModal = (client: Client) => {
    setSelectedClient(client)
    setShowActionModal(true)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded"></div>
      ))}
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Klien</h1>
          <p className="text-muted-foreground">
            Kelola data klien dan informasi kampanye iklan
          </p>
        </div>
        <Button onClick={() => {
          setEditingClient(null)
          setFormData({ name: "", email: "", phone: "", company: "", isActive: true })
          setShowCreateForm(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Klien
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClient ? 'Edit Klien' : 'Tambah Klien Baru'}</CardTitle>
            <CardDescription>
              {editingClient ? 'Perbarui informasi klien' : 'Masukkan informasi klien baru'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Klien *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Perusahaan</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Client Aktif</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingClient(null)
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {editingClient ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tidak ada klien yang cocok dengan pencarian' : 'Belum ada data klien'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Klien Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenActionModal(client)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{client.name}</h3>
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    {client.company && <p className="text-sm">{client.company}</p>}
                    {client.phone && <p className="text-sm">{client.phone}</p>}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span>{client._count.budgets} budget</span>
                      <span>•</span>
                      <span>{client._count.adReports} report</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenActionModal(client)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        {selectedClient && (
          <>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedClient.name}</DialogTitle>
                <DialogDescription>
                  Kelola aksi untuk klien {selectedClient.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Access Key:</p>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {selectedClient.accessKey}
                  </code>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="default"
                    className="w-full justify-start"
                    onClick={() => window.open(`/view/${selectedClient.accessKey}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Dashboard Client
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleCopyAccessKey(selectedClient)
                      setShowActionModal(false)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copiedText ? "Link Tersalin!" : "Copy Link Client"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowActionModal(false)
                      handleEdit(selectedClient)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Klien
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={() => {
                      setShowActionModal(false)
                      handleDelete(selectedClient.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Klien
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowActionModal(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  )
}