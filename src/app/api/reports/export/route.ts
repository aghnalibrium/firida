import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auditLog'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // Fetch all accounts
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    })

    // Fetch journal entries for the period
    const entries = await prisma.journalEntry.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    })

    // Calculate account balances
    const accountBalances = new Map<string, number>()

    for (const entry of entries) {
      for (const line of entry.lines) {
        const currentBalance = accountBalances.get(line.accountId) || 0
        const debit = Number(line.debit)
        const credit = Number(line.credit)

        if (line.account.normalBalance === 'DEBIT') {
          accountBalances.set(line.accountId, currentBalance + debit - credit)
        } else {
          accountBalances.set(line.accountId, currentBalance + credit - debit)
        }
      }
    }

    // Prepare accounts data
    const accountsData = accounts.map((acc) => ({
      code: acc.code,
      name: acc.name,
      category: acc.category,
      balance: accountBalances.get(acc.id) || 0,
    }))

    // Calculate income statement
    const incomeAccounts = accounts.filter((a) => a.category === 'INCOME')
    const expenseAccounts = accounts.filter((a) => a.category === 'EXPENSE')

    const incomeDetails = incomeAccounts.map((acc) => ({
      account: `${acc.code} - ${acc.name}`,
      amount: accountBalances.get(acc.id) || 0,
    }))

    const expenseDetails = expenseAccounts.map((acc) => ({
      account: `${acc.code} - ${acc.name}`,
      amount: accountBalances.get(acc.id) || 0,
    }))

    const totalIncome = incomeDetails.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenseDetails.reduce(
      (sum, item) => sum + item.amount,
      0
    )
    const netIncome = totalIncome - totalExpense

    // Calculate cash flow (simplified)
    const cashAccounts = accounts.filter((a) =>
      a.code.startsWith('1') && a.category === 'ASSET'
    )

    const cashIn = entries.reduce((sum, entry) => {
      const cashLines = entry.lines.filter((line) =>
        cashAccounts.some((ca) => ca.id === line.accountId)
      )
      return (
        sum +
        cashLines.reduce((lineSum, line) => lineSum + Number(line.debit), 0)
      )
    }, 0)

    const cashOut = entries.reduce((sum, entry) => {
      const cashLines = entry.lines.filter((line) =>
        cashAccounts.some((ca) => ca.id === line.accountId)
      )
      return (
        sum +
        cashLines.reduce((lineSum, line) => lineSum + Number(line.credit), 0)
      )
    }, 0)

    const netCashFlow = cashIn - cashOut

    return NextResponse.json({
      accounts: accountsData,
      incomeStatement: {
        totalIncome,
        totalExpense,
        netIncome,
        incomeDetails,
        expenseDetails,
      },
      cashFlow: {
        totalIn: cashIn,
        totalOut: cashOut,
        netCashFlow,
      },
      period: {
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error('Error generating export data:', error)
    return NextResponse.json(
      { error: 'Failed to generate export data' },
      { status: 500 }
    )
  }
}
