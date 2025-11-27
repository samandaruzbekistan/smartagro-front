"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench } from "lucide-react"

const machinesData = [
  {
    id: 1,
    name: "Трактор John Deere",
    type: "Трактор",
    status: "Активна",
    hours: 2450,
    lastService: "2025-10-15",
    condition: "Отличное",
  },
  {
    id: 2,
    name: "Комбайн CLAAS",
    type: "Комбайн",
    status: "Простой",
    hours: 1800,
    lastService: "2025-11-01",
    condition: "Хорошее",
  },
  {
    id: 3,
    name: "Плуг гидравлический",
    type: "Навеска",
    status: "Активна",
    hours: 3200,
    lastService: "2025-09-20",
    condition: "Удовлетворительное",
  },
]

export function MachinesView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Парк машин</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machinesData.map((machine) => (
          <Card key={machine.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{machine.name}</h3>
                  <p className="text-xs text-muted-foreground">{machine.type}</p>
                </div>
              </div>
              <Badge variant={machine.status === "Активна" ? "default" : "outline"}>{machine.status}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Моточасы</span>
                <span className="font-medium text-foreground">{machine.hours} ч</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Последний ремонт</span>
                <span className="font-medium text-foreground">{machine.lastService}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Состояние</span>
                <span className="font-medium text-foreground">{machine.condition}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
