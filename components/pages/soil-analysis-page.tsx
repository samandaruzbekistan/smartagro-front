"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Trash2, Edit2, RefreshCw } from "lucide-react"
import { soilsApi, fieldsApi, analysesApi, elementsApi, reportsApi } from "@/lib/api"
import { AiAnalysisCard } from "@/components/ai-analysis-card"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Field {
  id: number
  name: string
}

interface Soil {
  id: number
  field_id: number
  name: string | null
  sampled_at: string | null
  humus: number | null
  texture: string | null
  // Makro elementlar
  nitrogen: number | null
  phosphorus: number | null
  potassium: number | null
  magnesium: number | null
  calcium: number | null
  sulfur: number | null
  sodium: number | null
  // Mikro elementlar
  boron: number | null
  copper: number | null
  iron: number | null
  molybdenum: number | null
  manganese: number | null
  cobalt: number | null
  zinc: number | null
  chromium: number | null
  // pH
  ph: number | null
  // Og'ir metallar
  lead: number | null
  mercury: number | null
  cadmium: number | null
  silver: number | null
  field?: Field
}

const TEXTURE_OPTIONS = [
  { value: "sandy", label: "Qumloq" },
  { value: "loamy_sand", label: "Qumloq-soz" },
  { value: "sandy_loam", label: "Soz-qumloq" },
  { value: "loam", label: "Soz (Loam)" },
  { value: "silt_loam", label: "Gil-soz" },
  { value: "silt", label: "Gil" },
  { value: "clay_loam", label: "Loy-soz" },
  { value: "clay", label: "Loy" },
]

function getPhRecommendation(ph: number | null): { text: string; variant: "default" | "destructive" | "secondary" | "outline" } {
  if (ph === null) return { text: "Ma'lumot yo'q", variant: "outline" }
  if (ph < 5.5) return { text: "Juda kislotali - ohak kerak", variant: "destructive" }
  if (ph > 7.5) return { text: "Ishqoriy - organik modda kerak", variant: "secondary" }
  return { text: "Maqbul", variant: "default" }
}

