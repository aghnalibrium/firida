import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auditLog'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const journalEntry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    })

    if (!journalEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(journalEntry)
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { date, memo, lines } = body

    // Check if journal entry exists
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    // Only allow editing manual journal entries
    if (existingEntry.sourceType !== 'MANUAL_JOURNAL') {
      return NextResponse.json(
        { error: 'Cannot edit system-generated journal entries' },
        { status: 403 }
      )
    }

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

    // Validation: Debit must equal Credit
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { error: `Debit (${totalDebit}) must equal Credit (${totalCredit})` },
        { status: 400 }
      )
    }

    // Update journal entry: delete old lines and create new ones
    const updatedEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        date: new Date(date),
        memo: memo || null,
        lines: {
          deleteMany: {}, // Delete all existing lines
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

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if journal entry exists
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    // Only allow deleting manual journal entries
    if (existingEntry.sourceType !== 'MANUAL_JOURNAL') {
      return NextResponse.json(
        { error: 'Cannot delete system-generated journal entries' },
        { status: 403 }
      )
    }

    // Delete journal entry (cascade will delete lines automatically)
    await prisma.journalEntry.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Journal entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
}
