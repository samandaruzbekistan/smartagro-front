"use client"

import { useEffect, useState } from "react"
import { plantsApi } from "@/lib/api"

interface Plant {
  id: number
  name: string
  description: string | null
}

interface PlantSelectProps {
  value: number | null
  onChange: (plantId: number | null) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function PlantSelect({
  value,
  onChange,
  placeholder = "Ekin tanlang...",
  required = false,
  disabled = false,
  className = "",
}: PlantSelectProps) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlants()
  }, [])

  async function loadPlants() {
    try {
      setLoading(true)
      const data = await plantsApi.list()
      setPlants(data || [])
    } catch (err) {
      console.error("Failed to load plants:", err)
      setPlants([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 ${className}`}
      required={required}
      disabled={disabled || loading}
    >
      <option value="">
        {loading ? "Yuklanmoqda..." : placeholder}
      </option>
      {plants.map((plant) => (
        <option key={plant.id} value={plant.id}>
          {plant.name}
        </option>
      ))}
    </select>
  )
}

