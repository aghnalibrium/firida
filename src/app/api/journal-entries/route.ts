import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auditLog'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sourceType = searchParams.get('sourceType')

    const where: any = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Filter for manual journal entries only
    if (sourceType === 'MANUAL') {
      where.sourceType = 'MANUAL_JOURNAL'
    }

    const journalEntries = await prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(journalEntries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, memo, lines } = body

    // Validation
    if (!date || !lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json(
        { error: 'Date and at least 2 journal lines are required' },
        { status: 400 }
      )
    }

    // Calculate total debit and credit
    let totalDebit = 0
    let totalCredit = 0

    for (const line of lines) {
      totalDebit += Number(line.debit || 0)
      totalCredit += Number(line.credit || 0)
    }

    // Validation: Debit must equal Credit (double-entry bookkeeping)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { error: `Debit (${totalDebit}) must equal Credit (${totalCredit})` },
        { status: 400 }
      )
    }

    // Create journal entry with lines in a transaction
    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        memo: memo || null,
        sourceType: 'MANUAL_JOURNAL',
        sourceId: null,   // Manual entry has no sourceId
        lines: {
          create: lines.map((line: any) => ({
            accountId: line.accountId,
            debit: line.debit || 0,
            credit: line.credit || 0,
          })),
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

    return NextResponse.json(journalEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}
