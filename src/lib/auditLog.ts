import { prisma } from './prisma'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'

export type AuditEntityType =
  | 'DailyIncome'
  | 'OtherIncome'
  | 'Expense'
  | 'InternalTransfer'
  | 'Account'
  | 'User'
  | 'Auth'

type AuditLogParams = {
  userId: string
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  changes?: Record<string, any>
  memo?: string
}

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  changes,
  memo,
}: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
        memo,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error - audit logging should not break main functionality
  }
}

export function getUserFromSession(request: Request): { id: string; username: string; name: string; role: string } | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const sessionCookie = cookies['user_session']
  if (!sessionCookie) return null

  try {
    return JSON.parse(decodeURIComponent(sessionCookie))
  } catch {
    return null
  }
}
