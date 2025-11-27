// React hook for Analytics Service
"use client"

import { useState, useEffect } from "react"
import { getAnalyticsData } from "@/lib/analytics-service"

export interface AnalyticsData {
  revenue: number
  expenses: number
  profit: number
  efficiency: number
  expenseBreakdown: Record<string, number>
  fieldPerformance: Array<{
    fieldName: string
    area: number
    healthStatus: { value: number; color: string }
  }>
}

export function useAnalyticsService() {
  const [data, setData] = useState<AnalyticsData>({
    revenue: 0,
    expenses: 0,
    profit: 0,
    efficiency: 0,
    expenseBreakdown: {},
    fieldPerformance: [],
  })

  useEffect(() => {
    const analyticsData = getAnalyticsData()
    setData(analyticsData)
  }, [])

  return data
}
