"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, DollarSign, Edit2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { expensesApi } from "@/lib/api"

interface Expense {
  id: number
  description: string
  amount: number
  category: string
  date: string
  farm_id?: number
}

const EXPENSE_CATEGORIES: string[] = ["Urug‘lar", "O‘g‘it", "Texnika", "Ta’mirlash", "Mehnat", "Boshqa"]

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ description: "", amount: "", category: "", date: "" })
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    try {
      setLoading(true)
      const data = await expensesApi.list()
      setExpenses(data || [])
    } catch (err) {
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!formData.description || !formData.amount || !formData.category) {
      alert("Iltimos, barcha maydonlarni to‘ldiring")
      return
    }
    try {
      await expensesApi.create({
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        date: formData.date || new Date().toISOString().split("T")[0],
      })
      setFormData({ description: "", amount: "", category: "", date: "" })
      setOpenDialog(false)
      await loadExpenses()
    } catch (err) {
      console.error("Create failed:", err)
      alert("Xarajat qo‘shishda xatolik yuz berdi")
    }
  }

  function handleExport() {
    if (!expenses.length) {
      alert("Eksport qilish uchun ma’lumot mavjud emas")
      return
    }
    setExporting(true)
    try {
      const header = "Tavsif,Kategoriya,Miqdor,Sana\n"
      const rows = expenses
        .map((exp) => `"${exp.description.replace(/"/g, '""')}",${exp.category},${exp.amount},${exp.date}`)
        .join("\n")
      const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `xarajatlar-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const categories = [...new Set(expenses.map((exp) => exp.category))]
  const filteredExpenses =
    categoryFilter === "all" ? expenses : expenses.filter((expense) => expense.category === categoryFilter)

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Moliyaviy boshqaruv</p>
          <h1 className="text-3xl font-bold text-foreground">Xarajatlar bo‘limi</h1>
          <p className="text-muted-foreground mt-1">
            Fermer xo‘jaligingiz xarajatlarini kategoriya bo‘yicha kuzating va tahlil qiling
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
            <Download className={`h-4 w-4 ${exporting ? "animate-spin" : ""}`} />
            CSV eksport
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi xarajat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi xarajat qo‘shish</DialogTitle>
                <DialogDescription>Xarajat tafsilotlarini kiriting va ro‘yxatga qo‘shing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <label className="block text-sm font-medium">Tavsif *</label>
                <input
                  type="text"
                  placeholder="Masalan, urug‘ xaridi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <label className="block text-sm font-medium">Miqdor *</label>
                <input
                  type="number"
                  placeholder="Masalan, 1200"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <label className="block text-sm font-medium">Kategoriya *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Kategoriya tanlang</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-medium">Sana</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleCreate}>Saqlash</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami xarajat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neutral-400" />
              <span className="text-2xl font-bold">${totalExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kategoriya soni</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{categories.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yozuvlar soni</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{expenses.length}</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Xarajatlar ro‘yxati</h2>
          <p className="text-sm text-muted-foreground">Kategoriya bo‘yicha filtrlash va nazorat qilish</p>
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon" onClick={loadExpenses} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xarajatlar ro‘yxati</CardTitle>
          <CardDescription>Fermer xo‘jaligidagi barcha xarajatlar</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ma’lumotlar yuklanmoqda...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Xarajatlar topilmadi</p>
              <p className="text-sm text-muted-foreground mt-1">Yangi xarajat qo‘shib kuzatuvni boshlang</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tavsif</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
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
