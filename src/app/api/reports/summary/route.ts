import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.lte = end
    }

    const where = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}

    // Fetch all data
    const [dailyIncome, otherIncome, expenses] = await Promise.all([
      prisma.dailyIncome.findMany({ where }),
      prisma.otherIncome.findMany({ where }),
      prisma.expense.findMany({ where }),
    ])

    // Helper to convert to number
    const toNumber = (value: any): number => {
      return typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0
    }

    // Calculate Daily Income totals
    let totalDailyIncome = 0
    dailyIncome.forEach((entry) => {
      const gross =
        toNumber(entry.konsultasi) +
        toNumber(entry.tindakanMedis) +
        toNumber(entry.obat) +
        toNumber(entry.gigi) +
        toNumber(entry.antigen)

      const qrisFee = entry.paymentMethod === 'QRIS' ? toNumber(entry.qrisFee) : 0
      totalDailyIncome += gross - qrisFee
    })

    // Calculate Other Income total
    const totalOtherIncome = otherIncome.reduce(
      (sum, entry) => sum + toNumber(entry.amount),
      0
    )

    // Calculate Expenses total
    const totalExpenses = expenses.reduce(
      (sum, entry) => sum + toNumber(entry.amount),
      0
    )

    // Calculate totals
    const totalIncome = totalDailyIncome + totalOtherIncome
    const netProfit = totalIncome - totalExpenses

    // Get counts
    const counts = {
      dailyIncomeCount: dailyIncome.length,
      otherIncomeCount: otherIncome.length,
      expenseCount: expenses.length,
    }

    // Get breakdown by payment method for daily income
    const paymentMethodBreakdown: { [key: string]: number } = {}
    dailyIncome.forEach((entry) => {
      const method = entry.paymentMethod
      const gross =
        toNumber(entry.konsultasi) +
        toNumber(entry.tindakanMedis) +
        toNumber(entry.obat) +
        toNumber(entry.gigi) +
        toNumber(entry.antigen)
      const qrisFee = method === 'QRIS' ? toNumber(entry.qrisFee) : 0
      const net = gross - qrisFee

      paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + net
    })

    // Get breakdown by shift for daily income
    const shiftBreakdown: { [key: string]: number } = {}
    dailyIncome.forEach((entry) => {
      const shift = entry.shift
      const gross =
        toNumber(entry.konsultasi) +
        toNumber(entry.tindakanMedis) +
        toNumber(entry.obat) +
        toNumber(entry.gigi) +
        toNumber(entry.antigen)
      const qrisFee = entry.paymentMethod === 'QRIS' ? toNumber(entry.qrisFee) : 0
      const net = gross - qrisFee

      shiftBreakdown[shift] = (shiftBreakdown[shift] || 0) + net
    })

    // Get breakdown by category for expenses
    const expenseBreakdown: { [key: string]: number } = {}
    expenses.forEach((entry) => {
      const category = entry.jenis
      expenseBreakdown[category] = (expenseBreakdown[category] || 0) + toNumber(entry.amount)
    })

    // Get breakdown by category for other income
    const otherIncomeBreakdown: { [key: string]: number } = {}
    otherIncome.forEach((entry) => {
      const category = entry.category
      otherIncomeBreakdown[category] = (otherIncomeBreakdown[category] || 0) + toNumber(entry.amount)
    })

    return NextResponse.json({
      summary: {
        totalDailyIncome,
        totalOtherIncome,
        totalIncome,
        totalExpenses,
        netProfit,
      },
      counts,
      breakdowns: {
        paymentMethod: paymentMethodBreakdown,
        shift: shiftBreakdown,
        expenseCategory: expenseBreakdown,
        otherIncomeCategory: otherIncomeBreakdown,
      },
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
