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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printingIncome, setPrintingIncome] = useState<DailyIncome | null>(null)

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
    // Potongan QRIS hanya berlaku jika metode pembayaran adalah QRIS
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
        <h2 className="text-2xl font-bold text-gray-800">Daftar Pendapatan Harian</h2>
      </div>

      {entries.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          Belum ada data pendapatan harian
        </div>
      ) : (
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
              {entries.map((entry) => (
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
                  Total Keseluruhan:
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {formatCurrency(entries.reduce((sum, entry) => sum + calculateTotalKotor(entry), 0))}
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-600">
                  {formatCurrency(entries.reduce((sum, entry) => sum + getPotonganQris(entry), 0))}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {formatCurrency(entries.reduce((sum, entry) => sum + calculateTotalBersih(entry), 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
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
