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

    // Validasi parameter
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const periodStart = new Date(startDate)
    const periodEnd = new Date(endDate)

    // Calculate beginning equity (from inception to day before start date)
    const beforeStart = new Date(periodStart)
    beforeStart.setDate(beforeStart.getDate() - 1)

    const whereBeforeStart = {
      date: {
        lte: beforeStart,
      },
    }

    // Get income before period
    const dailyIncomeBeforeStart = await prisma.dailyIncome.findMany({
      where: whereBeforeStart
    })
    const otherIncomeBeforeStart = await prisma.otherIncome.findMany({
      where: whereBeforeStart
    })
    const expensesBeforeStart = await prisma.expense.findMany({
      where: whereBeforeStart
    })

    let totalIncomeBeforeStart = 0
    let totalQrisFeeBeforeStart = 0
    let totalExpensesBeforeStart = 0

    dailyIncomeBeforeStart.forEach((income) => {
      totalIncomeBeforeStart +=
        toNumber(income.konsultasi) +
        toNumber(income.tindakanMedis) +
        toNumber(income.obat) +
        toNumber(income.gigi) +
        toNumber(income.antigen)
      totalQrisFeeBeforeStart += toNumber(income.qrisFee)
    })

    otherIncomeBeforeStart.forEach((income) => {
      totalIncomeBeforeStart += toNumber(income.amount)
    })

    expensesBeforeStart.forEach((expense) => {
      totalExpensesBeforeStart += toNumber(expense.amount)
    })

    const beginningEquity = totalIncomeBeforeStart - totalQrisFeeBeforeStart - totalExpensesBeforeStart

    // Calculate net income for current period
    const wherePeriod = {
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    }

    const dailyIncomePeriod = await prisma.dailyIncome.findMany({
      where: wherePeriod
    })
    const otherIncomePeriod = await prisma.otherIncome.findMany({
      where: wherePeriod
    })
    const expensesPeriod = await prisma.expense.findMany({
      where: wherePeriod
    })

    let totalIncomePeriod = 0
    let totalQrisFeePeriod = 0
    let totalExpensesPeriod = 0

    dailyIncomePeriod.forEach((income) => {
      totalIncomePeriod +=
        toNumber(income.konsultasi) +
        toNumber(income.tindakanMedis) +
        toNumber(income.obat) +
        toNumber(income.gigi) +
        toNumber(income.antigen)
      totalQrisFeePeriod += toNumber(income.qrisFee)
    })

    otherIncomePeriod.forEach((income) => {
      totalIncomePeriod += toNumber(income.amount)
    })

    expensesPeriod.forEach((expense) => {
      totalExpensesPeriod += toNumber(expense.amount)
    })

    const netIncomePeriod = totalIncomePeriod - totalQrisFeePeriod - totalExpensesPeriod

    // For clinic, we typically don't have withdrawals (prive/penarikan modal)
    // But we'll include it for completeness
    const withdrawals = 0 // Could be added as a new transaction type in the future

    // Calculate ending equity
    const endingEquity = beginningEquity + netIncomePeriod - withdrawals

    return NextResponse.json({
      period: {
        startDate,
        endDate,
      },
      beginningEquity,
      additions: {
        netIncome: netIncomePeriod,
      },
      deductions: {
        withdrawals,
      },
      endingEquity,
    })
  } catch (error) {
    console.error('Error generating equity change report:', error)
    return NextResponse.json(
      { error: 'Failed to generate equity change report' },
      { status: 500 }
    )
  }
}
