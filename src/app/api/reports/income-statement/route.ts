import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const toNumber = (value: any): number => {
  if (typeof value === 'string') return parseFloat(value) || 0
  return Number(value) || 0
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get all income sources
    const dailyIncome = await prisma.dailyIncome.findMany({ where })
    const otherIncome = await prisma.otherIncome.findMany({ where })

    // Calculate total daily income by category
    let totalKonsultasi = 0
    let totalTindakanMedis = 0
    let totalObat = 0
    let totalGigi = 0
    let totalAntigen = 0
    let totalQrisFee = 0

    dailyIncome.forEach((income) => {
      totalKonsultasi += toNumber(income.konsultasi)
      totalTindakanMedis += toNumber(income.tindakanMedis)
      totalObat += toNumber(income.obat)
      totalGigi += toNumber(income.gigi)
      totalAntigen += toNumber(income.antigen)
      totalQrisFee += toNumber(income.qrisFee)
    })

    const totalDailyIncome =
      totalKonsultasi + totalTindakanMedis + totalObat + totalGigi + totalAntigen

    // Calculate other income by category
    const otherIncomeByCategory: Record<string, number> = {}
    let totalOtherIncome = 0

    otherIncome.forEach((income) => {
      const amount = toNumber(income.amount)
      if (!otherIncomeByCategory[income.category]) {
        otherIncomeByCategory[income.category] = 0
      }
      otherIncomeByCategory[income.category] += amount
      totalOtherIncome += amount
    })

    // Get all expenses
    const expenses = await prisma.expense.findMany({ where })

    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {}
    let totalExpenses = 0

    expenses.forEach((expense) => {
      const amount = toNumber(expense.amount)
      if (!expensesByCategory[expense.jenis]) {
        expensesByCategory[expense.jenis] = 0
      }
      expensesByCategory[expense.jenis] += amount
      totalExpenses += amount
    })

    // Calculate totals
    const totalRevenue = totalDailyIncome + totalOtherIncome - totalQrisFee
    const netIncome = totalRevenue - totalExpenses
    const grossProfit = totalDailyIncome - totalQrisFee

    return NextResponse.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      revenue: {
        dailyIncome: {
          konsultasi: totalKonsultasi,
          tindakanMedis: totalTindakanMedis,
          obat: totalObat,
          gigi: totalGigi,
          antigen: totalAntigen,
          subtotal: totalDailyIncome,
        },
        otherIncome: {
          byCategory: otherIncomeByCategory,
          subtotal: totalOtherIncome,
        },
        qrisFee: totalQrisFee,
        grossProfit,
        totalRevenue,
      },
      expenses: {
        byCategory: expensesByCategory,
        total: totalExpenses,
      },
      netIncome,
    })
  } catch (error) {
    console.error('Error generating income statement:', error)
    return NextResponse.json(
      { error: 'Failed to generate income statement' },
      { status: 500 }
    )
  }
}
