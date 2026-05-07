import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const toNumber = (value: any): number => {
  if (typeof value === 'string') return parseFloat(value) || 0
  return Number(value) || 0
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

    // Fetch all journal entries up to the date (includes manual journals)
    const journalEntries = await prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    })

    // Calculate balance for each account using journal entries
    const accountBalances: Record<string, {
      account: any
      balance: number
    }> = {}

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const accountId = line.accountId
        if (!accountBalances[accountId]) {
          accountBalances[accountId] = {
            account: line.account,
            balance: 0,
          }
        }

        const debit = toNumber(line.debit)
        const credit = toNumber(line.credit)

        // Calculate balance based on normal balance
        // DEBIT normal: Assets, Expenses (debit increases, credit decreases)
        // CREDIT normal: Liabilities, Equity, Income (credit increases, debit decreases)
        if (line.account.normalBalance === 'DEBIT') {
          accountBalances[accountId].balance += debit - credit
        } else {
          accountBalances[accountId].balance += credit - debit
        }
      })
    })

    // Categorize accounts by type
    const assets: any[] = []
    const liabilities: any[] = []
    const equityAccounts: any[] = []
    let totalIncome = 0
    let totalExpenses = 0

    Object.values(accountBalances).forEach(({ account, balance }) => {
      const item = {
        code: account.code,
        name: account.name,
        amount: balance,
      }

      if (account.category === 'ASSET') {
        assets.push(item)
      } else if (account.category === 'LIABILITY') {
        liabilities.push(item)
      } else if (account.category === 'EQUITY') {
        equityAccounts.push(item)
      } else if (account.category === 'INCOME') {
        totalIncome += balance
      } else if (account.category === 'EXPENSE') {
        totalExpenses += balance
      }
    })

    // Sort by account code
    assets.sort((a, b) => a.code.localeCompare(b.code))
    liabilities.sort((a, b) => a.code.localeCompare(b.code))
    equityAccounts.sort((a, b) => a.code.localeCompare(b.code))

    // Calculate totals
    const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0)
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0)
    const totalEquityAccounts = equityAccounts.reduce((sum, item) => sum + item.amount, 0)

    // Retained Earnings = Income - Expenses
    const retainedEarnings = totalIncome - totalExpenses

    // Total Equity = Equity Accounts + Retained Earnings
    const totalEquity = totalEquityAccounts + retainedEarnings

    // Separate cash accounts for display (Asset accounts with codes starting with 1-1)
    const cashItems = assets.filter(item => item.code.startsWith('1-1'))
    const totalCash = cashItems.reduce((sum, item) => sum + item.amount, 0)

    return NextResponse.json({
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      assets: {
        currentAssets: {
          cashItems, // For backward compatibility, show cash separately
          totalCash,
        },
        allAssets: assets, // All asset accounts
        totalAssets,
      },
      liabilities: {
        currentLiabilities: liabilities.reduce((obj, item) => {
          obj[item.name] = item.amount
          return obj
        }, {} as Record<string, number>),
        allLiabilities: liabilities, // All liability accounts
        totalLiabilities,
      },
      equity: {
        accounts: equityAccounts, // Capital/equity accounts
        retainedEarnings: {
          code: '3-100',
          name: 'Laba Ditahan',
          amount: retainedEarnings
        },
        totalEquity,
      },
      // Balance sheet equation check
      balanceCheck: {
        assetsTotal: totalAssets,
        liabilitiesAndEquityTotal: totalLiabilities + totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
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
