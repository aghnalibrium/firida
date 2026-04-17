import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const entry = await prisma.otherIncome.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching other income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch other income entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { date, category, memo, paymentMethod, amount } = body

    const entry = await prisma.otherIncome.update({
      where: { id },
      data: {
        date: new Date(date),
        category,
        memo: memo || null,
        paymentMethod: paymentMethod || null,
        amount,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating other income:', error)
    return NextResponse.json(
      { error: 'Failed to update other income entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.otherIncome.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting other income:', error)
    return NextResponse.json(
      { error: 'Failed to delete other income entry' },
      { status: 500 }
    )
  }
}
