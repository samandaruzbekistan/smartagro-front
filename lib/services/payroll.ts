// Payroll Service - calculates worker payments based on rate and units
export interface WorkerPayment {
  workerId: number
  workerName: string
  role: string
  hoursWorked: number
  hourlyRate: number
  basePay: number
  bonuses: number
  deductions: number
  totalPay: number
}

export interface PayrollResult {
  totalWorkers: number
  totalBasePay: number
  totalBonuses: number
  totalDeductions: number
  totalPayroll: number
  averagePay: number
}

export function calculatePayroll(workers: any[]): PayrollResult {
  const payments: WorkerPayment[] = workers.map((worker: any) => {
    // Default rates by role
    let hourlyRate = 15000 // Default rate
    if (worker.role === "Manager") hourlyRate = 25000
    else if (worker.role === "Technician") hourlyRate = 20000
    else if (worker.role === "Farmer") hourlyRate = 15000
    else if (worker.role === "Laborer") hourlyRate = 12000

    const hoursWorked = 160 // 40 hours per week * 4 weeks
    const basePay = hoursWorked * hourlyRate

    // Calculate bonuses (5% if active)
    const bonuses = worker.status === "Active" ? Math.round(basePay * 0.05) : 0

    // Calculate deductions (tax ~8% + insurance ~2%)
    const deductions = Math.round(basePay * 0.1)

    const totalPay = basePay + bonuses - deductions

    return {
      workerId: worker.id,
      workerName: worker.name,
      role: worker.role,
      hoursWorked,
      hourlyRate,
      basePay,
      bonuses,
      deductions,
      totalPay,
    }
  })

  const totalBasePay = payments.reduce((sum, p) => sum + p.basePay, 0)
  const totalBonuses = payments.reduce((sum, p) => sum + p.bonuses, 0)
  const totalDeductions = payments.reduce((sum, p) => sum + p.deductions, 0)
  const totalPayroll = totalBasePay + totalBonuses - totalDeductions

  return {
    totalWorkers: workers.length,
    totalBasePay,
    totalBonuses,
    totalDeductions,
    totalPayroll,
    averagePay: workers.length > 0 ? Math.round(totalPayroll / workers.length) : 0,
  }
}

export function calculateWorkerPayment(worker: any, hoursWorked = 160): WorkerPayment {
  let hourlyRate = 15000
  if (worker.role === "Manager") hourlyRate = 25000
  else if (worker.role === "Technician") hourlyRate = 20000
  else if (worker.role === "Farmer") hourlyRate = 15000

  const basePay = hoursWorked * hourlyRate
  const bonuses = worker.status === "Active" ? Math.round(basePay * 0.05) : 0
  const deductions = Math.round(basePay * 0.1)
  const totalPay = basePay + bonuses - deductions

  return {
    workerId: worker.id,
    workerName: worker.name,
    role: worker.role,
    hoursWorked,
    hourlyRate,
    basePay,
    bonuses,
    deductions,
    totalPay,
  }
}
