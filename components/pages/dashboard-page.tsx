"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Sprout, Zap, Users } from "lucide-react"
import { fieldsApi, soilsApi, machinesApi, workersApi } from "@/lib/api"

export function DashboardPage() {
  const [stats, setStats] = useState({
    fields: 0,
    soils: 0,
    machines: 0,
    workers: 0,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [fieldsData, soilsData, machinesData, workersData] = await Promise.all([
          fieldsApi.list(),
          soilsApi.list(),
          machinesApi.list(),
          workersApi.list(),
        ])

        setStats({
          fields: Array.isArray(fieldsData) ? fieldsData.length : 0,
          soils: Array.isArray(soilsData) ? soilsData.length : 0,
          machines: Array.isArray(machinesData) ? machinesData.length : 0,
          workers: Array.isArray(workersData) ? workersData.length : 0,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Smart Farm management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Total Fields</span>
              <Sprout className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.fields}</div>
            <p className="text-xs text-muted-foreground mt-1">Active farm fields</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Soil Samples</span>
              <Zap className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.soils}</div>
            <p className="text-xs text-muted-foreground mt-1">Analyzed samples</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Machines</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.machines}</div>
            <p className="text-xs text-muted-foreground mt-1">Equipment inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Workers</span>
              <Users className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.workers}</div>
            <p className="text-xs text-muted-foreground mt-1">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Quick start guide</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Create a Field</p>
                  <p className="text-sm text-muted-foreground">Add new farm fields with location data</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Soil Analysis</p>
                  <p className="text-sm text-muted-foreground">Test soil samples and get recommendations</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">Apply Fertilizers</p>
                  <p className="text-sm text-muted-foreground">Get precise recommendations based on analysis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>API and services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Connection</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sync Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Up to date</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
