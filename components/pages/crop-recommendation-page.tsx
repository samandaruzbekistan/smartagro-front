"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cropRecommendationApi } from "@/lib/api"
import { AiAnalysisCard } from "@/components/ai-analysis-card"

interface FieldWithSoils {
  id: number
  name: string
  area_ha: number
  soils: {
    id: number
    field_id: number
    name: string | null
    sampled_at: string | null
    ph: number | null
  }[]
}

interface PlantOption {
  id: number
  name: string
  description: string | null
}

interface CropRecommendationResult {
  success: boolean
  field_id: number
  field_name: string
  soil_id: number
  soil_name: string | null
  plant_id: number
  plant_name: string
  recommendation: string
  generated_at: string
  error?: string
}

export function CropRecommendationPage() {
  const [fields, setFields] = useState<FieldWithSoils[]>([])
  const [plants, setPlants] = useState<PlantOption[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedField, setSelectedField] = useState<number | null>(null)
  const [selectedSoil, setSelectedSoil] = useState<number | null>(null)
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null)
  
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)
  const [result, setResult] = useState<CropRecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOptions()
  }, [])

  async function loadOptions() {
    try {
      setLoading(true)
      const response = (await cropRecommendationApi.getOptions()) as any
      const data = response?.data || response
      
      setFields(data.fields || [])
      setPlants(data.plants || [])
    } catch (err) {
      console.error("Failed to load options:", err)
      setError("Ma'lumotlarni yuklab bo'lmadi")
    } finally {
      setLoading(false)
    }
  }

  const availableSoils = fields.find((f) => f.id === selectedField)?.soils || []

  async function handleGetRecommendation() {
    if (!selectedField || !selectedSoil || !selectedPlant) {
      setError("Iltimos, barcha maydonlarni to'ldiring")
      return
    }

    setLoadingRecommendation(true)
    setError(null)
    setResult(null)

    try {
      const response = (await cropRecommendationApi.getRecommendation({
        field_id: selectedField,
        soil_id: selectedSoil,
        plant_id: selectedPlant,
      })) as any
      
      const data = response?.data || response
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Tavsiya olishda xatolik yuz berdi")
      }
    } catch (e) {
      console.error("Failed to get recommendation:", e)
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi")
    } finally {
      setLoadingRecommendation(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">🌱 Ekin Tavsiyasi</h1>
        <p className="text-muted-foreground mt-1">
          AI yordamida ekin ekish mumkinmi yoki yo'qligini aniqlang
        </p>
      </div>

      {/* Forma */}
      <Card>
        <CardHeader>
          <CardTitle>Ma'lumotlarni tanlang</CardTitle>
          <CardDescription>
            Dala, tuproq namunasi va ekin turini tanlang
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dala */}
            <div>
              <label className="block text-sm font-medium mb-2">Dala *</label>
              <select
                value={selectedField || ""}
                onChange={(e) => {
                  setSelectedField(e.target.value ? Number(e.target.value) : null)
                  setSelectedSoil(null)
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Tanlang...</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.area_ha} ga)
                  </option>
                ))}
              </select>
            </div>

            {/* Tuproq */}
            <div>
              <label className="block text-sm font-medium mb-2">Tuproq namunasi *</label>
              <select
                value={selectedSoil || ""}
                onChange={(e) => setSelectedSoil(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedField}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Tanlang...</option>
                {availableSoils.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || `Namuna #${s.id}`} {s.ph ? `(pH: ${s.ph.toFixed(2)})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Ekin */}
            <div>
              <label className="block text-sm font-medium mb-2">Ekin *</label>
              <select
                value={selectedPlant || ""}
                onChange={(e) => setSelectedPlant(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Tanlang...</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleGetRecommendation}
            disabled={loadingRecommendation || !selectedField || !selectedSoil || !selectedPlant}
            className="w-full"
            size="lg"
          >
            {loadingRecommendation ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                AI tahlil qilmoqda...
              </span>
            ) : (
              "🤖 AI Tavsiya Olish"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Xatolik */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Natija */}
      {result && result.success && (
        <Card>
          <CardHeader>
            <CardTitle>📋 AI Tavsiyasi</CardTitle>
            <CardDescription>
              {result.plant_name} uchun {result.field_name} dalasidagi tuproq tahlili
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="space-y-2">
                {result.recommendation.split("\n").map((line, i) => {
                  // Headers
                  if (line.trim().startsWith("### ")) {
                    return (
                      <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">
                        {line.replace("### ", "")}
                      </h3>
                    )
                  }
                  if (line.trim().startsWith("## ")) {
                    return (
                      <h2 key={i} className="text-xl font-semibold mt-5 mb-3 text-foreground">
                        {line.replace("## ", "")}
                      </h2>
                    )
                  }
                  // Bold
                  const boldRegex = /\*\*(.*?)\*\*/g
                  if (line.includes("**")) {
                    const parts: (string | JSX.Element)[] = []
                    let lastIndex = 0
                    let match
                    let keyCounter = 0

                    while ((match = boldRegex.exec(line)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(line.substring(lastIndex, match.index))
                      }
                      parts.push(
                        <strong key={`bold-${keyCounter++}`} className="font-semibold">
                          {match[1]}
                        </strong>
                      )
                      lastIndex = match.index + match[0].length
                    }
                    if (lastIndex < line.length) {
                      parts.push(line.substring(lastIndex))
                    }
                    return (
                      <p key={i} className="mb-3 text-foreground leading-relaxed">
                        {parts}
                      </p>
                    )
                  }
                  // List items
                  if (line.trim().match(/^[-*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
                    return (
                      <li key={i} className="ml-6 mb-1 text-foreground">
                        {line.replace(/^[-*]\d+\.\s+/, "")}
                      </li>
                    )
                  }
                  // Regular paragraph
                  if (line.trim()) {
                    return (
                      <p key={i} className="mb-3 text-foreground leading-relaxed">
                        {line}
                      </p>
                    )
                  }
                  return <br key={i} />
                })}
              </div>
            </div>
            {result.generated_at && (
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                Tahlil vaqti: {new Date(result.generated_at).toLocaleString("uz-UZ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

