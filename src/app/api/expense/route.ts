import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const jenis = searchParams.get('jenis')

    const where: any = {}
    if (date) where.date = new Date(date)
    if (jenis) where.jenis = jenis

    const entries = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, jenis, memo, amount, payFrom, vendor, refNo } = body

    const entry = await prisma.expense.create({
      data: {
        date: new Date(date),
        jenis,
        memo: memo || null,
        amount,
        payFrom,
        vendor: vendor || null,
        refNo: refNo || null,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense entry' },
      { status: 500 }
    )
  }
}
