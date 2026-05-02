'use client'

import { useState, useEffect } from 'react'

type OtherIncome = {
  id: string
  date: string
  category: string
  memo: string | null
  paymentMethod: string | null
  amount: number | string
  createdAt: string
  updatedAt: string
}

type OtherIncomeListProps = {
  refreshTrigger?: number
}

export default function OtherIncomeList({ refreshTrigger }: OtherIncomeListProps) {
  const [entries, setEntries] = useState<OtherIncome[]>([])
  const [filteredEntries, setFilteredEntries] = useState<OtherIncome[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL')

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
      const response = await fetch('/api/other-income')
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

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(entries.map((e) => e.category)))

  // Apply filters
  useEffect(() => {
    let filtered = [...entries]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.category.toLowerCase().includes(query) ||
          entry.memo?.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((entry) => new Date(entry.date) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter((entry) => new Date(entry.date) <= new Date(endDate))
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((entry) => entry.category === categoryFilter)
    }

    // Payment method filter
    if (paymentMethodFilter !== 'ALL') {
      filtered = filtered.filter((entry) => entry.paymentMethod === paymentMethodFilter)
    }

    setFilteredEntries(filtered)
    setCurrentPage(1)
  }, [entries, searchQuery, startDate, endDate, categoryFilter, paymentMethodFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/other-income/${id}`, {
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
    setCategoryFilter('ALL')
    setPaymentMethodFilter('ALL')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return '-'
    const methods: { [key: string]: string } = {
      TUNAI: 'Tunai',
      TRANSFER: 'Transfer',
      QRIS: 'QRIS',
    }
    return methods[method] || method
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daftar Pendapatan Lain</h2>

        {/* Filters Section */}
        <div className="space-y-4">
          {/* Search Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="🔍 Cari kategori atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            {(searchQuery || startDate || endDate || categoryFilter !== 'ALL' || paymentMethodFilter !== 'ALL') && (
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
              className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
            >
              Hari Ini
            </button>
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
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

          {/* Category & Payment Method Filter */}
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            >
              <option value="ALL">Semua Kategori</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            >
              <option value="ALL">Semua Metode Pembayaran</option>
              <option value="TUNAI">Tunai</option>
              <option value="TRANSFER">Transfer</option>
              <option value="QRIS">QRIS</option>
            </select>

            <div className="flex-1 text-right text-sm text-gray-600 self-center">
              Menampilkan {filteredEntries.length} dari {entries.length} data
            </div>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          {entries.length === 0 ? 'Belum ada data pendapatan lain' : 'Tidak ada data yang sesuai dengan filter'}
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
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metode Pembayaran
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
                {currentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatPaymentMethod(entry.paymentMethod)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
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
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Total (halaman ini):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    Rp{' '}
                    {currentEntries
                      .reduce((sum, entry) => sum + toNumber(entry.amount), 0)
                      .toLocaleString('id-ID')}
                  </td>
                  <td colSpan={2}></td>
                </tr>
                <tr className="bg-green-50">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Grand Total (semua filter):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    Rp{' '}
                    {filteredEntries
                      .reduce((sum, entry) => sum + toNumber(entry.amount), 0)
                      .toLocaleString('id-ID')}
                  </td>
                  <td colSpan={2}></td>
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
                          ? 'bg-green-600 text-white border-green-600'
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
    </div>
  )
}
