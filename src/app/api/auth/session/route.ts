import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('user_session')

    if (!sessionCookie) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    const user = JSON.parse(sessionCookie.value)

    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { user: null },
      { status: 200 }
    )
  }
}
