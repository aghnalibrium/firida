import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (category) where.category = category
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const accounts = await prisma.account.findMany({
      where,
      orderBy: { code: 'asc' },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, category, normalBalance, isActive } = body

    // Check if code already exists
    const existingAccount = await prisma.account.findUnique({
      where: { code },
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account code already exists' },
        { status: 400 }
      )
    }

    const account = await prisma.account.create({
      data: {
        code,
        name,
        category,
        normalBalance,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
