import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    const where: any = {}
    if (date) where.date = new Date(date)

    const entries = await prisma.internalTransfer.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching internal transfers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch internal transfer entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, fromCode, toCode, amount, memo } = body

    const entry = await prisma.internalTransfer.create({
      data: {
        date: new Date(date),
        fromCode,
        toCode,
        amount,
        memo: memo || null,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating internal transfer:', error)
    return NextResponse.json(
      { error: 'Failed to create internal transfer entry' },
      { status: 500 }
    )
  }
}
