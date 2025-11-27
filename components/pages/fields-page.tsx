"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MapPin, Trash2, Edit2, RefreshCw, Plus, Cloud } from "lucide-react"
import { fieldsApi } from "@/lib/api"
import dynamic from "next/dynamic"

// Dynamic import (Leaflet faqat browserda ishlaydi)
const FieldsMap = dynamic(() => import("@/components/fields-map").then((mod) => ({ default: mod.FieldsMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg border border-neutral-200 flex items-center justify-center">
      Xarita yuklanmoqda...
    </div>
  ),
})

const CreateFieldMap = dynamic(() => import("@/components/create-field-map").then((mod) => ({ default: mod.CreateFieldMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg border border-neutral-200 flex items-center justify-center">
      Xarita yuklanmoqda...
    </div>
  ),
})
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Field {
  id: number
  name: string
  area_ha: number
  soil_type: string
  center_lat?: number
  center_lng?: number
  geometry?: {
    type: "Polygon"
    coordinates: number[][][]
  }
}

interface FieldWeather {
  temperature: string
  condition: string
  icon?: string
  humidity?: number
  wind?: string
  updatedAt?: string
}

const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json"
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "9a0233c7fc9d447ab2780745252711"

export function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [formData, setFormData] = useState({ name: "", area_ha: "", soil_type: "" })
  const [createFormData, setCreateFormData] = useState({ name: "", area_ha: "", soil_type: "", farm_id: 1 })
  const [geometry, setGeometry] = useState<{ type: "Polygon"; coordinates: number[][][] } | null>(null)
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedFieldForMap, setSelectedFieldForMap] = useState<Field | null>(null)
  const [weatherData, setWeatherData] = useState<Record<number, FieldWeather | null>>({})
  const [weatherLoading, setWeatherLoading] = useState(false)

  useEffect(() => {
    loadFields()
  }, [])

  async function loadFields() {
    try {
      setLoading(true)
      const data = await fieldsApi.list()
      const list = data || []
      setFields(list)
      await loadWeatherForFields(list)
    } catch (err) {
      setFields([])
      setWeatherData({})
    } finally {
      setLoading(false)
    }
  }

  async function loadWeatherForFields(fieldsList: Field[]) {
    if (!fieldsList?.length) {
      setWeatherData({})
      return
    }

    const fieldsWithCoords = fieldsList.filter((field) => field.center_lat && field.center_lng)
    if (!fieldsWithCoords.length) {
      setWeatherData({})
      return
    }

    setWeatherLoading(true)

    try {
      const results = await Promise.all(
        fieldsWithCoords.map(async (field) => {
          const query = `${field.center_lat},${field.center_lng}`
          const url = `${WEATHER_API_URL}?q=${encodeURIComponent(query)}&key=${WEATHER_API_KEY}`

          try {
            const res = await fetch(url)
            if (!res.ok) {
              throw new Error(`Weather API error: ${res.status}`)
            }
            const json = await res.json()
            const current = json?.current
            if (!current) return { id: field.id, data: null }

            const icon = current.condition?.icon
              ? current.condition.icon.startsWith("http")
                ? current.condition.icon
                : `https:${current.condition.icon}`
              : undefined

            const weather: FieldWeather = {
              temperature: `${current.temp_c ?? current.temp_f ?? "—"}${typeof current.temp_c === "number" ? "°C" : ""}`,
              condition: current.condition?.text || "—",
              icon,
              humidity: current.humidity,
              wind:
                typeof current.wind_kph === "number"
                  ? `${current.wind_kph} km/h`
                  : typeof current.wind_mph === "number"
                    ? `${current.wind_mph} mph`
                    : undefined,
              updatedAt: current.last_updated,
            }
            return { id: field.id, data: weather }
          } catch (error) {
            console.error("Weather fetch failed for field", field.id, error)
            return { id: field.id, data: null }
          }
        }),
      )

      const map: Record<number, FieldWeather | null> = {}
      results.forEach((result) => {
        if (!result) return
        map[result.id] = result.data
      })
      setWeatherData(map)
    } finally {
      setWeatherLoading(false)
    }
  }

  function handleEdit(field: Field) {
    setEditingField(field)
    setFormData({
      name: field.name || "",
      area_ha: field.area_ha?.toString() || "",
      soil_type: field.soil_type || "",
    })
    setOpenDialog(true)
  }

  function handleCloseDialog() {
    setOpenDialog(false)
    setEditingField(null)
    setFormData({ name: "", area_ha: "", soil_type: "" })
  }

  function handleCloseCreateDialog() {
    setOpenCreateDialog(false)
    setCreateFormData({ name: "", area_ha: "", soil_type: "", farm_id: 1 })
    setGeometry(null)
    setCenter(null)
  }

  async function handleCreate() {
    if (!createFormData.name || !createFormData.area_ha) return
    try {
      setCreating(true)
      const data: any = {
        farm_id: createFormData.farm_id,
        name: createFormData.name,
        area_ha: parseFloat(createFormData.area_ha),
        soil_type: createFormData.soil_type || null,
      }
      if (geometry) {
        data.geometry = geometry
      }
      if (center) {
        data.center_lat = center.lat
        data.center_lng = center.lng
      }
      await fieldsApi.create(data)
      handleCloseCreateDialog()
      await loadFields()
    } catch (err) {
      console.error("Create failed:", err)
      alert("Dalani yaratib bo'lmadi. Iltimos, qayta urinib ko'ring.")
    } finally {
      setCreating(false)
    }
  }

  function handleShowOnMap(field: Field) {
    setSelectedFieldForMap(field)
  }

  async function handleUpdate() {
    if (!editingField || !formData.name || !formData.area_ha) return
    try {
      setSaving(true)
      await fieldsApi.update(editingField.id, {
        name: formData.name,
        area_ha: parseFloat(formData.area_ha),
        soil_type: formData.soil_type || null,
      })
      handleCloseDialog()
      await loadFields()
    } catch (err) {
      console.error("Update failed:", err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(fieldId: number) {
    if (!confirm("Bu dalani o'chirishni xohlaysizmi? Bu amalni keyin qaytarib bo'lmaydi.")) {
      return
    }
    try {
      setDeletingId(fieldId)
      await fieldsApi.delete(fieldId)
      await loadFields()
    } catch (err) {
      console.error("Delete failed:", err)
      alert("Dalani o'chirishda xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dalalar</h1>
          <p className="text-muted-foreground mt-1">Fermer xo‘jaligingizdagi barcha dalalarni boshqaring</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setOpenCreateDialog(true)} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Yangi dala
          </Button>
          <Button variant="outline" onClick={loadFields} disabled={loading} className="flex-1 sm:flex-none gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Yangilash
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dalani tahrirlash</DialogTitle>
            <DialogDescription>Dala ma’lumotlarini yangilang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Dala nomi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Maydon (ga)"
              value={formData.area_ha}
              onChange={(e) => setFormData({ ...formData, area_ha: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Tuproq turi"
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Bekor qilish
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? "Saqlanmoqda..." : "O‘zgarishlarni saqlash"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Field Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi dala qo‘shish</DialogTitle>
            <DialogDescription>Fermer xo‘jaligingizga yangi dala qo‘shing. Chegaralarni xaritada chizing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dala nomi *</label>
              <input
                type="text"
                placeholder="Dala nomi"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maydon (ga) *</label>
              <input
                type="number"
                placeholder="Maydon (ga)"
                value={createFormData.area_ha}
                onChange={(e) => setCreateFormData({ ...createFormData, area_ha: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tuproq turi</label>
              <input
                type="text"
                placeholder="Tuproq turi"
                value={createFormData.soil_type}
                onChange={(e) => setCreateFormData({ ...createFormData, soil_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dala chegaralari (xaritada chizing)</label>
              <CreateFieldMap
                onGeometryChange={(geo, cent) => {
                  setGeometry(geo)
                  setCenter(cent)
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseCreateDialog} disabled={creating}>
                Bekor qilish
              </Button>
              <Button onClick={handleCreate} disabled={creating || !createFormData.name || !createFormData.area_ha}>
                {creating ? "Yaratilmoqda..." : "Dala yaratish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show Field on Map Dialog */}
      <Dialog open={!!selectedFieldForMap} onOpenChange={() => setSelectedFieldForMap(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFieldForMap?.name} — joylashuvi</DialogTitle>
            <DialogDescription>Dalaning xaritadagi ko‘rinishi</DialogDescription>
          </DialogHeader>
          {selectedFieldForMap && (
            <div className="w-full h-[500px]">
              <FieldsMap fields={[selectedFieldForMap]} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Barcha dalalar</CardTitle>
          <CardDescription>Jami: {fields.length} ta dala</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Dalalar yuklanmoqda...</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Hozircha dala mavjud emas</p>
              <p className="text-sm text-muted-foreground mt-1">Boshlash uchun birinchi dalani yarating</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dala nomi</TableHead>
                  <TableHead>Maydon (ga)</TableHead>
                  <TableHead>Tuproq turi</TableHead>
                  <TableHead>Joylashuv</TableHead>
                  <TableHead>Ob-havo</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.name}</TableCell>
                    <TableCell>{field.area_ha}</TableCell>
                    <TableCell>{field.soil_type || "—"}</TableCell>
                    <TableCell>
                      {field.center_lat && field.center_lng ? (
                        <button
                          onClick={() => handleShowOnMap(field)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          <MapPin className="w-4 h-4" />
                          {field.center_lat.toFixed(4)}, {field.center_lng.toFixed(4)}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {field.center_lat && field.center_lng ? (
                        (() => {
                          const weather = weatherData[field.id]
                          if (weatherLoading && weather === undefined) {
                            return <span className="text-xs text-muted-foreground">Yuklanmoqda...</span>
                          }
                          if (!weather) {
                            return <span className="text-xs text-muted-foreground">Ma'lumot yo'q</span>
                          }
                          return (
                            <div className="flex items-center gap-3">
                              {weather.icon ? (
                                <img
                                  src={weather.icon}
                                  alt={weather.condition}
                                  className="h-8 w-8"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                                  <Cloud className="h-4 w-4 text-neutral-500" />
                                </div>
                              )}
                              <div className="text-xs leading-tight">
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {weather.temperature || "—"}
                                </p>
                                <p className="text-muted-foreground">
                                  {weather.condition}
                                  {weather.humidity ? ` · ${weather.humidity}%` : ""}
                                </p>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <span className="text-xs text-muted-foreground">Koordinata yo'q</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(field)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(field.id)}
                          disabled={deletingId === field.id}
                        >
                          <Trash2 className={`w-4 h-4 text-destructive ${deletingId === field.id ? "opacity-50" : ""}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
