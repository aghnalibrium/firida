import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/daily-income/[id] - Get a single daily income entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entry = await prisma.dailyIncome.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Daily income entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching daily income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily income entry' },
      { status: 500 }
    )
  }
}

// PUT /api/daily-income/[id] - Update a daily income entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const entry = await prisma.dailyIncome.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
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

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating daily income:', error)
    return NextResponse.json(
      { error: 'Failed to update daily income entry' },
      { status: 500 }
    )
  }
}

// DELETE /api/daily-income/[id] - Delete a daily income entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.dailyIncome.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting daily income:', error)
    return NextResponse.json(
      { error: 'Failed to delete daily income entry' },
      { status: 500 }
    )
  }
}
