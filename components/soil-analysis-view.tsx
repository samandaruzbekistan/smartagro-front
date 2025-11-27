"use client"

import { Card } from "@/components/ui/card"
import { Beaker } from "lucide-react"

const soilData = [
  {
    fieldId: 1,
    fieldName: "Поле 1",
    ph: 7.2,
    nitrogen: 85,
    phosphorus: 72,
    potassium: 68,
    organicMatter: 4.2,
    date: "2025-11-20",
  },
  {
    fieldId: 2,
    fieldName: "Поле 2",
    ph: 6.8,
    nitrogen: 78,
    phosphorus: 65,
    potassium: 70,
    organicMatter: 3.8,
    date: "2025-11-19",
  },
  {
    fieldId: 3,
    fieldName: "Поле 3",
    ph: 7.4,
    nitrogen: 92,
    phosphorus: 80,
    potassium: 75,
    organicMatter: 4.5,
    date: "2025-11-18",
  },
]

export function SoilAnalysisView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Анализ почвы</h2>

      <div className="grid grid-cols-1 gap-6">
        {soilData.map((soil) => (
          <Card key={soil.fieldId} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Beaker className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{soil.fieldName}</h3>
                <p className="text-sm text-muted-foreground">Анализ от {soil.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <SoilMetric label="pH" value={soil.ph} max={8} />
              <SoilMetric label="Азот" value={soil.nitrogen} max={100} />
              <SoilMetric label="Фосфор" value={soil.phosphorus} max={100} />
              <SoilMetric label="Калий" value={soil.potassium} max={100} />
              <SoilMetric label="Орг. вещество" value={soil.organicMatter} max={6} />
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Рекомендация: Увеличить содержание калия. Рассмотрите подкормку калийными удобрениями.
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SoilMetric({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100
  return (
    <div className="text-center">
      <div className="mb-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center relative">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-border" strokeWidth="2" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              className="text-accent"
              strokeWidth="2"
              strokeDasharray={`${(176 * percentage) / 100} 176`}
            />
          </svg>
          <span className="absolute text-sm font-bold text-foreground">{value}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
    </div>
  )
}
