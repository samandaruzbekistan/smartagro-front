"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { analysesApi, machinesApi, workersApi } from "@/lib/api"

export function AnalyticsPage() {
  const [stats, setStats] = useState({
    revenue: "0 UZS",
    expenses: "0 UZS",
    profit: "0 UZS",
    efficiency: "0%",
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      const [analyses, machines, workers] = await Promise.all([
        analysesApi.list(),
        machinesApi.list(),
        workersApi.list(),
      ])

      const revenue = (analyses.length || 0) * 5000000
      const expenses = (machines.length || 0) * 2000000 + (workers.length || 0) * 1000000
      const profit = revenue - expenses

      setStats({
        revenue: revenue.toLocaleString() + " UZS",
        expenses: expenses.toLocaleString() + " UZS",
        profit: profit.toLocaleString() + " UZS",
        efficiency: Math.min(100, 70 + (analyses.length || 0) * 5) + "%",
      })
    } catch (err) {
      // Keep default stats
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tahlillar</h1>
        <p className="text-muted-foreground mt-1">Fermerlik samaradorligini ko‘rsatadigan asosiy ko‘rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Daromad</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue}</div>
            <p className="text-xs text-muted-foreground mt-1">O‘tgan oydan +12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Xarajatlar</span>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expenses}</div>
            <p className="text-xs text-muted-foreground mt-1">O‘tgan oydan -5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Foyda</span>
              <Activity className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profit}</div>
            <p className="text-xs text-muted-foreground mt-1">+18% o‘sish</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Samaradorlik</span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.efficiency}</div>
            <p className="text-xs text-muted-foreground mt-1">Fermerlik yuklamasi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Xarajatlar tarkibi</CardTitle>
            <CardDescription>Oylik xarajatlar taqsimoti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Texnika va uskunalar", percentage: 35 },
                { category: "Ish haqi", percentage: 40 },
                { category: "O‘g‘it va tuproq", percentage: 20 },
                { category: "Boshqa", percentage: 5 },
              ].map(({ category, percentage }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dalalar samaradorligi</CardTitle>
            <CardDescription>Har bir dala bo‘yicha holat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { fieldName: "Shimoliy dala", area: 25.5, healthStatus: { value: 92, color: "green" } },
                { fieldName: "Janubiy dala", area: 18.2, healthStatus: { value: 85, color: "green" } },
                { fieldName: "Sharqiy dala", area: 22.0, healthStatus: { value: 78, color: "yellow" } },
                { fieldName: "G‘arbiy dala", area: 19.5, healthStatus: { value: 88, color: "green" } },
              ].map(({ fieldName, area, healthStatus }) => (
                <div key={fieldName} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{fieldName}</p>
                    <p className="text-xs text-muted-foreground">{area} ha</p>
                  </div>
                  <div className="text-xs font-bold text-green-700">{healthStatus.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
