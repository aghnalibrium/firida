'use client'

import { useState, useEffect } from 'react'

type CashFlowData = {
  period: {
    startDate: string | null
    endDate: string | null
  }
  operatingActivities: {
    cashInflows: {
      dailyIncome: {
        total: number
      }
      otherIncome: {
        byCategory: Record<string, number>
        total: number
      }
      totalInflows: number
    }
    cashOutflows: {
      expenses: {
        byCategory: Record<string, number>
        total: number
      }
      qrisFees: number
      totalOutflows: number
    }
    netCashFromOperating: number
  }
  investingActivities: {
    purchases: Record<string, number>
    sales: Record<string, number>
    netCashFromInvesting: number
  }
  financingActivities: {
    borrowings: Record<string, number>
    repayments: Record<string, number>
    contributions: Record<string, number>
    netCashFromFinancing: number
  }
  netChangeInCash: number
  summary: {
    totalCashInflows: number
    totalCashOutflows: number
    netChangeInCash: number
  }
}

type CashFlowStatementProps = {
  startDate: string
  endDate: string
}

export default function CashFlowStatement({ startDate, endDate }: CashFlowStatementProps) {
  const [data, setData] = useState<CashFlowData | null>(null)
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

      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch cash flow statement')
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
        <h2 className="text-2xl font-bold text-gray-800">LAPORAN ARUS KAS</h2>
        <h3 className="text-xl font-semibold text-gray-700 mt-1">CASH FLOW STATEMENT</h3>
        <p className="text-gray-600 mt-2">
          Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Awal'} -{' '}
          {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Sekarang'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Operating Activities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            AKTIVITAS OPERASIONAL (OPERATING ACTIVITIES)
          </h4>

          {/* Cash Inflows */}
          <div className="ml-4 mb-4">
            <p className="font-medium text-gray-700 mb-2">Penerimaan Kas (Cash Inflows):</p>
            <div className="ml-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pendapatan Harian</span>
                <span className="text-green-600 font-mono">
                  {formatCurrency(data.operatingActivities.cashInflows.dailyIncome.total)}
                </span>
              </div>

              {Object.keys(data.operatingActivities.cashInflows.otherIncome.byCategory).length >
                0 && (
                <>
                  <div className="mt-2">
                    <span className="text-gray-600">Pendapatan Lain:</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    {Object.entries(
                      data.operatingActivities.cashInflows.otherIncome.byCategory
                    ).map(([category, amount]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-500 text-xs">- {category}</span>
                        <span className="text-green-600 font-mono text-xs">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-between border-t pt-1 mt-2">
                <span className="font-medium text-gray-700">Total Penerimaan Kas</span>
                <span className="text-green-600 font-mono font-semibold">
                  {formatCurrency(data.operatingActivities.cashInflows.totalInflows)}
                </span>
              </div>
            </div>
          </div>

          {/* Cash Outflows */}
          <div className="ml-4 mb-4">
            <p className="font-medium text-gray-700 mb-2">Pengeluaran Kas (Cash Outflows):</p>
            <div className="ml-4 space-y-1 text-sm">
              {Object.entries(data.operatingActivities.cashOutflows.expenses.byCategory).map(
                ([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}</span>
                    <span className="text-red-600 font-mono">({formatCurrency(amount)})</span>
                  </div>
                )
              )}

              {data.operatingActivities.cashOutflows.qrisFees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya QRIS</span>
                  <span className="text-red-600 font-mono">
                    ({formatCurrency(data.operatingActivities.cashOutflows.qrisFees)})
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t pt-1 mt-2">
                <span className="font-medium text-gray-700">Total Pengeluaran Kas</span>
                <span className="text-red-600 font-mono font-semibold">
                  ({formatCurrency(data.operatingActivities.cashOutflows.totalOutflows)})
                </span>
              </div>
            </div>
          </div>

          {/* Net Operating */}
          <div className="ml-4 mt-4 pt-3 border-t-2 border-gray-400">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">
                Kas Bersih dari Aktivitas Operasional
              </span>
              <span
                className={`font-mono font-bold text-lg ${
                  data.operatingActivities.netCashFromOperating >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(data.operatingActivities.netCashFromOperating)}
              </span>
            </div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            AKTIVITAS INVESTASI (INVESTING ACTIVITIES)
          </h4>

          <div className="ml-4">
            {Object.keys(data.investingActivities.purchases).length === 0 &&
            Object.keys(data.investingActivities.sales).length === 0 ? (
              <p className="text-gray-500 text-sm italic">Tidak ada aktivitas investasi</p>
            ) : (
              <div className="ml-4 space-y-1 text-sm">
                {/* Purchases and sales would be listed here */}
              </div>
            )}

            <div className="mt-4 pt-3 border-t-2 border-gray-400">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">
                  Kas Bersih dari Aktivitas Investasi
                </span>
                <span className="text-gray-900 font-mono font-bold text-lg">
                  {formatCurrency(data.investingActivities.netCashFromInvesting)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            AKTIVITAS PENDANAAN (FINANCING ACTIVITIES)
          </h4>

          <div className="ml-4">
            {Object.keys(data.financingActivities.borrowings).length === 0 &&
            Object.keys(data.financingActivities.repayments).length === 0 &&
            Object.keys(data.financingActivities.contributions).length === 0 ? (
              <p className="text-gray-500 text-sm italic">Tidak ada aktivitas pendanaan</p>
            ) : (
              <div className="ml-4 space-y-1 text-sm">
                {/* Borrowings, repayments, contributions would be listed here */}
              </div>
            )}

            <div className="mt-4 pt-3 border-t-2 border-gray-400">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">
                  Kas Bersih dari Aktivitas Pendanaan
                </span>
                <span className="text-gray-900 font-mono font-bold text-lg">
                  {formatCurrency(data.financingActivities.netCashFromFinancing)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Change in Cash */}
        <div className="mt-8 pt-4 border-t-4 border-gray-800">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900 text-xl">
              KENAIKAN (PENURUNAN) BERSIH KAS
            </span>
            <span
              className={`font-mono font-bold text-2xl ${
                data.netChangeInCash >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.netChangeInCash)}
            </span>
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Ringkasan:</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Penerimaan Kas</span>
                <span className="text-green-600 font-mono">
                  {formatCurrency(data.summary.totalCashInflows)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Pengeluaran Kas</span>
                <span className="text-red-600 font-mono">
                  ({formatCurrency(data.summary.totalCashOutflows)})
                </span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="font-medium text-gray-700">Perubahan Kas Bersih</span>
                <span
                  className={`font-mono font-semibold ${
                    data.summary.netChangeInCash >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(data.summary.netChangeInCash)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
