import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const account = await prisma.account.findUnique({
      where: { id },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { code, name, category, normalBalance, isActive } = body

    // If code is being changed, check if new code already exists
    if (code) {
      const existingAccount = await prisma.account.findUnique({
        where: { code },
      })

      if (existingAccount && existingAccount.id !== id) {
        return NextResponse.json(
          { error: 'Account code already exists' },
          { status: 400 }
        )
      }
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        code,
        name,
        category,
        normalBalance,
        isActive,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if account has any journal lines
    const journalLinesCount = await prisma.journalLine.count({
      where: { accountId: id },
    })

    if (journalLinesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with existing transactions' },
        { status: 400 }
      )
    }

    await prisma.account.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
