import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/daily-income - List all daily income entries
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/daily-income called')
    console.log('Prisma client:', prisma ? 'exists' : 'undefined')

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const shift = searchParams.get('shift')

    const where: any = {}
    if (date) {
      where.date = new Date(date)
    }
    if (shift) {
      where.shift = shift
    }

    console.log('Calling prisma.dailyIncome.findMany...')
    const entries = await prisma.dailyIncome.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    console.log('Found entries:', entries.length)
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching daily income:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch daily income entries', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST /api/daily-income - Create a new daily income entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const entry = await prisma.dailyIncome.create({
      data: {
        date: new Date(body.date),
        shift: body.shift,
        patientName: body.patientName || null,
        paymentMethod: body.paymentMethod,
        qrisFee: body.qrisFee || 0,
        konsultasi: body.konsultasi || 0,
        tindakanMedis: body.tindakanMedis || 0,
        obat: body.obat || 0,
        gigi: body.gigi || 0,
        antigen: body.antigen || 0,
        memo: body.memo || null,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating daily income:', error)
    return NextResponse.json(
      { error: 'Failed to create daily income entry' },
      { status: 500 }
    )
  }
}
