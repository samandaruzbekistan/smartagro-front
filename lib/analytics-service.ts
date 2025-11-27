// Analytics Service
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

export function getAnalyticsData(): AnalyticsData {
  const revenue = 2450000
  const expenses = 890000
  const profit = revenue - expenses
  const efficiency = 94.2

  const expenseBreakdown = {
    Fertilizers: 35,
    Labor: 40,
    Machinery: 20,
    Other: 5,
  }

  const fieldPerformance = [
    { fieldName: "North Field", area: 25.5, healthStatus: { value: 95, color: "green" } },
    { fieldName: "South Field", area: 18.2, healthStatus: { value: 78, color: "yellow" } },
    { fieldName: "East Field", area: 12.0, healthStatus: { value: 88, color: "green" } },
  ]

  return {
    revenue,
    expenses,
    profit,
    efficiency,
    expenseBreakdown,
    fieldPerformance,
  }
}
