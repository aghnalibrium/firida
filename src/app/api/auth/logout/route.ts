import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSession, createAuditLog } from '@/lib/auditLog'

export async function POST(request: NextRequest) {
  // Get user before clearing session
  const user = getUserFromSession(request)

  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  )

  // Clear the session cookie
  response.cookies.delete('user_session')

  // Log logout activity if user was logged in
  if (user) {
    await createAuditLog({
      userId: user.id,
      action: 'LOGOUT',
      entityType: 'Auth',
      memo: `User ${user.username} logged out`,
    })
  }

  return response
}
