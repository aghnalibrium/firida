'use client'

import { useState, useEffect } from 'react'
import PrintInvoice from './PrintInvoice'

type Expense = {
  id: string
  date: string
  jenis: string
  memo: string | null
  amount: number | string
  payFrom: string
  vendor: string | null
  refNo: string | null
  createdAt: string
  updatedAt: string
}

type ExpenseListProps = {
  refreshTrigger?: number
}

export default function ExpenseList({ refreshTrigger }: ExpenseListProps) {
  const [entries, setEntries] = useState<Expense[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printingExpense, setPrintingExpense] = useState<Expense | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [jenisFilter, setJenisFilter] = useState<string>('ALL')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Helper function to convert Decimal/string to number
  const toNumber = (value: number | string): number => {
    return typeof value === 'string' ? parseFloat(value) || 0 : value
  }

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/expense')
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

  // Get unique jenis for filter
  const uniqueJenis = Array.from(new Set(entries.map((e) => e.jenis)))

  // Apply filters
  useEffect(() => {
    let filtered = [...entries]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.vendor?.toLowerCase().includes(query) ||
          entry.memo?.toLowerCase().includes(query) ||
          entry.refNo?.toLowerCase().includes(query) ||
          entry.jenis.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((entry) => new Date(entry.date) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter((entry) => new Date(entry.date) <= new Date(endDate))
    }

    // Jenis filter
    if (jenisFilter !== 'ALL') {
      filtered = filtered.filter((entry) => entry.jenis === jenisFilter)
    }

    setFilteredEntries(filtered)
    setCurrentPage(1)
  }, [entries, searchQuery, startDate, endDate, jenisFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/expense/${id}`, {
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

  const handleQuickFilter = (days: number) => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - days)

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setJenisFilter('ALL')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daftar Pengeluaran/Biaya</h2>

        {/* Filters Section */}
        <div className="space-y-4">
          {/* Search Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="🔍 Cari vendor, catatan, atau ref no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
            />
            {(searchQuery || startDate || endDate || jenisFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Quick Filters & Date Range */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickFilter(0)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
            >
              Hari Ini
            </button>
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
            >
              30 Hari Terakhir
            </button>

            <div className="flex-1 min-w-[300px] flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
              />
              <span className="self-center text-gray-500">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
              />
            </div>
          </div>

          {/* Jenis Filter */}
          <div className="flex gap-2">
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            >
              <option value="ALL">Semua Jenis Pengeluaran</option>
              {uniqueJenis.map((jenis) => (
                <option key={jenis} value={jenis}>
                  {jenis}
                </option>
              ))}
            </select>

            <div className="flex-1 text-right text-sm text-gray-600 self-center">
              Menampilkan {filteredEntries.length} dari {entries.length} data
            </div>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          {entries.length === 0 ? 'Belum ada data pengeluaran' : 'Tidak ada data yang sesuai dengan filter'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibayar Dari
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ref No
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
                {currentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {entry.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.vendor || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {entry.payFrom}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                      Rp {toNumber(entry.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {entry.refNo || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.memo || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => setPrintingExpense(entry)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                      >
                        Print
                      </button>
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
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Total (halaman ini):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    Rp{' '}
                    {currentEntries
                      .reduce((sum, entry) => sum + toNumber(entry.amount), 0)
                      .toLocaleString('id-ID')}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="bg-red-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Grand Total (semua filter):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    Rp{' '}
                    {filteredEntries
                      .reduce((sum, entry) => sum + toNumber(entry.amount), 0)
                      .toLocaleString('id-ID')}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages} ({filteredEntries.length} total data)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Sebelumnya
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Print Invoice Modal */}
      {printingExpense && (
        <PrintInvoice
          expense={{
            ...printingExpense,
            amount: toNumber(printingExpense.amount),
          }}
          onClose={() => setPrintingExpense(null)}
        />
      )}
    </div>
  )
}
