'use client'

import { useState, useEffect } from 'react'

type IncomeStatementData = {
  period: {
    startDate: string | null
    endDate: string | null
  }
  revenue: {
    dailyIncome: {
      konsultasi: number
      tindakanMedis: number
      obat: number
      gigi: number
      antigen: number
      subtotal: number
    }
    otherIncome: {
      byCategory: Record<string, number>
      subtotal: number
    }
    qrisFee: number
    grossProfit: number
    totalRevenue: number
  }
  expenses: {
    byCategory: Record<string, number>
    total: number
  }
  netIncome: number
}

type IncomeStatementProps = {
  startDate: string
  endDate: string
}

export default function IncomeStatement({ startDate, endDate }: IncomeStatementProps) {
  const [data, setData] = useState<IncomeStatementData | null>(null)
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

      const response = await fetch(`/api/reports/income-statement?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch income statement')
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

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">LAPORAN LABA RUGI</h2>
        <h3 className="text-xl font-semibold text-gray-700 mt-1">INCOME STATEMENT</h3>
        <p className="text-gray-600 mt-2">
          Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Awal'} -{' '}
          {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Sekarang'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Revenue Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            PENDAPATAN (REVENUE)
          </h4>

          {/* Daily Income */}
          <div className="ml-4 mb-4">
            <p className="font-medium text-gray-700 mb-2">Pendapatan Harian:</p>
            <div className="ml-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Konsultasi</span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(data.revenue.dailyIncome.konsultasi)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tindakan Medis</span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(data.revenue.dailyIncome.tindakanMedis)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Obat</span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(data.revenue.dailyIncome.obat)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gigi</span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(data.revenue.dailyIncome.gigi)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Antigen</span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(data.revenue.dailyIncome.antigen)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="font-medium text-gray-700">Subtotal Pendapatan Harian</span>
                <span className="text-gray-900 font-mono font-semibold">
                  {formatCurrency(data.revenue.dailyIncome.subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Other Income */}
          {Object.keys(data.revenue.otherIncome.byCategory).length > 0 && (
            <div className="ml-4 mb-4">
              <p className="font-medium text-gray-700 mb-2">Pendapatan Lain:</p>
              <div className="ml-4 space-y-1 text-sm">
                {Object.entries(data.revenue.otherIncome.byCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}</span>
                    <span className="text-gray-900 font-mono">{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="font-medium text-gray-700">Subtotal Pendapatan Lain</span>
                  <span className="text-gray-900 font-mono font-semibold">
                    {formatCurrency(data.revenue.otherIncome.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QRIS Fee */}
          {data.revenue.qrisFee > 0 && (
            <div className="ml-4 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dikurangi: Biaya QRIS</span>
                <span className="text-red-600 font-mono">
                  ({formatCurrency(data.revenue.qrisFee)})
                </span>
              </div>
            </div>
          )}

          {/* Total Revenue */}
          <div className="ml-4 mt-4 pt-3 border-t-2 border-gray-400">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">TOTAL PENDAPATAN</span>
              <span className="text-gray-900 font-mono font-bold text-lg">
                {formatCurrency(data.revenue.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            BEBAN (EXPENSES)
          </h4>

          <div className="ml-4 space-y-1 text-sm">
            {Object.entries(data.expenses.byCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span className="text-gray-600">{category}</span>
                <span className="text-gray-900 font-mono">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>

          <div className="ml-4 mt-4 pt-3 border-t-2 border-gray-400">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">TOTAL BEBAN</span>
              <span className="text-gray-900 font-mono font-bold text-lg">
                {formatCurrency(data.expenses.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="mt-8 pt-4 border-t-4 border-gray-800">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900 text-xl">LABA BERSIH (NET INCOME)</span>
            <span
              className={`font-mono font-bold text-2xl ${
                data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.netIncome)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
