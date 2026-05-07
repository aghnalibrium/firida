import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const toNumber = (value: any): number => {
  if (typeof value === 'string') return parseFloat(value) || 0
  return Number(value) || 0
}

// Account code mapping
const ACCOUNT_CODES = {
  'Kas Tunai': '1-101',
  'Bank BNI': '1-102',
  'Bank BSI': '1-103',
  'Bank Mandiri': '1-104',
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const asOfDate = searchParams.get('asOfDate')

    const where: any = {}
    if (asOfDate) {
      where.date = {
        lte: new Date(asOfDate),
      }
    }

    // Calculate cash positions from all transactions up to the date
    const dailyIncome = await prisma.dailyIncome.findMany({ where })
    const otherIncome = await prisma.otherIncome.findMany({ where })
    const expenses = await prisma.expense.findMany({ where })
    const transfers = await prisma.internalTransfer.findMany({ where })

    // Track cash by payment method/account
    const cashAccounts: Record<string, number> = {
      'Kas Tunai': 0,
      'Bank BNI': 0,
      'Bank BSI': 0,
      'Bank Mandiri': 0,
    }

    // Add daily income to respective accounts
    dailyIncome.forEach((income) => {
      const amount =
        toNumber(income.konsultasi) +
        toNumber(income.tindakanMedis) +
        toNumber(income.obat) +
        toNumber(income.gigi) +
        toNumber(income.antigen) -
        toNumber(income.qrisFee)

      if (income.paymentMethod === 'TUNAI') {
        cashAccounts['Kas Tunai'] += amount
      } else if (income.paymentMethod === 'TRANSFER' || income.paymentMethod === 'QRIS') {
        // Default to BSI for digital payments
        cashAccounts['Bank BSI'] += amount
      }
    })

    // Add other income
    otherIncome.forEach((income) => {
      const amount = toNumber(income.amount)
      if (income.paymentMethod === 'TUNAI') {
        cashAccounts['Kas Tunai'] += amount
      } else {
        cashAccounts['Bank BSI'] += amount
      }
    })

    // Subtract expenses from respective accounts
    expenses.forEach((expense) => {
      const amount = toNumber(expense.amount)
      // Extract account name from payFrom (format: "code name", e.g., "101 Kas Tunai")
      const accountName = expense.payFrom.split(' ').slice(1).join(' ')
      if (cashAccounts[accountName] !== undefined) {
        cashAccounts[accountName] -= amount
      }
    })

    // Process internal transfers
    transfers.forEach((transfer) => {
      const amount = toNumber(transfer.amount)
      // Simple mapping from codes to names
      const accountMap: Record<string, string> = {
        '101': 'Kas Tunai',
        '102': 'Bank BNI',
        '103': 'Bank BSI',
        '104': 'Bank Mandiri',
      }

      const fromAccount = accountMap[transfer.fromCode]
      const toAccount = accountMap[transfer.toCode]

      if (fromAccount && cashAccounts[fromAccount] !== undefined) {
        cashAccounts[fromAccount] -= amount
      }
      if (toAccount && cashAccounts[toAccount] !== undefined) {
        cashAccounts[toAccount] += amount
      }
    })

    // Convert cash accounts to items with codes
    const cashItems = Object.entries(cashAccounts).map(([name, amount]) => ({
      code: ACCOUNT_CODES[name as keyof typeof ACCOUNT_CODES] || '1-100',
      name,
      amount
    }))

    // Calculate total cash
    const totalCash = Object.values(cashAccounts).reduce((sum, val) => sum + val, 0)

    // Calculate net income (simplified - total income minus total expenses)
    let totalIncome = 0
    dailyIncome.forEach((income) => {
      totalIncome +=
        toNumber(income.konsultasi) +
        toNumber(income.tindakanMedis) +
        toNumber(income.obat) +
        toNumber(income.gigi) +
        toNumber(income.antigen) -
        toNumber(income.qrisFee)
    })
    otherIncome.forEach((income) => {
      totalIncome += toNumber(income.amount)
    })

    let totalExpenses = 0
    expenses.forEach((expense) => {
      totalExpenses += toNumber(expense.amount)
    })

    const retainedEarnings = totalIncome - totalExpenses

    // For a clinic starting from scratch, equity = retained earnings
    const totalEquity = retainedEarnings

    return NextResponse.json({
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      assets: {
        currentAssets: {
          cashItems,
          totalCash,
        },
        totalAssets: totalCash,
      },
      liabilities: {
        currentLiabilities: {},
        totalLiabilities: 0,
      },
      equity: {
        retainedEarnings: {
          code: '3-100',
          name: 'Laba Ditahan',
          amount: retainedEarnings
        },
        totalEquity,
      },
      // Balance sheet equation check
      balanceCheck: {
        assetsTotal: totalCash,
        liabilitiesAndEquityTotal: totalEquity,
        balanced: Math.abs(totalCash - totalEquity) < 0.01,
      },
    })
  } catch (error) {
    console.error('Error generating balance sheet:', error)
    return NextResponse.json(
      { error: 'Failed to generate balance sheet' },
      { status: 500 }
    )
  }
}