export function SoilAnalysisPage() {
  const [soils, setSoils] = useState<Soil[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSoil, setEditingSoil] = useState<Soil | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [viewingAnalysisId, setViewingAnalysisId] = useState<number | null>(null)
  const [viewingSoilId, setViewingSoilId] = useState<number | null>(null)
  const [selectedFieldIdModal, setSelectedFieldIdModal] = useState<number | null>(null)
  const [selectedSoilIdModal, setSelectedSoilIdModal] = useState<number | null>(null)
  const [filteredSoilsModal, setFilteredSoilsModal] = useState<Soil[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])

  // Form data
  const [formData, setFormData] = useState({
    field_id: "",
    name: "",
    sampled_at: "",
    humus: "",
    texture: "",
    // Makro
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    magnesium: "",
    calcium: "",
    sulfur: "",
    sodium: "",
    // Mikro
    boron: "",
    copper: "",
    iron: "",
    molybdenum: "",
    manganese: "",
    cobalt: "",
    zinc: "",
    chromium: "",
    // pH
    ph: "",
    // Og'ir metallar
    lead: "",
    mercury: "",
    cadmium: "",
    silver: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [soilsData, fieldsData] = await Promise.all([soilsApi.list(), fieldsApi.list()])
      setSoils(soilsData || [])
      setFields(fieldsData || [])
    } catch (err) {
      setSoils([])
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  function handleViewAnalysis(soilId: number) {
    // Instantly open modal - no API calls needed!
    setViewingSoilId(soilId)
    setSelectedSoilIdModal(soilId)
    
    // Find soil in already loaded data
    const currentSoil = soils.find(s => s.id === soilId)
    
    if (currentSoil?.field_id) {
      setSelectedFieldIdModal(currentSoil.field_id)
      
      // Load field soils asynchronously in background (non-blocking)
      soilsApi.list(currentSoil.field_id)
        .then(soilsList => {
          setFilteredSoilsModal(Array.isArray(soilsList) ? soilsList : (soilsList as any)?.data || [])
        })
        .catch(err => {
          console.error("Failed to load field soils:", err)
          setFilteredSoilsModal([currentSoil]) // At least show current soil
        })
    }
  }

  async function createAnalysisFromSoil(soil: Soil) {
    try {

      // Get elements list from API to map codes to IDs
      const elementsList = (await elementsApi.list()) as any
      const elementsData = Array.isArray(elementsList) ? elementsList : elementsList?.data || []
      
      // Create mapping: code -> id
      const elementMap: Record<string, number> = {}
      elementsData.forEach((el: any) => {
        if (el.code && el.id) {
          elementMap[el.code.toUpperCase()] = el.id
        }
      })

      // Build elements array from soil data using correct element IDs
      const elements: any[] = []
      
      // Macro elements
      if (soil.nitrogen !== null && elementMap["N"]) {
        elements.push({ element_id: elementMap["N"], value: soil.nitrogen })
      }
      if (soil.phosphorus !== null && elementMap["P"]) {
        elements.push({ element_id: elementMap["P"], value: soil.phosphorus })
      }
      if (soil.potassium !== null && elementMap["K"]) {
        elements.push({ element_id: elementMap["K"], value: soil.potassium })
      }
      if (soil.magnesium !== null && elementMap["MG"]) {
        elements.push({ element_id: elementMap["MG"], value: soil.magnesium })
      }
      if (soil.calcium !== null && elementMap["CA"]) {
        elements.push({ element_id: elementMap["CA"], value: soil.calcium })
      }
      if (soil.sulfur !== null && elementMap["S"]) {
        elements.push({ element_id: elementMap["S"], value: soil.sulfur })
      }
      if (soil.sodium !== null && elementMap["NA"]) {
        elements.push({ element_id: elementMap["NA"], value: soil.sodium })
      }

      // Micro elements
      if (soil.boron !== null && elementMap["B"]) {
        elements.push({ element_id: elementMap["B"], value: soil.boron })
      }
      if (soil.copper !== null && elementMap["CU"]) {
        elements.push({ element_id: elementMap["CU"], value: soil.copper })
      }
      if (soil.iron !== null && elementMap["FE"]) {
        elements.push({ element_id: elementMap["FE"], value: soil.iron })
      }
      if (soil.molybdenum !== null && elementMap["MO"]) {
        elements.push({ element_id: elementMap["MO"], value: soil.molybdenum })
      }
      if (soil.manganese !== null && elementMap["MN"]) {
        elements.push({ element_id: elementMap["MN"], value: soil.manganese })
      }
      if (soil.cobalt !== null && elementMap["CO"]) {
        elements.push({ element_id: elementMap["CO"], value: soil.cobalt })
      }
      if (soil.zinc !== null && elementMap["ZN"]) {
        elements.push({ element_id: elementMap["ZN"], value: soil.zinc })
      }
      if (soil.chromium !== null && elementMap["CR"]) {
        elements.push({ element_id: elementMap["CR"], value: soil.chromium })
      }

      if (elements.length === 0) {
        toast.error("Tuproq namunasida element qiymatlari topilmadi")
        return
      }

      // Get or create a report
      let reportId: number | null = null
      try {
        const reports = (await reportsApi.list()) as any
        const reportsData = Array.isArray(reports) ? reports : reports?.data || []
        
        if (reportsData.length > 0) {
          // Use first available report
          reportId = reportsData[0].id
        } else {
          // Create a new report
          const field = fields.find((f) => f.id === soil.field_id)
          const newReport = (await reportsApi.create({
            farm_id: 1, // Default farm_id, adjust if needed
            name: `Auto Report - ${soil.name || `Soil #${soil.id}`}`,
            description: `Auto-created report for soil analysis`,
            reported_at: new Date().toISOString().split("T")[0],
          })) as any
          reportId = newReport?.data?.id || newReport?.id
        }
      } catch (err) {
        console.error("Failed to get/create report:", err)
        toast.error("Hisobot yaratishda xatolik")
        return
      }

      if (!reportId) {
        toast.error("Hisobot yaratib bo'lmadi")
        return
      }

      // Create analysis
      const analysisData: any = {
        report_id: reportId,
        soil_id: soil.id,
        plant_id: null,
        notes: `Auto-created from soil sample: ${soil.name || `Soil #${soil.id}`}`,
        elements: elements,
      }

      const created = (await analysesApi.create(analysisData)) as any
      const newAnalysis = created?.data || created
      if (newAnalysis?.id) {
        setViewingAnalysisId(newAnalysis.id)
        await loadData() // Refresh soils list
      }
    } catch (err) {
      console.error("Failed to create analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      alert(`Failed to create analysis automatically. Error: ${errorMessage}`)
    }
  }

  function handleEdit(soil: Soil) {
    setEditingSoil(soil)
    setFormData({
      field_id: soil.field_id.toString(),
      name: soil.name || "",
      sampled_at: soil.sampled_at ? soil.sampled_at.split("T")[0] : "",
      humus: soil.humus?.toString() || "",
      texture: soil.texture || "",
      nitrogen: soil.nitrogen?.toString() || "",
      phosphorus: soil.phosphorus?.toString() || "",
      potassium: soil.potassium?.toString() || "",
      magnesium: soil.magnesium?.toString() || "",
      calcium: soil.calcium?.toString() || "",
      sulfur: soil.sulfur?.toString() || "",
      sodium: soil.sodium?.toString() || "",
      boron: soil.boron?.toString() || "",
      copper: soil.copper?.toString() || "",
      iron: soil.iron?.toString() || "",
      molybdenum: soil.molybdenum?.toString() || "",
      manganese: soil.manganese?.toString() || "",
      cobalt: soil.cobalt?.toString() || "",
      zinc: soil.zinc?.toString() || "",
      chromium: soil.chromium?.toString() || "",
      ph: soil.ph?.toString() || "",
      lead: soil.lead?.toString() || "",
      mercury: soil.mercury?.toString() || "",
      cadmium: soil.cadmium?.toString() || "",
      silver: soil.silver?.toString() || "",
    })
    setOpenDialog(true)
  }

  function handleCloseDialog() {
    setOpenDialog(false)
    setEditingSoil(null)
    setFormData({
      field_id: "",
      name: "",
      sampled_at: "",
      humus: "",
      texture: "",
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      magnesium: "",
      calcium: "",
      sulfur: "",
      sodium: "",
      boron: "",
      copper: "",
      iron: "",
      molybdenum: "",
      manganese: "",
      cobalt: "",
      zinc: "",
      chromium: "",
      ph: "",
      lead: "",
      mercury: "",
      cadmium: "",
      silver: "",
    })
  }

  function parseNumber(value: string): number | null {
    if (!value || value.trim() === "") return null
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  async function handleSave() {
    if (!formData.field_id) {
      toast.error("Dala tanlanishi kerak")
      return
    }

    try {
      setSaving(true)
      const data: any = {
        field_id: parseInt(formData.field_id),
        name: formData.name || null,
        sampled_at: formData.sampled_at || null,
        humus: parseNumber(formData.humus),
        texture: formData.texture || null,
        nitrogen: parseNumber(formData.nitrogen),
        phosphorus: parseNumber(formData.phosphorus),
        potassium: parseNumber(formData.potassium),
        magnesium: parseNumber(formData.magnesium),
        calcium: parseNumber(formData.calcium),
        sulfur: parseNumber(formData.sulfur),
        sodium: parseNumber(formData.sodium),
        boron: parseNumber(formData.boron),
        copper: parseNumber(formData.copper),
        iron: parseNumber(formData.iron),
        molybdenum: parseNumber(formData.molybdenum),
        manganese: parseNumber(formData.manganese),
        cobalt: parseNumber(formData.cobalt),
        zinc: parseNumber(formData.zinc),
        chromium: parseNumber(formData.chromium),
        ph: parseNumber(formData.ph),
        lead: parseNumber(formData.lead),
        mercury: parseNumber(formData.mercury),
        cadmium: parseNumber(formData.cadmium),
        silver: parseNumber(formData.silver),
      }

      if (editingSoil) {
        await soilsApi.update(editingSoil.id, data)
      } else {
        await soilsApi.create(data)
      }

      handleCloseDialog()
      await loadData()
    } catch (err) {
      console.error("Save failed:", err)
      toast.error("Tuproq namunasini saqlashda xatolik")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(soilId: number) {
    if (!confirm("Are you sure you want to delete this soil sample? This action cannot be undone.")) {
      return
    }
    try {
      setDeletingId(soilId)
      await soilsApi.delete(soilId)
      await loadData()
    } catch (err) {
      console.error("Delete failed:", err)
      toast.error("Tuproq namunasini o'chirishda xatolik")
    } finally {
      setDeletingId(null)
    }
  }

  const avgPh = soils.length > 0 ? (soils.reduce((sum, s) => sum + (s.ph || 0), 0) / soils.length).toFixed(2) : "—"
  const avgHumus =
    soils.length > 0 ? (soils.reduce((sum, s) => sum + (s.humus || 0), 0) / soils.length).toFixed(2) : "—"

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="space-y-6 relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Tuproq tahlili</h1>
          <p className="text-black dark:text-zinc-400 mt-1">Tuproq namunalari va tahlil natijalari</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Yangilash
          </Button>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yangi namuna
          </Button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSoil ? "Tuproq namunasi tahrirlash" : "Yangi tuproq namunasi"}</DialogTitle>
            <DialogDescription>
              {editingSoil ? "Tuproq namunasi ma'lumotlarini yangilash" : "Tahlil ma'lumotlari bilan yangi tuproq namunasi qo'shish"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Asosiy</TabsTrigger>
              <TabsTrigger value="macro">Makro</TabsTrigger>
              <TabsTrigger value="micro">Mikro</TabsTrigger>
              <TabsTrigger value="ph">pH</TabsTrigger>
              <TabsTrigger value="metals">Og'ir metallar</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dala *</label>
                <select
                  value={formData.field_id}
                  onChange={(e) => setFormData({ ...formData, field_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Dala tanlang...</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Namuna nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Sample name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Olingan sana</label>
                <input
                  type="date"
                  value={formData.sampled_at}
                  onChange={(e) => setFormData({ ...formData, sampled_at: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gumus (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.humus}
                  onChange={(e) => setFormData({ ...formData, humus: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tuzilishi</label>
                <select
                  value={formData.texture}
                  onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Tuzilish tanlang...</option>
                  {TEXTURE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </TabsContent>

            <TabsContent value="macro" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nitrogen (N) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phosphorus (P) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Potassium (K) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Magnesium (Mg) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.magnesium}
                    onChange={(e) => setFormData({ ...formData, magnesium: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Calcium (Ca) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.calcium}
                    onChange={(e) => setFormData({ ...formData, calcium: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sulfur (S) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sulfur}
                    onChange={(e) => setFormData({ ...formData, sulfur: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sodium (Na) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="micro" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Boron (B) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.boron}
                    onChange={(e) => setFormData({ ...formData, boron: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Copper (Cu) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.copper}
                    onChange={(e) => setFormData({ ...formData, copper: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Iron (Fe) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.iron}
                    onChange={(e) => setFormData({ ...formData, iron: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Molybdenum (Mo) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.molybdenum}
                    onChange={(e) => setFormData({ ...formData, molybdenum: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Manganese (Mn) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.manganese}
                    onChange={(e) => setFormData({ ...formData, manganese: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cobalt (Co) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cobalt}
                    onChange={(e) => setFormData({ ...formData, cobalt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Zinc (Zn) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.zinc}
                    onChange={(e) => setFormData({ ...formData, zinc: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Chromium (Cr) mg/kg</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.chromium}
                    onChange={(e) => setFormData({ ...formData, chromium: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ph" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">pH Level (0-14)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0-14"
                />
                {formData.ph && (
                  <Badge variant={getPhRecommendation(parseNumber(formData.ph)).variant} className="mt-2 text-xs font-normal">
                    {getPhRecommendation(parseNumber(formData.ph)).text}
                  </Badge>
                )}
              </div>
            </TabsContent>

            <TabsContent value="metals" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Lead (Pb) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.lead}
                    onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mercury (Hg) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.mercury}
                    onChange={(e) => setFormData({ ...formData, mercury: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cadmium (Cd) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cadmium}
                    onChange={(e) => setFormData({ ...formData, cadmium: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Silver (Ag) mg/kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.silver}
                    onChange={(e) => setFormData({ ...formData, silver: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.field_id}>
              {saving ? "Saqlanmoqda..." : editingSoil ? "Yangilash" : "Yaratish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jami namunalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soils.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">O'rtacha pH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPh}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">O'rtacha Gumus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHumus}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : soils.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tuproq namunalari yozilmagan</p>
              <p className="text-sm text-muted-foreground mt-1">Boshlash uchun birinchi namunani yarating</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dala</TableHead>
                  <TableHead>Namuna nomi</TableHead>
                  <TableHead>pH</TableHead>
                  <TableHead>Gumus (%)</TableHead>
                  <TableHead>Tuzilishi</TableHead>
                  <TableHead>Olingan sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soils.map((soil) => {
                  const phRec = getPhRecommendation(soil.ph)
                  return (
                    <TableRow key={soil.id}>
                      <TableCell className="font-medium">{soil.field?.name || `Field #${soil.field_id}`}</TableCell>
                      <TableCell>{soil.name || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{soil.ph?.toFixed(2) || "—"}</span>
                          {soil.ph && (
                            <Badge variant={phRec.variant} className="text-xs font-normal">
                              {phRec.text}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{soil.humus?.toFixed(2) || "—"}</TableCell>
                      <TableCell>
                        {soil.texture
                          ? TEXTURE_OPTIONS.find((opt) => opt.value === soil.texture)?.label || soil.texture
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {soil.sampled_at ? new Date(soil.sampled_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewAnalysis(soil.id)}
                          >
                            <Sparkles className="w-4 h-4 mr-1.5" />
                            AI Tahlil
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(soil)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(soil.id)}
                            disabled={deletingId === soil.id}
                          >
                            <Trash2 className={`w-4 h-4 text-destructive ${deletingId === soil.id ? "opacity-50" : ""}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Analysis View Dialog */}
      <Dialog open={!!viewingSoilId} onOpenChange={() => {
        setViewingAnalysisId(null)
        setViewingSoilId(null)
        setSelectedFieldIdModal(null)
        setSelectedSoilIdModal(null)
        setFilteredSoilsModal([])
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">AI Tuproq Tahlili</DialogTitle>
            <DialogDescription className="text-base">
              Dala va tuproq namunasini tanlang, so'ngra AI tahlil ko'ring
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Field and Soil Selection */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Ma'lumotlarni tanlash</CardTitle>
                <CardDescription>
                  AI tahlil uchun dala va tuproq namunasini tanlang
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Dala <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={selectedFieldIdModal || ""}
                      onChange={async (e) => {
                        const fieldId = e.target.value ? Number(e.target.value) : null
                        setSelectedFieldIdModal(fieldId)
                        setSelectedSoilIdModal(null)
                        
                        if (fieldId) {
                          try {
                            const soilsList = await soilsApi.list(fieldId)
                            setFilteredSoilsModal(Array.isArray(soilsList) ? soilsList : (soilsList as any)?.data || [])
                          } catch (err) {
                            console.error("Failed to load soils:", err)
                            setFilteredSoilsModal([])
                          }
                        } else {
                          setFilteredSoilsModal([])
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Dala tanlang...</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name}
                        </option>
                      ))}
                    </select>
                  </div>

                {selectedFieldIdModal && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Tuproq namunasi <span className="text-destructive">*</span>
                    </label>
                    {!filteredSoilsModal || filteredSoilsModal.length === 0 ? (
                      <div className="rounded-md bg-muted px-4 py-3">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Yuklanmoqda...
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedSoilIdModal || ""}
                        onChange={(e) => {
                          const soilId = e.target.value ? Number(e.target.value) : null
                          setSelectedSoilIdModal(soilId)
                          setViewingSoilId(soilId)
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Tuproq namunasi tanlang...</option>
                        {filteredSoilsModal.map((soil) => (
                          <option key={soil.id} value={soil.id}>
                            {soil.name || `Namuna #${soil.id}`} {soil.sampled_at ? `(${new Date(soil.sampled_at).toLocaleDateString()})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Soil Analysis Info */}
            {selectedSoilIdModal && filteredSoilsModal.find(s => s.id === selectedSoilIdModal) && (
              <Card className="border-2 bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Tuproq ma'lumotlari</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const selectedSoil = filteredSoilsModal.find(s => s.id === selectedSoilIdModal)
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">pH</p>
                          <p className="text-2xl font-bold">{selectedSoil?.ph?.toFixed(2) || "—"}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gumus</p>
                          <p className="text-2xl font-bold">{selectedSoil?.humus?.toFixed(2) || "—"}%</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tuzilishi</p>
                          <p className="text-xl font-semibold">{selectedSoil?.texture || "—"}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sana</p>
                          <p className="text-xl font-semibold">
                            {selectedSoil?.sampled_at
                              ? new Date(selectedSoil.sampled_at).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {viewingSoilId && (
              <AiAnalysisCard soilId={viewingSoilId} type="soil" />
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
