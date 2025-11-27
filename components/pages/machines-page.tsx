"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle, Trash2, Edit2, Wrench, FileText, RefreshCw } from "lucide-react"
import { machinesApi, fieldsApi } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MachineType = "tractor" | "combine" | "implement" | "other"
type MaintenanceType = "oil_change" | "filter_change" | "repair" | "tire_change" | "inspection" | "other"
type OperationType = "plowing" | "sowing" | "cultivating" | "spraying" | "harvesting" | "transport" | "other"

interface Machine {
  id: number
  farm_id: number
  name: string
  type: MachineType
  brand?: string | null
  model?: string | null
  year?: number | null
  engine_hours: number
  service_interval_hours?: number | null
  last_service_hours?: number | null
  last_service_date?: string | null
  created_at: string
  updated_at: string
}

interface MaintenanceRecord {
  id: number
  machine_id: number
  date: string
  type: MaintenanceType
  cost?: number
  engine_hours_at_service?: number
  description?: string
  created_at: string
}

interface WorkLog {
  id: number
  machine_id: number
  farm_id: number
  field_id?: number
  crop_season_id?: number
  date: string
  operation: OperationType
  hours?: number
  area_ha?: number
  fuel_liters?: number
  field?: { id: number; name: string }
  created_at: string
}

interface Field {
  id: number
  name: string
}

const MACHINE_TYPES = [
  { value: "tractor", label: "Traktor" },
  { value: "combine", label: "Kombayn" },
  { value: "implement", label: "Qurilma" },
  { value: "other", label: "Boshqa" },
]

const MAINTENANCE_TYPES = [
  { value: "oil_change", label: "Moy almashtirish" },
  { value: "filter_change", label: "Filtr almashtirish" },
  { value: "repair", label: "Ta'mirlash" },
  { value: "tire_change", label: "Shinalarni almashtirish" },
  { value: "inspection", label: "Tekshirish" },
  { value: "other", label: "Boshqa" },
]

const OPERATION_TYPES = [
  { value: "plowing", label: "Haydash" },
  { value: "sowing", label: "Ekish" },
  { value: "cultivating", label: "Kultivatsiya" },
  { value: "spraying", label: "Purkash" },
  { value: "harvesting", label: "Hosilni yig'ish" },
  { value: "transport", label: "Tashish" },
  { value: "other", label: "Boshqa" },
]

