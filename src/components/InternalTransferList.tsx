'use client'

import { useState, useEffect } from 'react'

type InternalTransfer = {
  id: string
  date: string
  fromCode: string
  toCode: string
  amount: number | string
  memo: string | null
  createdAt: string
  updatedAt: string
}

type InternalTransferListProps = {
  refreshTrigger?: number
}

export default function InternalTransferList({ refreshTrigger }: InternalTransferListProps) {
  const [entries, setEntries] = useState<InternalTransfer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to convert Decimal/string to number
  const toNumber = (value: number | string): number => {
    return typeof value === 'string' ? parseFloat(value) || 0 : value
  }

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/internal-transfer')
      if (!response.ok) {
        throw new Error('Failed to fetch entries')
      }
      const data = await response.json()
      setEntries(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data transfer ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/internal-transfer/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete entry')
      }

      fetchEntries()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete entry')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Daftar Transfer Internal</h2>
        <p className="text-gray-600">Belum ada data transfer internal.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Daftar Transfer Internal</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dari Rekening
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                →
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ke Rekening
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catatan
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {entry.fromCode}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                  <span className="text-indigo-600 font-bold">→</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {entry.toCode}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-indigo-600">
                  Rp {toNumber(entry.amount).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {entry.memo || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total Transfer:</span>
          <span className="text-xl font-bold text-indigo-600">
            Rp{' '}
            {entries
              .reduce((sum, entry) => sum + toNumber(entry.amount), 0)
              .toLocaleString('id-ID')}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {entries.length} transaksi transfer internal
        </p>
      </div>
    </div>
  )
}
