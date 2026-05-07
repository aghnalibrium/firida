'use client'

import { useState, useEffect } from 'react'

type AccountItem = {
  code: string
  name: string
  amount: number
}

type BalanceSheetData = {
  asOfDate: string
  assets: {
    currentAssets: {
      cashItems: AccountItem[]
      totalCash: number
    }
    allAssets?: AccountItem[]
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: Record<string, number>
    allLiabilities?: AccountItem[]
    totalLiabilities: number
  }
  equity: {
    accounts?: AccountItem[]
    retainedEarnings: AccountItem
    totalEquity: number
  }
  balanceCheck: {
    assetsTotal: number
    liabilitiesAndEquityTotal: number
    balanced: boolean
  }
}

type BalanceSheetProps = {
  asOfDate: string
}

export default function BalanceSheet({ asOfDate }: BalanceSheetProps) {
  const [data, setData] = useState<BalanceSheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [asOfDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (asOfDate) params.append('asOfDate', asOfDate)

      const response = await fetch(`/api/reports/balance-sheet?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch balance sheet')
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
        <h2 className="text-2xl font-bold text-gray-800">NERACA</h2>
        <h3 className="text-xl font-semibold text-gray-700 mt-1">BALANCE SHEET</h3>
        <p className="text-gray-600 mt-2">
          Per Tanggal: {new Date(data.asOfDate).toLocaleDateString('id-ID')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Assets Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            ASET (ASSETS)
          </h4>

          <div className="ml-4">
            <p className="font-medium text-gray-700 mb-2">Aset Lancar (Current Assets):</p>
            <div className="ml-4 space-y-1 text-sm">
              <p className="font-medium text-gray-600 mb-1">Kas & Bank (Cash & Bank):</p>
              <div className="ml-4 space-y-1">
                {data.assets.currentAssets.cashItems.map((item) => (
                  <div key={item.code} className="flex justify-between">
                    <span className="text-gray-600">
                      <span className="font-mono text-xs text-gray-500">{item.code}</span> - {item.name}
                    </span>
                    <span className="text-gray-900 font-mono">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t pt-1 mt-2 ml-4">
                <span className="font-medium text-gray-700">Total Kas & Bank</span>
                <span className="text-gray-900 font-mono font-semibold">
                  {formatCurrency(data.assets.currentAssets.totalCash)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-gray-400">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">TOTAL ASET</span>
                <span className="text-gray-900 font-mono font-bold text-lg">
                  {formatCurrency(data.assets.totalAssets)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            KEWAJIBAN (LIABILITIES)
          </h4>

          <div className="ml-4">
            {Object.keys(data.liabilities.currentLiabilities).length > 0 ? (
              <>
                <p className="font-medium text-gray-700 mb-2">
                  Kewajiban Lancar (Current Liabilities):
                </p>
                <div className="ml-4 space-y-1 text-sm">
                  {Object.entries(data.liabilities.currentLiabilities).map(
                    ([liability, amount]) => (
                      <div key={liability} className="flex justify-between">
                        <span className="text-gray-600">{liability}</span>
                        <span className="text-gray-900 font-mono">{formatCurrency(amount)}</span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm italic ml-4">Tidak ada kewajiban</p>
            )}

            <div className="mt-4 pt-3 border-t-2 border-gray-400">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">TOTAL KEWAJIBAN</span>
                <span className="text-gray-900 font-mono font-bold text-lg">
                  {formatCurrency(data.liabilities.totalLiabilities)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Equity Section */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
            MODAL (EQUITY)
          </h4>

          <div className="ml-4">
            <div className="ml-4 space-y-1 text-sm">
              {/* Capital/Equity Accounts (from manual journals like "Modal Awal") */}
              {data.equity.accounts && data.equity.accounts.length > 0 && (
                <>
                  {data.equity.accounts.map((account) => (
                    <div key={account.code} className="flex justify-between">
                      <span className="text-gray-600">
                        <span className="font-mono text-xs text-gray-500">{account.code}</span> - {account.name}
                      </span>
                      <span className="text-gray-900 font-mono">
                        {formatCurrency(account.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Retained Earnings (accumulated profit/loss) */}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <span className="font-mono text-xs text-gray-500">{data.equity.retainedEarnings.code}</span> - {data.equity.retainedEarnings.name}
                </span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(data.equity.retainedEarnings.amount)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-gray-400">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">TOTAL MODAL</span>
                <span className="text-gray-900 font-mono font-bold text-lg">
                  {formatCurrency(data.equity.totalEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Liabilities and Equity */}
        <div className="mt-8 pt-4 border-t-4 border-gray-800">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-gray-900 text-xl">
              TOTAL KEWAJIBAN & MODAL
            </span>
            <span className="text-gray-900 font-mono font-bold text-2xl">
              {formatCurrency(
                data.liabilities.totalLiabilities + data.equity.totalEquity
              )}
            </span>
          </div>

          {/* Balance Check */}
          <div
            className={`p-3 rounded ${
              data.balanceCheck.balanced
                ? 'bg-green-50 border border-green-300'
                : 'bg-red-50 border border-red-300'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                data.balanceCheck.balanced ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {data.balanceCheck.balanced
                ? '✓ Neraca Seimbang (Balanced)'
                : '✗ Neraca Tidak Seimbang (Unbalanced)'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Total Aset: {formatCurrency(data.balanceCheck.assetsTotal)} |
              Total Kewajiban & Modal:{' '}
              {formatCurrency(data.balanceCheck.liabilitiesAndEquityTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
