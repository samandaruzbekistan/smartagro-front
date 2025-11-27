"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { analysesApi } from "@/lib/api"

interface DeficientElementSummary {
  element_code: string
  element_name: string
  value: number
  status: "low" | "optimal" | "high" | "unknown"
  difference_code: number
  optimal_min: number | null
  optimal_max: number | null
}

interface ReadinessSummary {
  analysis_id: number
  plant_id: number | null
  plant_name: string | null
  soil_id: number | null
  field_id: number | null
  field_name: string | null
  overall_status: "ready" | "needs_improvement"
  ph: {
    value: number | null
    status: "unknown" | "too_acidic" | "too_alkaline" | "optimal"
    recommendation: string | null
  }
  deficient_elements: DeficientElementSummary[]
  summary_text: string
}

interface Props {
  analysisId: number
}

export function SoilReadinessCard({ analysisId }: Props) {
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReadiness = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, check if analysis exists and has required data
      let analysisData: any = null
      try {
        const analysis = (await analysesApi.get(analysisId)) as any
        analysisData = analysis?.data || analysis
        
        // Check if analysis has plant_id (required for readiness)
        if (!analysisData?.plant_id) {
          setError("Tahlil uchun ekin tanlanmagan. Iltimos, avval ekin tanlang.")
          setReadiness(null)
          setLoading(false)
          return
        }
        
        // Check if analysis has element values
        const elementValues = analysisData?.element_values || analysisData?.elements || []
        if (!elementValues || elementValues.length === 0) {
          setError("Tahlilda element qiymatlari mavjud emas. Iltimos, tuproq namunasi ma'lumotlarini tekshiring.")
          setReadiness(null)
          setLoading(false)
          return
        }
      } catch (checkErr) {
        console.error("Could not verify analysis:", checkErr)
        setError("Tahlilni yuklab bo'lmadi. Iltimos, qayta urinib ko'ring.")
        setReadiness(null)
        setLoading(false)
        return
      }
      
      // Small delay to ensure server has processed the update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const response = (await analysesApi.getReadiness(analysisId)) as any
      const readinessData = response?.data || response
      
      // Validate response structure
      if (readinessData && typeof readinessData === 'object' && 'overall_status' in readinessData) {
        setReadiness(readinessData)
      } else {
        setError("Noto'g'ri javob formati. Server javobini tekshiring.")
        setReadiness(null)
      }
    } catch (err: any) {
      // Handle different error types
      let errorMessage = "API error: 500"
      let detailedMessage = ""
      
      // Check error response status
      const status = err?.response?.status || err?.status
      
      if (status === 500) {
        errorMessage = "API error: 500"
        detailedMessage = "Serverda ichki xatolik yuz berdi. Bu quyidagi sabablarga ko'ra bo'lishi mumkin:"
      } else if (status === 404) {
        errorMessage = "Tahlil topilmadi"
        detailedMessage = "Berilgan ID bo'yicha tahlil topilmadi."
      } else if (status === 422) {
        errorMessage = "Ma'lumotlar noto'g'ri"
        detailedMessage = "Tahlil ma'lumotlari to'liq emas yoki noto'g'ri. Iltimos, ekin va element qiymatlarini tekshiring."
      } else if (err instanceof Error) {
        errorMessage = err.message || "Noma'lum xatolik"
        detailedMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
        detailedMessage = err
      }
      
      setError(errorMessage)
      setReadiness(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (analysisId) {
      loadReadiness()
    }
  }, [analysisId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading readiness...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🌱 Tuproq tayyorgarligi</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="text-red-600 font-medium">{error}</div>
            {error.includes("500") || error.includes("API error") ? (
              <div className="text-sm text-muted-foreground mt-2">
                <p className="font-medium mb-2">Bu xatolik quyidagi sabablarga ko'ra bo'lishi mumkin:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-left max-w-md mx-auto">
                  <li>Tahlil hali to'liq qayta ishlanmagan (bir necha soniya kutib, qayta urinib ko'ring)</li>
                  <li>Ekin tanlanmagan (tahlil ma'lumotlarida ekin ID bo'lishi kerak)</li>
                  <li>Element qiymatlari yetarli emas</li>
                  <li>Server bilan bog'lanishda muammo</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Agar ekin yangi tanlangan bo'lsa, bir necha soniya kutib, qayta urinib ko'ring.
                </p>
              </div>
            ) : error.includes("ekin tanlanmagan") ? (
              <div className="text-sm text-muted-foreground mt-2">
                <p>Iltimos, tahlil uchun ekin tanlang. Buning uchun tahlil ma'lumotlarini oching va "Ekin tanlash" tugmasini bosing.</p>
              </div>
            ) : null}
            <Button variant="outline" onClick={loadReadiness} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Qayta urinib ko'rish
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!readiness) {
    return null
  }

  const isReady = readiness.overall_status === "ready"

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>🌱 Tuproq tayyorgarligi</CardTitle>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              isReady ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isReady ? "✅ Tayyor" : "⚠️ Tayyorgarlik kerak"}
          </span>
        </div>
        {readiness.plant_name && (
          <CardDescription>Ekin: {readiness.plant_name}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-foreground">{readiness.summary_text}</p>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* pH */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">⚗️ pH holati</h3>
            <p>
              Qiymat: <strong>{readiness.ph.value ?? "—"}</strong>
            </p>
            <p>
              Holat: <strong>{readiness.ph.status}</strong>
            </p>
            {readiness.ph.recommendation && (
              <p className="text-sm text-muted-foreground mt-2">💡 {readiness.ph.recommendation}</p>
            )}
          </div>

          {/* Deficient Elements */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🧪 Kam elementlar</h3>
            {readiness.deficient_elements.length === 0 ? (
              <p className="text-green-600">✅ Barcha elementlar yetarli</p>
            ) : (
              <ul className="space-y-1">
                {readiness.deficient_elements.map((el) => (
                  <li key={el.element_code} className="text-red-600 text-sm">
                    ⚠️ {el.element_code} ({el.element_name}): {el.value} (min: {el.optimal_min})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

