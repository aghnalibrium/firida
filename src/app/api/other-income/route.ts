import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const category = searchParams.get('category')

    const where: any = {}
    if (date) where.date = new Date(date)
    if (category) where.category = category

    const entries = await prisma.otherIncome.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching other income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch other income entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, category, memo, paymentMethod, amount } = body

    const entry = await prisma.otherIncome.create({
      data: {
        date: new Date(date),
        category,
        memo: memo || null,
        paymentMethod: paymentMethod || null,
        amount,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating other income:', error)
    return NextResponse.json(
      { error: 'Failed to create other income entry' },
      { status: 500 }
    )
  }
}
