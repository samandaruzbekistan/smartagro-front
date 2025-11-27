"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"

export function FinanceView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Финансовая аналитика</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Доход</p>
              <p className="text-3xl font-bold text-foreground mt-2">2,450,000 ₽</p>
              <p className="text-xs text-muted-foreground mt-2">За текущий сезон</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Расходы</p>
              <p className="text-3xl font-bold text-foreground mt-2">890,000 ₽</p>
              <p className="text-xs text-muted-foreground mt-2">За текущий сезон</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Прибыль</p>
              <p className="text-3xl font-bold text-foreground mt-2">1,560,000 ₽</p>
              <p className="text-xs text-muted-foreground mt-2">Чистая прибыль</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Структура расходов</h3>
        <div className="space-y-4">
          {[
            { label: "ГСМ и топливо", amount: 320000, percentage: 36 },
            { label: "Зарплата сотрудников", amount: 280000, percentage: 31 },
            { label: "Удобрения и химикаты", amount: 180000, percentage: 20 },
            { label: "Ремонт техники", amount: 110000, percentage: 13 },
          ].map((expense, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">{expense.label}</span>
                <span className="text-sm font-medium text-foreground">{expense.amount.toLocaleString("ru-RU")} ₽</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-accent h-full" style={{ width: `${expense.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Revenue */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Доход по месяцам</h3>
        <div className="space-y-4">
          {[
            { month: "Август", revenue: 450000 },
            { month: "Сентябрь", revenue: 680000 },
            { month: "Октябрь", revenue: 920000 },
            { month: "Ноябрь", revenue: 400000 },
          ].map((data, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-20">{data.month}</span>
              <div className="flex-1 bg-secondary rounded-full h-8 flex items-center overflow-hidden">
                <div
                  className="bg-accent h-full flex items-center justify-end pr-3"
                  style={{ width: `${(data.revenue / 920000) * 100}%` }}
                >
                  <span className="text-xs font-semibold text-accent-foreground">
                    {data.revenue.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