export function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false)
  const [openWorkLogDialog, setOpenWorkLogDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    farm_id: "1",
    name: "",
    type: "tractor" as MachineType,
    brand: "",
    model: "",
    year: "",
    engine_hours: "",
    service_interval_hours: "",
  })

  const [maintenanceFormData, setMaintenanceFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "oil_change" as MaintenanceType,
    cost: "",
    engine_hours_at_service: "",
    description: "",
  })

  const [workLogFormData, setWorkLogFormData] = useState({
    farm_id: "1",
    field_id: "",
    date: new Date().toISOString().split("T")[0],
    operation: "plowing" as OperationType,
    hours: "",
    area_ha: "",
    fuel_liters: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [machinesData, fieldsData] = await Promise.all([machinesApi.list(), fieldsApi.list()])
      setMachines(machinesData || [])
      setFields(fieldsData || [])
    } catch (err) {
      console.error("Failed to load data:", err)
      setMachines([])
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(machine: Machine) {
    setEditingMachine(machine)
    setFormData({
      farm_id: machine.farm_id.toString(),
      name: machine.name,
      type: machine.type,
      brand: machine.brand || "",
      model: machine.model || "",
      year: machine.year?.toString() || "",
      engine_hours: machine.engine_hours?.toString() || "",
      service_interval_hours: machine.service_interval_hours?.toString() || "",
    })
    setOpenDialog(true)
  }

  function handleCloseDialog() {
    setOpenDialog(false)
    setEditingMachine(null)
    setFormData({
      farm_id: "1",
      name: "",
      type: "tractor",
      brand: "",
      model: "",
      year: "",
      engine_hours: "",
      service_interval_hours: "",
    })
  }

  async function handleSave() {
    if (!formData.name || !formData.type) {
      alert("Iltimos, texnika nomi va turini kiriting")
      return
    }

    try {
      setSaving(true)
      const data: any = {
        farm_id: parseInt(formData.farm_id),
        name: formData.name,
        type: formData.type,
        brand: formData.brand || null,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year) : null,
        engine_hours: formData.engine_hours ? parseFloat(formData.engine_hours) : 0,
        service_interval_hours: formData.service_interval_hours ? parseFloat(formData.service_interval_hours) : null,
      }

      if (editingMachine) {
        await machinesApi.update(editingMachine.id, data)
      } else {
        await machinesApi.create(data)
      }

      handleCloseDialog()
      await loadData()
    } catch (err) {
      console.error("Failed to save:", err)
      alert("Saqlashda xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Texnikani o'chirishni tasdiqlaysizmi?")) return

    try {
      setDeletingId(id)
      await machinesApi.delete(id)
      await loadData()
    } catch (err) {
      console.error("Failed to delete:", err)
      alert("O'chirishda xatolik yuz berdi")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleViewDetails(machine: Machine) {
    try {
      setSelectedMachine(machine)
      setOpenViewDialog(true)
      const [maintenanceData, workLogsData] = await Promise.all([
        machinesApi.getMaintenance(machine.id),
        machinesApi.getWorkLogs(machine.id),
      ])
      setMaintenanceRecords(Array.isArray(maintenanceData) ? maintenanceData : maintenanceData?.data || [])
      setWorkLogs(Array.isArray(workLogsData) ? workLogsData : workLogsData?.data || [])
    } catch (err) {
      console.error("Failed to load details:", err)
    }
  }

  async function handleAddMaintenance() {
    if (!selectedMachine || !maintenanceFormData.date || !maintenanceFormData.type) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring")
      return
    }

    try {
      setSaving(true)
      const data: any = {
        date: maintenanceFormData.date,
        type: maintenanceFormData.type,
        cost: maintenanceFormData.cost ? parseFloat(maintenanceFormData.cost) : null,
        engine_hours_at_service: maintenanceFormData.engine_hours_at_service
          ? parseFloat(maintenanceFormData.engine_hours_at_service)
          : null,
        description: maintenanceFormData.description || null,
      }

      await machinesApi.addMaintenance(selectedMachine.id, data)
      setOpenMaintenanceDialog(false)
      setMaintenanceFormData({
        date: new Date().toISOString().split("T")[0],
        type: "oil_change",
        cost: "",
        engine_hours_at_service: "",
        description: "",
      })

      // Reload details
      const maintenanceData = await machinesApi.getMaintenance(selectedMachine.id)
      setMaintenanceRecords(Array.isArray(maintenanceData) ? maintenanceData : maintenanceData?.data || [])
      await loadData() // Reload machines to update last_service_date
    } catch (err) {
      console.error("Failed to add maintenance:", err)
      alert("Ta'mirlash yozuvini qo'shishda xatolik")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddWorkLog() {
    if (!selectedMachine || !workLogFormData.date || !workLogFormData.operation) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring")
      return
    }

    try {
      setSaving(true)
      const data: any = {
        farm_id: parseInt(workLogFormData.farm_id),
        field_id: workLogFormData.field_id ? parseInt(workLogFormData.field_id) : null,
        date: workLogFormData.date,
        operation: workLogFormData.operation,
        hours: workLogFormData.hours ? parseFloat(workLogFormData.hours) : null,
        area_ha: workLogFormData.area_ha ? parseFloat(workLogFormData.area_ha) : null,
        fuel_liters: workLogFormData.fuel_liters ? parseFloat(workLogFormData.fuel_liters) : null,
      }

      await machinesApi.addWorkLog(selectedMachine.id, data)
      setOpenWorkLogDialog(false)
      setWorkLogFormData({
        farm_id: "1",
        field_id: "",
        date: new Date().toISOString().split("T")[0],
        operation: "plowing",
        hours: "",
        area_ha: "",
        fuel_liters: "",
      })

      // Reload details
      const workLogsData = await machinesApi.getWorkLogs(selectedMachine.id)
      setWorkLogs(Array.isArray(workLogsData) ? workLogsData : workLogsData?.data || [])
      await loadData() // Reload machines to update engine_hours
    } catch (err) {
      console.error("Failed to add work log:", err)
      alert("Ish yozuvini qo'shishda xatolik")
    } finally {
      setSaving(false)
    }
  }

  const maintenanceDue = machines.filter((m) => {
    if (!m.service_interval_hours || !m.last_service_hours) return false
    return m.engine_hours - m.last_service_hours >= m.service_interval_hours
  }).length

  const getTypeLabel = (type: string) => {
    return MACHINE_TYPES.find((t) => t.value === type)?.label || type
  }

  const getMaintenanceTypeLabel = (type: string) => {
    return MAINTENANCE_TYPES.find((t) => t.value === type)?.label || type
  }

  const getOperationTypeLabel = (type: string) => {
    return OPERATION_TYPES.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Texnika</h1>
          <p className="text-muted-foreground mt-1">Qishloq xo'jaligi texnikasini boshqarish</p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi texnika
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMachine ? "Texnikani tahrirlash" : "Yangi texnika qo'shish"}</DialogTitle>
            <DialogDescription>Texnika ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Texnika nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Masalan: Traktor #1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Turi *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MachineType })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {MACHINE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brend</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Masalan: John Deere"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Masalan: 6130M"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Yili</label>
                <input
                  type="number"
                  min="1950"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="2020"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dvigatel soatlari</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.engine_hours}
                  onChange={(e) => setFormData({ ...formData, engine_hours: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="1250.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Texnik xizmat oralig'i (soat)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.service_interval_hours}
                onChange={(e) => setFormData({ ...formData, service_interval_hours: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="250"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Bekor qilish
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saqlanmoqda..." : editingMachine ? "Yangilash" : "Yaratish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={openViewDialog} onOpenChange={() => setOpenViewDialog(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMachine?.name}</DialogTitle>
            <DialogDescription>
              {selectedMachine?.brand} {selectedMachine?.model} • {selectedMachine?.engine_hours?.toFixed(1)} soat
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="maintenance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="maintenance">Ta'mirlash tarixi</TabsTrigger>
              <TabsTrigger value="worklogs">Ish jurnallari</TabsTrigger>
            </TabsList>
            <TabsContent value="maintenance" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ta'mirlash tarixi</h3>
                <Button size="sm" onClick={() => setOpenMaintenanceDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yangi yozuv
                </Button>
              </div>
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ta'mirlash yozuvlari yo'q</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceRecords.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{getMaintenanceTypeLabel(record.type)}</p>
                            <p className="text-sm text-muted-foreground">{record.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(record.date).toLocaleDateString()} •{" "}
                              {record.engine_hours_at_service?.toFixed(1)} soat
                            </p>
                          </div>
                          {record.cost && (
                            <p className="font-semibold">
                              {record.cost.toLocaleString()} so'm
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="worklogs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ish jurnallari</h3>
                <Button size="sm" onClick={() => setOpenWorkLogDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yangi yozuv
                </Button>
              </div>
              {workLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ish yozuvlari yo'q</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">{getOperationTypeLabel(log.operation)}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.field?.name || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            {log.hours && <p>{log.hours} soat</p>}
                            {log.area_ha && <p>{log.area_ha} ga</p>}
                            {log.fuel_liters && <p>{log.fuel_liters} litr</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add Maintenance Dialog */}
      <Dialog open={openMaintenanceDialog} onOpenChange={setOpenMaintenanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta'mirlash yozuvi qo'shish</DialogTitle>
            <DialogDescription>{selectedMachine?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sana *</label>
              <input
                type="date"
                value={maintenanceFormData.date}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Turi *</label>
              <select
                value={maintenanceFormData.type}
                onChange={(e) =>
                  setMaintenanceFormData({ ...maintenanceFormData, type: e.target.value as MaintenanceType })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                {MAINTENANCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Xarajat (so'm)</label>
              <input
                type="number"
                min="0"
                value={maintenanceFormData.cost}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, cost: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dvigatel soati</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={maintenanceFormData.engine_hours_at_service}
                onChange={(e) =>
                  setMaintenanceFormData({ ...maintenanceFormData, engine_hours_at_service: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder={selectedMachine?.engine_hours?.toString()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Izoh</label>
              <textarea
                value={maintenanceFormData.description}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Ta'mirlash haqida qo'shimcha ma'lumot"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpenMaintenanceDialog(false)} disabled={saving}>
                Bekor qilish
              </Button>
              <Button onClick={handleAddMaintenance} disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Qo'shish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Work Log Dialog */}
      <Dialog open={openWorkLogDialog} onOpenChange={setOpenWorkLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ish yozuvi qo'shish</DialogTitle>
            <DialogDescription>{selectedMachine?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sana *</label>
              <input
                type="date"
                value={workLogFormData.date}
                onChange={(e) => setWorkLogFormData({ ...workLogFormData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operatsiya *</label>
              <select
                value={workLogFormData.operation}
                onChange={(e) => setWorkLogFormData({ ...workLogFormData, operation: e.target.value as OperationType })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {OPERATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dala</label>
              <select
                value={workLogFormData.field_id}
                onChange={(e) => setWorkLogFormData({ ...workLogFormData, field_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Tanlang...</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Soat</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={workLogFormData.hours}
                  onChange={(e) => setWorkLogFormData({ ...workLogFormData, hours: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="8.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maydon (ga)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={workLogFormData.area_ha}
                  onChange={(e) => setWorkLogFormData({ ...workLogFormData, area_ha: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Yoqilg'i (L)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={workLogFormData.fuel_liters}
                  onChange={(e) => setWorkLogFormData({ ...workLogFormData, fuel_liters: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="85"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpenWorkLogDialog(false)} disabled={saving}>
                Bekor qilish
              </Button>
              <Button onClick={handleAddWorkLog} disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Qo'shish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jami texnikalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machines.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machines.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Texnik xizmat kerak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive flex items-center gap-2">
              {maintenanceDue > 0 && <AlertCircle className="w-5 h-5" />}
              {maintenanceDue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Texnikalar ro'yxati</CardTitle>
          <CardDescription>Barcha qishloq xo'jaligi texnikalari</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : machines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Texnikalar ro'yxati bo'sh</p>
              <p className="text-sm text-muted-foreground mt-1">Birinchi texnikani qo'shish uchun yuqoridagi tugmani bosing</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Turi</TableHead>
                  <TableHead>Brend & Model</TableHead>
                  <TableHead>Dvigatel soatlari</TableHead>
                  <TableHead>Oxirgi texnik xizmat</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((machine) => {
                  const needsMaintenance =
                    machine.service_interval_hours &&
                    machine.last_service_hours &&
                    machine.engine_hours - machine.last_service_hours >= machine.service_interval_hours

                  return (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.name}</TableCell>
                      <TableCell className="capitalize">{getTypeLabel(machine.type)}</TableCell>
                      <TableCell>
                        {machine.brand || ""} {machine.model || ""}
                      </TableCell>
                      <TableCell>
                        {machine.engine_hours?.toFixed(1) || "0"} soat
                        {needsMaintenance && (
                          <span className="ml-2 text-destructive">
                            <AlertCircle className="w-4 h-4 inline" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {machine.last_service_date ? new Date(machine.last_service_date).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(machine)} title="Ko'rish">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(machine)} title="Tahrirlash">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(machine.id)}
                            disabled={deletingId === machine.id}
                            title="O'chirish"
                          >
                            <Trash2 className={`w-4 h-4 text-destructive ${deletingId === machine.id ? "opacity-50" : ""}`} />
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
    </div>
  )
}
