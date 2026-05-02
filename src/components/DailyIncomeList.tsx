'use client'

import { useEffect, useState } from 'react'
import PrintReceipt from './PrintReceipt'

type DailyIncome = {
  id: string
  date: string
  shift: string
  patientName: string | null
  paymentMethod: string
  qrisFee: number | string
  konsultasi: number | string
  tindakanMedis: number | string
  obat: number | string
  gigi: number | string
  antigen: number | string
  memo: string | null
  createdAt: string
  updatedAt: string
}

type DailyIncomeListProps = {
  refreshTrigger?: number
}

export default function DailyIncomeList({ refreshTrigger }: DailyIncomeListProps) {
  const [entries, setEntries] = useState<DailyIncome[]>([])
  const [filteredEntries, setFilteredEntries] = useState<DailyIncome[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printingIncome, setPrintingIncome] = useState<DailyIncome | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [shiftFilter, setShiftFilter] = useState<string>('ALL')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/daily-income')
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

  // Apply filters
  useEffect(() => {
    let filtered = [...entries]

    // Search filter (by patient name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.patientName?.toLowerCase().includes(query) ||
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

    // Shift filter
    if (shiftFilter !== 'ALL') {
      filtered = filtered.filter((entry) => entry.shift === shiftFilter)
    }

    // Payment method filter
    if (paymentMethodFilter !== 'ALL') {
      filtered = filtered.filter((entry) => entry.paymentMethod === paymentMethodFilter)
    }

    setFilteredEntries(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [entries, searchQuery, startDate, endDate, shiftFilter, paymentMethodFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/daily-income/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete entry')
      }

      // Refresh the list
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
    setShiftFilter('ALL')
    setPaymentMethodFilter('ALL')
  }

  // Helper function to convert Decimal/string to number
  const toNumber = (value: number | string): number => {
    return typeof value === 'string' ? parseFloat(value) || 0 : value
  }

  const calculateTotalKotor = (entry: DailyIncome) => {
    return (
      toNumber(entry.konsultasi) +
      toNumber(entry.tindakanMedis) +
      toNumber(entry.obat) +
      toNumber(entry.gigi) +
      toNumber(entry.antigen)
    )
  }

  const getPotonganQris = (entry: DailyIncome) => {
    return entry.paymentMethod === 'QRIS' ? toNumber(entry.qrisFee) : 0
  }

  const calculateTotalBersih = (entry: DailyIncome) => {
    return calculateTotalKotor(entry) - getPotonganQris(entry)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-600">Memuat data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daftar Pendapatan Harian</h2>

        {/* Filters Section */}
        <div className="space-y-4">
          {/* Search Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="🔍 Cari nama pasien atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {(searchQuery || startDate || endDate || shiftFilter !== 'ALL' || paymentMethodFilter !== 'ALL') && (
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
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
            >
              Hari Ini
            </button>
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
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

          {/* Filter Dropdowns */}
          <div className="flex gap-2">
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            >
              <option value="ALL">Semua Shift</option>
              <option value="PAGI">Pagi</option>
              <option value="SIANG">Siang</option>
              <option value="MALAM">Malam</option>
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
          {entries.length === 0 ? 'Belum ada data pendapatan harian' : 'Tidak ada data yang sesuai dengan filter'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konsultasi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tindakan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gigi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Antigen
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Potongan QRIS
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Akhir
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {entry.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.patientName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entry.paymentMethod === 'TUNAI' ? 'bg-green-100 text-green-800' :
                        entry.paymentMethod === 'TRANSFER' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {entry.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(toNumber(entry.konsultasi))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(toNumber(entry.tindakanMedis))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(toNumber(entry.obat))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(toNumber(entry.gigi))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(toNumber(entry.antigen))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(calculateTotalKotor(entry))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      {getPotonganQris(entry) > 0 ? formatCurrency(getPotonganQris(entry)) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(calculateTotalBersih(entry))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setPrintingIncome(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-right font-semibold text-gray-900">
                    Total (halaman ini):
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(currentEntries.reduce((sum, entry) => sum + calculateTotalKotor(entry), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {formatCurrency(currentEntries.reduce((sum, entry) => sum + getPotonganQris(entry), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(currentEntries.reduce((sum, entry) => sum + calculateTotalBersih(entry), 0))}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={9} className="px-6 py-4 text-right font-semibold text-gray-900">
                    Grand Total (semua filter):
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(filteredEntries.reduce((sum, entry) => sum + calculateTotalKotor(entry), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {formatCurrency(filteredEntries.reduce((sum, entry) => sum + getPotonganQris(entry), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(filteredEntries.reduce((sum, entry) => sum + calculateTotalBersih(entry), 0))}
                  </td>
                  <td></td>
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

                {/* Page numbers */}
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
                          ? 'bg-blue-600 text-white border-blue-600'
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

      {/* Print Receipt Modal */}
      {printingIncome && (
        <PrintReceipt
          income={{
            ...printingIncome,
            qrisFee: Number(printingIncome.qrisFee),
            konsultasi: Number(printingIncome.konsultasi),
            tindakanMedis: Number(printingIncome.tindakanMedis),
            obat: Number(printingIncome.obat),
            gigi: Number(printingIncome.gigi),
            antigen: Number(printingIncome.antigen),
          }}
          onClose={() => setPrintingIncome(null)}
        />
      )}
    </div>
  )
}
