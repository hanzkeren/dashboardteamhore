"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, DollarSign, MousePointer, Target, Download } from "lucide-react"
import { CurrencyDisplay } from "@/components/ui/currency-display"

interface Client {
  id: string
  name: string
}

interface AnalyticsData {
  totalSpend: number
  totalClicks: number
  totalImpressions: number
  totalConversions: number
  avgCPC: number
  avgCTR: number
  totalBudget: number
  budgetUtilization: number
  spendByClient: Array<{
    clientName: string
    spend: number
    clicks: number
    impressions: number
    conversions: number
  }>
  spendByMonth: Array<{
    month: string
    spend: number
    clicks: number
    impressions: number
    conversions: number
  }>
  topPerformers: {
    bestCTR: { clientName: string; spend: number; clicks: number; impressions: number; conversions: number }
    bestCPC: { clientName: string; spend: number; clicks: number; impressions: number; conversions: number }
    mostConversions: { clientName: string; spend: number; clicks: number; impressions: number; conversions: number }
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    fetchClients()
    fetchAnalytics()
  }, [selectedClient, timeRange])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const response = await res.json()
      setClients(response.data || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchAnalytics = async () => {
    // Only show full loading on initial load
    if (!data) setLoading(true)
    else setRefreshing(true)

    try {
      const queryParams = new URLSearchParams({
        clientId: selectedClient,
        days: timeRange
      })

      const res = await fetch(`/api/analytics?${queryParams}`)
      const response = await res.json()

      if (response.success) {
        setData(response.data)
        // Show cached indicator if data is from cache
        if (response.cached) {
          console.log('Analytics data loaded from cache')
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  const formatPercentage = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00%'
    return `${num.toFixed(2)}%`
  }

  const exportData = () => {
    if (!data) return

    const csvContent = [
      ['Client', 'Spend', 'Clicks', 'Impressions', 'Conversions', 'CPC', 'CTR'],
      ...data.spendByClient.map(item => [
        item.clientName,
        item.spend.toString(),
        item.clicks.toString(),
        item.impressions.toString(),
        item.conversions.toString(),
        item.clicks ? (item.spend / item.clicks).toFixed(2) : '0',
        item.impressions ? ((item.clicks / item.impressions) * 100).toFixed(2) + '%' : '0%'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading || !data) {
    return <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded"></div>
      ))}
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Analisis performa iklan dan insight bisnis
          </p>
        </div>
        <Button onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari Terakhir</SelectItem>
            <SelectItem value="30">30 Hari Terakhir</SelectItem>
            <SelectItem value="90">90 Hari Terakhir</SelectItem>
            <SelectItem value="365">1 Tahun</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Client</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchAnalytics} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={data.totalSpend} /></div>
            <p className="text-xs text-muted-foreground">
              Dari total budget <CurrencyDisplay amount={data.totalBudget} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.budgetUtilization)}</div>
            <p className="text-xs text-muted-foreground">
              Budget yang sudah digunakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CPC</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={data.avgCPC} /></div>
            <p className="text-xs text-muted-foreground">
              Cost per click rata-rata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.avgCTR)}</div>
            <p className="text-xs text-muted-foreground">
              Click-through rate rata-rata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Click Performance</CardTitle>
            <CardDescription>Total klik dan interaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.totalClicks)}</div>
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <div className="mt-4 text-lg">
              {formatNumber(data.totalImpressions)} Impressions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Konversi dari total klik</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.totalConversions)}</div>
            <p className="text-sm text-muted-foreground">Total Conversions</p>
            <div className="mt-4 text-lg">
              {data.totalClicks > 0
                ? formatPercentage((data.totalConversions / data.totalClicks) * 100)
                : '0%'
              } CVR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost per Conversion</CardTitle>
            <CardDescription>Biaya per konversi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.totalConversions > 0
                ? <CurrencyDisplay amount={data.totalSpend / data.totalConversions} />
                : '-'
              }
            </div>
            <p className="text-sm text-muted-foreground">CPA</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Client dengan performa terbaik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Best CTR</p>
              <p className="text-lg font-semibold">{data.topPerformers.bestCTR.clientName}</p>
              <p className="text-2xl font-bold text-green-600">
                {data.topPerformers.bestCTR.impressions > 0
                  ? formatPercentage((data.topPerformers.bestCTR.clicks / data.topPerformers.bestCTR.impressions) * 100)
                  : '0.00%'
                }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Best CPC</p>
              <p className="text-lg font-semibold">{data.topPerformers.bestCPC.clientName}</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.topPerformers.bestCPC.clicks > 0
                  ? <CurrencyDisplay amount={data.topPerformers.bestCPC.spend / data.topPerformers.bestCPC.clicks} />
                  : <CurrencyDisplay amount={0} />
                }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Most Conversions</p>
              <p className="text-lg font-semibold">{data.topPerformers.mostConversions.clientName}</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(data.topPerformers.mostConversions.conversions)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spend by Client */}
      <Card>
        <CardHeader>
          <CardTitle>Spend by Client</CardTitle>
          <CardDescription>Perbandingan spend per client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.spendByClient.map((client, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{client.clientName}</p>
                  <p className="font-bold"><CurrencyDisplay amount={client.spend} /></p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${data.totalSpend > 0 ? (client.spend / data.totalSpend) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <span>{formatNumber(client.clicks)} clicks</span>
                  <span>{formatNumber(client.impressions)} impressions</span>
                  <span>{formatNumber(client.conversions)} conversions</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Performa</CardTitle>
          <CardDescription>Perkembangan performa bulanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.spendByMonth.map((month, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">{month.month}</p>
                  <p className="font-bold"><CurrencyDisplay amount={month.spend} /></p>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Clicks</p>
                    <p className="font-medium">{formatNumber(month.clicks)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impressions</p>
                    <p className="font-medium">{formatNumber(month.impressions)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversions</p>
                    <p className="font-medium">{formatNumber(month.conversions)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPC</p>
                    <p className="font-medium">
                      {month.clicks ? <CurrencyDisplay amount={month.spend / month.clicks} /> : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}