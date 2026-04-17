'use client'

import { useState, useEffect } from 'react'

type Account = {
  id: string
  code: string
  name: string
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
  normalBalance: 'DEBIT' | 'CREDIT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type AccountListProps = {
  refreshTrigger?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  ASSET: 'Aset',
  LIABILITY: 'Kewajiban',
  EQUITY: 'Modal',
  INCOME: 'Pendapatan',
  EXPENSE: 'Beban',
}

export default function AccountList({ refreshTrigger = 0 }: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterActive, setFilterActive] = useState<string>('all')

  useEffect(() => {
    fetchAccounts()
  }, [refreshTrigger, filterCategory, filterActive])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterCategory) params.append('category', filterCategory)
      if (filterActive !== 'all') params.append('isActive', filterActive)

      const response = await fetch(`/api/accounts?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch accounts')
      }

      setAccounts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, code: string, name: string) => {
    if (!confirm(`Hapus akun ${code} - ${name}?`)) return

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      fetchAccounts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  // Group accounts by category
  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.category]) {
      acc[account.category] = []
    }
    acc[account.category].push(account)
    return acc
  }, {} as Record<string, Account[]>)

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
          >
            <option value="">Semua Kategori</option>
            <option value="ASSET">Aset</option>
            <option value="LIABILITY">Kewajiban</option>
            <option value="EQUITY">Modal</option>
            <option value="INCOME">Pendapatan</option>
            <option value="EXPENSE">Beban</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {accounts.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Belum ada akun</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAccounts).map(([category, categoryAccounts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-amber-700 mb-3">
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Kode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Nama Akun
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Saldo Normal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryAccounts.map((account) => (
                      <tr key={account.id} className={!account.isActive ? 'bg-gray-50 opacity-60' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {account.code}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {account.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              account.normalBalance === 'DEBIT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {account.normalBalance === 'DEBIT' ? 'Debit' : 'Kredit'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              account.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {account.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(account.id, account.code, account.name)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>Total Akun: <span className="font-semibold text-gray-900">{accounts.length}</span></p>
      </div>
    </div>
  )
}
