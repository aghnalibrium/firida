'use client'

import { useState, useEffect } from 'react'

type AuditLog = {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string | null
  changes: string | null
  memo: string | null
  createdAt: string
  user: {
    id: string
    username: string
    name: string
    role: string
  }
}

type AuditLogListProps = {
  refreshTrigger?: number
}

export default function AuditLogList({ refreshTrigger = 0 }: AuditLogListProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    entityType: '',
    action: '',
  })

  useEffect(() => {
    fetchLogs()
  }, [refreshTrigger, filter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.entityType) params.append('entityType', filter.entityType)
      if (filter.action) params.append('action', filter.action)

      const response = await fetch(`/api/audit-logs?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit logs')
      }

      setLogs(data.logs)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800'
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Riwayat Aktivitas (Audit Log)</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Entity
          </label>
          <select
            id="entityType"
            value={filter.entityType}
            onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">Semua Entity</option>
            <option value="Auth">Auth (Login/Logout)</option>
            <option value="User">User</option>
            <option value="DailyIncome">Pendapatan Harian</option>
            <option value="OtherIncome">Pendapatan Lain</option>
            <option value="Expense">Pengeluaran</option>
            <option value="InternalTransfer">Transfer Internal</option>
            <option value="Account">Akun</option>
          </select>
        </div>

        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Action
          </label>
          <select
            id="action"
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">Semua Action</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Belum ada riwayat aktivitas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{log.user.name}</div>
                      <div className="text-xs text-gray-500">@{log.user.username}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {log.entityType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{log.memo}</div>
                    {log.changes && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800">
                          Lihat detail perubahan
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.changes), null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>
          Total Riwayat: <span className="font-semibold text-gray-900">{logs.length}</span>
        </p>
      </div>
    </div>
  )
}
