"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles } from "lucide-react"
import { plantsApi, fieldsApi, analysesApi, cropRecommendationApi, soilsApi } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Plant {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

interface Field {
  id: number
  name: string
}

// Категории растений
const PLANT_CATEGORIES = [
  { id: "technical", name: "Texnik ekinlar" },
  { id: "grain", name: "Don ekinlari" },
  { id: "vegetable", name: "Sabzavotlar" },
  { id: "legume", name: "Dukkaklilar" },
  { id: "fodder", name: "Yem-xashak" },
  { id: "melon", name: "Poliz ekinlari" },
  { id: "fruit", name: "Mevalar" },
]

const PLANT_CATEGORY_MAP: Record<number, string> = {
  1: "technical", 14: "technical",
  2: "grain", 3: "grain", 4: "grain", 5: "grain",
  6: "vegetable", 7: "vegetable", 8: "vegetable", 9: "vegetable", 10: "vegetable",
  11: "legume", 12: "legume", 13: "legume",
  15: "fodder",
  16: "melon", 17: "melon",
  18: "fruit", 19: "fruit", 20: "fruit",
}

function getCategoryForPlant(plantId: number): string {
  return PLANT_CATEGORY_MAP[plantId] || "other"
}

function getCategoryName(categoryId: string): string {
  return PLANT_CATEGORIES.find((c) => c.id === categoryId)?.name || "Boshqa"
}

export function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [plantAnalyses, setPlantAnalyses] = useState<Record<number, any>>({})
  
  // Crop Recommendation states
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null)
  const [selectedSoilId, setSelectedSoilId] = useState<number | null>(null)
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null)
  const [filteredSoils, setFilteredSoils] = useState<any[]>([])
  const [recommendation, setRecommendation] = useState<any>(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)

  useEffect(() => {
    loadPlants()
    loadFields()
    loadAnalyses()
  }, [])
  
  useEffect(() => {
    if (selectedFieldId) {
      loadSoilsForField(selectedFieldId)
    } else {
      setFilteredSoils([])
      setSelectedSoilId(null)
    }
  }, [selectedFieldId])

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

  async function loadFields() {
    try {
      const data = await fieldsApi.list()
      setFields(data || [])
    } catch (err) {
      console.error("Failed to load fields:", err)
      setFields([])
    }
  }

  async function loadAnalyses() {
    try {
      const analyses = (await analysesApi.list()) as any
      const analysesData = Array.isArray(analyses) ? analyses : analyses?.data || []
      
      const grouped: Record<number, any> = {}
      
      const analysisPromises = analysesData
        .filter((a: any) => a.plant_id)
        .map(async (analysis: any) => {
          try {
            const fullAnalysis = (await analysesApi.get(analysis.id)) as any
            return fullAnalysis?.data || fullAnalysis || analysis
          } catch {
            return analysis
          }
        })
      
      const fullAnalyses = await Promise.all(analysisPromises)
      
      fullAnalyses.forEach((analysis: any) => {
        if (analysis?.plant_id) {
          if (analysis.soil?.field_id && !analysis.soil?.field) {
            const field = fields.find(f => f.id === analysis.soil.field_id)
            if (field) {
              analysis.soil.field = { id: field.id, name: field.name }
            }
          }
          
          if (!grouped[analysis.plant_id]) {
            grouped[analysis.plant_id] = []
          }
          grouped[analysis.plant_id].push(analysis)
        }
      })
      
      setPlantAnalyses(grouped)
    } catch (err) {
      console.error("Failed to load analyses:", err)
    }
  }
  
  async function loadSoilsForField(fieldId: number) {
    try {
      const soilsList = await soilsApi.list(fieldId)
      setFilteredSoils(Array.isArray(soilsList) ? soilsList : (soilsList as any)?.data || [])
    } catch (err) {
      console.error("Failed to load soils:", err)
      setFilteredSoils([])
    }
  }
  
  async function handleGetRecommendation() {
    if (!selectedFieldId || !selectedSoilId || !selectedPlantId) {
      alert("Iltimos, barcha maydonlarni to'ldiring")
      return
    }
    
    try {
      setLoadingRecommendation(true)
      const result = (await cropRecommendationApi.getRecommendation({
        field_id: selectedFieldId,
        soil_id: selectedSoilId,
        plant_id: selectedPlantId,
      })) as any
      setRecommendation(result?.data || result)
    } catch (err) {
      console.error("Failed to get recommendation:", err)
      alert("Tavsiya olishda xatolik yuz berdi")
    } finally {
      setLoadingRecommendation(false)
    }
  }
  
  function renderMarkdown(text: string) {
    if (!text) return null
    
    const lines = text.split('\n')
    const elements: React.ReactElement[] = []
    
    lines.forEach((line, idx) => {
      if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>)
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>)
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-2xl font-bold mt-6 mb-4">{line.replace('# ', '')}</h1>)
      } else if (line.includes('**')) {
        const parts = line.split('**')
        const formatted = parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)
        elements.push(<p key={idx} className="mb-2">{formatted}</p>)
      } else if (line.trim().startsWith('- ')) {
        elements.push(<li key={idx} className="ml-4 mb-1">{line.replace(/^[\s-]*/, '')}</li>)
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(<li key={idx} className="ml-4 mb-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>)
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />)
      } else if (line.trim()) {
        elements.push(<p key={idx} className="mb-2">{line}</p>)
      }
    })
    
    return <div className="prose prose-sm max-w-none">{elements}</div>
  }

  const filteredPlants = plants.filter((plant) => {
    const matchesCategory = selectedCategory === null || getCategoryForPlant(plant.id) === selectedCategory
    return matchesCategory
  })

  const plantsByCategory = filteredPlants.reduce((acc, plant) => {
    const category = getCategoryForPlant(plant.id)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(plant)
    return acc
  }, {} as Record<string, Plant[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ekin Tavsiyasi</h1>
          <p className="text-muted-foreground mt-2">Ekinlar katalogi va AI tavsiyalari</p>
        </div>
        <Button
          onClick={() => {
            loadPlants()
            loadAnalyses()
          }}
          variant="outline"
          className="w-full sm:w-auto gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog">Ekinlar katalogi</TabsTrigger>
          <TabsTrigger value="recommendation">AI Tavsiyasi</TabsTrigger>
        </TabsList>

        {/* Plants Catalog Tab */}
        <TabsContent value="catalog" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtrlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Kategoriya</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Barchasi
                  </Button>
                  {PLANT_CATEGORIES.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plants Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div>
              {selectedCategory === null ? (
                Object.entries(plantsByCategory).map(([category, categoryPlants]) => (
                  <div key={category} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{getCategoryName(category)}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryPlants.map((plant) => {
                        const analyses = plantAnalyses[plant.id] || []
                        const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null
                        
                        return (
                          <Card key={plant.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <CardTitle className="text-lg">{plant.name}</CardTitle>
                              {plant.description && (
                                <CardDescription className="mt-1">{plant.description}</CardDescription>
                              )}
                            </CardHeader>
                            {latestAnalysis && (
                              <CardContent>
                                <div className="space-y-1.5 text-sm">
                                  {(() => {
                                    let fieldName = null
                                    if (latestAnalysis.soil?.field?.name) {
                                      fieldName = latestAnalysis.soil.field.name
                                    } else if (latestAnalysis.soil?.field_id) {
                                      const field = fields.find(f => f.id === latestAnalysis.soil.field_id)
                                      if (field?.name) fieldName = field.name
                                    }
                                    return fieldName ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Dala:</span>
                                        <span className="font-medium">{fieldName}</span>
                                      </div>
                                    ) : null
                                  })()}
                                  {latestAnalysis.soil && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Tuproq:</span>
                                      <span className="font-medium">
                                        {latestAnalysis.soil.name || `Namuna #${latestAnalysis.soil.id}`}
                                      </span>
                                    </div>
                                  )}
                                  {latestAnalysis.soil?.ph !== null && latestAnalysis.soil?.ph !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">pH:</span>
                                      <span className="font-medium">{latestAnalysis.soil.ph.toFixed(2)}</span>
                                    </div>
                                  )}
                                  {latestAnalysis.soil?.humus !== null && latestAnalysis.soil?.humus !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Gumus:</span>
                                      <span className="font-medium">{latestAnalysis.soil.humus.toFixed(2)}%</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            )}
                            {!latestAnalysis && (
                              <CardContent>
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Hozircha tahlil mavjud emas
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlants.map((plant) => {
                    const analyses = plantAnalyses[plant.id] || []
                    const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null
                    
                    return (
                      <Card key={plant.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{plant.name}</CardTitle>
                          {plant.description && (
                            <CardDescription className="mt-1">{plant.description}</CardDescription>
                          )}
                        </CardHeader>
                        {latestAnalysis && (
                          <CardContent>
                            <div className="space-y-1.5 text-sm">
                              {(() => {
                                let fieldName = null
                                if (latestAnalysis.soil?.field?.name) {
                                  fieldName = latestAnalysis.soil.field.name
                                } else if (latestAnalysis.soil?.field_id) {
                                  const field = fields.find(f => f.id === latestAnalysis.soil.field_id)
                                  if (field?.name) fieldName = field.name
                                }
                                return fieldName ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Dala:</span>
                                    <span className="font-medium">{fieldName}</span>
                                  </div>
                                ) : null
                              })()}
                              {latestAnalysis.soil && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Tuproq:</span>
                                  <span className="font-medium">
                                    {latestAnalysis.soil.name || `Namuna #${latestAnalysis.soil.id}`}
                                  </span>
                                </div>
                              )}
                              {latestAnalysis.soil?.ph !== null && latestAnalysis.soil?.ph !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">pH:</span>
                                  <span className="font-medium">{latestAnalysis.soil.ph.toFixed(2)}</span>
                                </div>
                              )}
                              {latestAnalysis.soil?.humus !== null && latestAnalysis.soil?.humus !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Gumus:</span>
                                  <span className="font-medium">{latestAnalysis.soil.humus.toFixed(2)}%</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                        {!latestAnalysis && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Hozircha tahlil mavjud emas
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Crop Recommendation Tab */}
        <TabsContent value="recommendation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Ekin Tavsiyasi
              </CardTitle>
              <CardDescription>
                Dala, tuproq va ekin ma'lumotlariga asoslanib, AI tomonidan tavsiya oling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Dala *</label>
                <select
                  value={selectedFieldId || ""}
                  onChange={(e) => setSelectedFieldId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Dala tanlang...</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Soil Selection */}
              {selectedFieldId && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tuproq namunasi *</label>
                  <select
                    value={selectedSoilId || ""}
                    onChange={(e) => setSelectedSoilId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="">Tuproq tanlang...</option>
                    {filteredSoils.map((soil) => (
                      <option key={soil.id} value={soil.id}>
                        {soil.name || `Namuna #${soil.id}`} • pH: {soil.ph?.toFixed(2) || "—"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Plant Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Ekin *</label>
                <select
                  value={selectedPlantId || ""}
                  onChange={(e) => setSelectedPlantId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Ekin tanlang...</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Get Recommendation Button */}
              <Button
                onClick={handleGetRecommendation}
                disabled={!selectedFieldId || !selectedSoilId || !selectedPlantId || loadingRecommendation}
                className="w-full"
              >
                {loadingRecommendation ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Tavsiya olinmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Tavsiya olish
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recommendation Result */}
          {recommendation && (
            <Card>
              <CardHeader>
                <CardTitle>AI Tavsiyasi</CardTitle>
                <CardDescription>
                  {new Date(recommendation.generated_at || Date.now()).toLocaleString('uz-UZ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendation.recommendation ? (
                  renderMarkdown(recommendation.recommendation)
                ) : (
                  <p className="text-muted-foreground">Tavsiya topilmadi</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

