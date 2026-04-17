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

    // Get all transactions for the period
    const dailyIncome = await prisma.dailyIncome.findMany({ where })
    const otherIncome = await prisma.otherIncome.findMany({ where })
    const expenses = await prisma.expense.findMany({ where })

    // Operating Activities
    let cashFromDailyIncome = 0
    let totalQrisFee = 0

    dailyIncome.forEach((income) => {
      const incomeAmount =
        toNumber(income.konsultasi) +
        toNumber(income.tindakanMedis) +
        toNumber(income.obat) +
        toNumber(income.gigi) +
        toNumber(income.antigen)

      cashFromDailyIncome += incomeAmount
      totalQrisFee += toNumber(income.qrisFee)
    })

    let cashFromOtherIncome = 0
    const otherIncomeByCategory: Record<string, number> = {}

    otherIncome.forEach((income) => {
      const amount = toNumber(income.amount)
      cashFromOtherIncome += amount

      if (!otherIncomeByCategory[income.category]) {
        otherIncomeByCategory[income.category] = 0
      }
      otherIncomeByCategory[income.category] += amount
    })

    let cashPaidForExpenses = 0
    const expensesByCategory: Record<string, number> = {}

    expenses.forEach((expense) => {
      const amount = toNumber(expense.amount)
      cashPaidForExpenses += amount

      if (!expensesByCategory[expense.jenis]) {
        expensesByCategory[expense.jenis] = 0
      }
      expensesByCategory[expense.jenis] += amount
    })

    // Calculate operating cash flow
    const totalCashInflows = cashFromDailyIncome + cashFromOtherIncome
    const totalCashOutflows = cashPaidForExpenses + totalQrisFee
    const netCashFromOperating = totalCashInflows - totalCashOutflows

    // Investing Activities (placeholder - can be expanded later)
    const netCashFromInvesting = 0

    // Financing Activities (placeholder - can be expanded later)
    const netCashFromFinancing = 0

    // Net change in cash
    const netChangeInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing

    return NextResponse.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      operatingActivities: {
        cashInflows: {
          dailyIncome: {
            total: cashFromDailyIncome,
          },
          otherIncome: {
            byCategory: otherIncomeByCategory,
            total: cashFromOtherIncome,
          },
          totalInflows: totalCashInflows,
        },
        cashOutflows: {
          expenses: {
            byCategory: expensesByCategory,
            total: cashPaidForExpenses,
          },
          qrisFees: totalQrisFee,
          totalOutflows: totalCashOutflows,
        },
        netCashFromOperating,
      },
      investingActivities: {
        purchases: {},
        sales: {},
        netCashFromInvesting,
      },
      financingActivities: {
        borrowings: {},
        repayments: {},
        contributions: {},
        netCashFromFinancing,
      },
      netChangeInCash,
      summary: {
        totalCashInflows,
        totalCashOutflows,
        netChangeInCash,
      },
    })
  } catch (error) {
    console.error('Error generating cash flow statement:', error)
    return NextResponse.json(
      { error: 'Failed to generate cash flow statement' },
      { status: 500 }
    )
  }
}
