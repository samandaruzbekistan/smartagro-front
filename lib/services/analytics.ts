// Analytics Service - computes field insights and financial analytics
export interface FieldAnalytics {
  fieldName: string
  areaHa: number
  health: number
  yieldEstimate: number
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
}

export interface FarmAnalytics {
  totalFields: number
  totalAreaHa: number
  averageHealth: number
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  averageProfitMargin: number
  expenseBreakdown: Record<string, number>
}

export function analyzeFields(fields: any[], soilData: any[], machines: any[]): FarmAnalytics {
  let totalAreaHa = 0
  let totalHealthSum = 0
  let totalRevenue = 0
  let totalExpenses = 0

  fields.forEach((field: any) => {
    totalAreaHa += field.area_ha || 0
    totalHealthSum += 75 // Average health

    // Revenue: 15,000 per hectare (typical crop value)
    totalRevenue += (field.area_ha || 0) * 15000
  })

  // Expenses breakdown
  const fertilizerCost = soilData.length > 0 ? soilData.length * 50000 : 150000
  const laborCost = Math.round(totalAreaHa * 5000) // 5000 per hectare
  const machineryCost = machines.length > 0 ? machines.length * 25000 : 75000
  const otherCost = Math.round(totalAreaHa * 2000)

  totalExpenses = fertilizerCost + laborCost + machineryCost + otherCost
  const totalProfit = totalRevenue - totalExpenses

  return {
    totalFields: fields.length,
    totalAreaHa: Math.round(totalAreaHa * 10) / 10,
    averageHealth: Math.round(totalHealthSum / Math.max(fields.length, 1)),
    totalRevenue,
    totalExpenses,
    totalProfit,
    averageProfitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
    expenseBreakdown: {
      Fertilizers: fertilizerCost,
      Labor: laborCost,
      Machinery: machineryCost,
      Other: otherCost,
    },
  }
}

export function analyzeField(field: any): FieldAnalytics {
  const areaHa = field.area_ha || 10
  const health = 85 // Health percentage
  const yieldEstimate = areaHa * 4500 // kg per hectare
  const revenue = areaHa * 15000
  const expenses = areaHa * 6000
  const profit = revenue - expenses

  return {
    fieldName: field.name || "Field",
    areaHa,
    health,
    yieldEstimate: Math.round(yieldEstimate),
    revenue,
    expenses,
    profit,
    profitMargin: Math.round((profit / revenue) * 100),
  }
}
