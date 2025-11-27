"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sprout } from "lucide-react"

const fieldsData = [
  {
    id: 1,
    name: "Поле 1",
    crop: "Пшеница",
    area: 45,
    status: "Активно",
    health: 85,
    moisture: 65,
  },
  {
    id: 2,
    name: "Поле 2",
    crop: "Ячмень",
    area: 38,
    status: "Активно",
    health: 78,
    moisture: 58,
  },
  {
    id: 3,
    name: "Поле 3",
    crop: "Кукуруза",
    area: 52,
    status: "Ожидание",
    health: 62,
    moisture: 72,
  },
  {
    id: 4,
    name: "Поле 4",
    crop: "Подсолнечник",
    area: 35,
    status: "Активно",
    health: 90,
    moisture: 55,
  },
]

export function FieldsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Управление полями</h2>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">+ Добавить поле</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {fieldsData.map((field) => (
          <Card key={field.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{field.name}</h3>
                  <p className="text-sm text-muted-foreground">{field.crop}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">
                {field.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Площадь</span>
                <span className="font-medium text-foreground">{field.area} га</span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Здоровье почвы</span>
                  <span className="font-medium text-foreground">{field.health}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="bg-accent h-full" style={{ width: `${field.health}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Влажность</span>
                  <span className="font-medium text-foreground">{field.moisture}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="bg-accent h-full" style={{ width: `${field.moisture}%` }}></div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                Просмотреть детали
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
