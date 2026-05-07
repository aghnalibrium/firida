import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const toNumber = (value: any): number => {
  if (typeof value === 'string') return parseFloat(value) || 0
  return Number(value) || 0
}

// Mapping kategori pendapatan ke kode akun standar
const INCOME_ACCOUNT_CODES = {
  konsultasi: { code: '4-100', name: 'Pendapatan Konsultasi' },
  tindakanMedis: { code: '4-200', name: 'Pendapatan Tindakan Medis' },
  obat: { code: '4-300', name: 'Pendapatan Obat' },
  gigi: { code: '4-400', name: 'Pendapatan Gigi' },
  antigen: { code: '4-500', name: 'Pendapatan Antigen' },
  qrisFee: { code: '5-999', name: 'Biaya QRIS' },
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

    // Convert other income to items with account codes
    const otherIncomeItems = Object.entries(otherIncomeByCategory).map(([category, amount], index) => ({
      code: `4-${600 + index}`,
      name: category,
      amount
    }))

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

    // Convert expenses to items with account codes
    const expenseItems = Object.entries(expensesByCategory).map(([category, amount], index) => ({
      code: `5-${100 + index}`,
      name: category,
      amount
    }))

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
          items: [
            {
              code: INCOME_ACCOUNT_CODES.konsultasi.code,
              name: INCOME_ACCOUNT_CODES.konsultasi.name,
              amount: totalKonsultasi
            },
            {
              code: INCOME_ACCOUNT_CODES.tindakanMedis.code,
              name: INCOME_ACCOUNT_CODES.tindakanMedis.name,
              amount: totalTindakanMedis
            },
            {
              code: INCOME_ACCOUNT_CODES.obat.code,
              name: INCOME_ACCOUNT_CODES.obat.name,
              amount: totalObat
            },
            {
              code: INCOME_ACCOUNT_CODES.gigi.code,
              name: INCOME_ACCOUNT_CODES.gigi.name,
              amount: totalGigi
            },
            {
              code: INCOME_ACCOUNT_CODES.antigen.code,
              name: INCOME_ACCOUNT_CODES.antigen.name,
              amount: totalAntigen
            },
          ],
          subtotal: totalDailyIncome,
        },
        otherIncome: {
          items: otherIncomeItems,
          subtotal: totalOtherIncome,
        },
        qrisFee: {
          code: INCOME_ACCOUNT_CODES.qrisFee.code,
          name: INCOME_ACCOUNT_CODES.qrisFee.name,
          amount: totalQrisFee
        },
        grossProfit,
        totalRevenue,
      },
      expenses: {
        items: expenseItems,
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
