'use client'

import { useState, useEffect } from 'react'

type EquityChangeData = {
  period: {
    startDate: string
    endDate: string
  }
  beginningEquity: number
  additions: {
    netIncome: number
  }
  deductions: {
    withdrawals: number
  }
  endingEquity: number
}

type EquityChangeStatementProps = {
  startDate: string
  endDate: string
}

export default function EquityChangeStatement({ startDate, endDate }: EquityChangeStatementProps) {
  const [data, setData] = useState<EquityChangeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [startDate, endDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/equity-change?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch equity change statement')
      }

      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  // Don't render if no date range selected
  if (!startDate || !endDate) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Silakan pilih periode tanggal untuk melihat laporan</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">LAPORAN PERUBAHAN EKUITAS</h2>
        <h3 className="text-xl font-semibold text-gray-700 mt-1">STATEMENT OF CHANGES IN EQUITY</h3>
        <p className="text-gray-600 mt-2">
          Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Awal'} -{' '}
          {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Sekarang'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Beginning Equity */}
        <div>
          <div className="flex justify-between py-3 border-b-2 border-gray-300">
            <span className="font-semibold text-gray-800">
              <span className="font-mono text-xs text-gray-500">3-100</span> - Modal Awal Periode (Beginning Equity)
            </span>
            <span className="text-gray-900 font-mono font-semibold text-lg">
              {formatCurrency(data.beginningEquity)}
            </span>
          </div>
        </div>

        {/* Additions */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">PENAMBAHAN (Additions):</h4>
          <div className="ml-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Laba Bersih Periode Berjalan (Net Income)</span>
              <span className="text-gray-900 font-mono">
                {formatCurrency(data.additions.netIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        {data.deductions.withdrawals > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">PENGURANGAN (Deductions):</h4>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Prive/Penarikan Modal (Withdrawals)</span>
                <span className="text-red-600 font-mono">
                  ({formatCurrency(data.deductions.withdrawals)})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ending Equity */}
        <div className="mt-8 pt-4 border-t-4 border-gray-800">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900 text-xl">
              <span className="font-mono text-sm text-gray-500">3-100</span> - MODAL AKHIR PERIODE (Ending Equity)
            </span>
            <span
              className={`font-mono font-bold text-2xl ${
                data.endingEquity >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.endingEquity)}
            </span>
          </div>
        </div>

        {/* Explanation Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Catatan:</span> Laporan ini menunjukkan perubahan ekuitas dari awal periode hingga akhir periode.
            Modal awal dihitung dari akumulasi laba rugi sejak awal berdirinya klinik hingga hari sebelum periode dimulai.
          </p>
        </div>
      </div>
    </div>
  )
}
