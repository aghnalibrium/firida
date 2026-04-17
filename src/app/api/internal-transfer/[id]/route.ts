import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const entry = await prisma.internalTransfer.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching internal transfer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch internal transfer entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { date, fromCode, toCode, amount, memo } = body

    const entry = await prisma.internalTransfer.update({
      where: { id },
      data: {
        date: new Date(date),
        fromCode,
        toCode,
        amount,
        memo: memo || null,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating internal transfer:', error)
    return NextResponse.json(
      { error: 'Failed to update internal transfer entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.internalTransfer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting internal transfer:', error)
    return NextResponse.json(
      { error: 'Failed to delete internal transfer entry' },
      { status: 500 }
    )
  }
}
