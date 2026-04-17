'use client'

import { useState } from 'react'
import IncomeStatement from './IncomeStatement'
import BalanceSheet from './BalanceSheet'
import CashFlowStatement from './CashFlowStatement'
import { exportToExcel, exportToPDF, type FinancialData } from '@/lib/export'

type ReportType = 'income' | 'balance' | 'cashflow'

export default function FinancialReports() {
  const [activeReport, setActiveReport] = useState<ReportType>('income')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  const handleApplyDateFilter = () => {
    // Trigger re-render by updating state
    // The child components will automatically refetch with new dates
  }

  const handleResetDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setAsOfDate(new Date().toISOString().split('T')[0])
  }

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!startDate || !endDate) {
      alert('Silakan pilih periode tanggal terlebih dahulu')
      return
    }

    try {
      const response = await fetch(
        `/api/reports/export?startDate=${startDate}&endDate=${endDate}`
      )
      const data: FinancialData = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch export data')
      }

      if (format === 'excel') {
        exportToExcel(data)
      } else {
        exportToPDF(data)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export laporan. Silakan coba lagi.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Type Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveReport('income')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeReport === 'income'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Laporan Laba Rugi
          </button>
          <button
            onClick={() => setActiveReport('balance')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeReport === 'balance'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Neraca
          </button>
          <button
            onClick={() => setActiveReport('cashflow')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeReport === 'cashflow'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Laporan Arus Kas
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Tanggal</h3>

        {activeReport === 'balance' ? (
          // Balance Sheet uses "As Of Date"
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label htmlFor="asOfDate" className="block text-sm font-medium text-gray-700 mb-1">
                Per Tanggal (As Of Date)
              </label>
              <input
                type="date"
                id="asOfDate"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <button
              onClick={handleResetDateFilter}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        ) : (
          // Income Statement and Cash Flow use date range
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <button
              onClick={handleApplyDateFilter}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Terapkan
            </button>
            <button
              onClick={handleResetDateFilter}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                disabled={!startDate || !endDate}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                disabled={!startDate || !endDate}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 text-sm text-gray-600">
          <p>
            {activeReport === 'balance'
              ? 'Neraca menampilkan posisi keuangan pada tanggal tertentu'
              : 'Laporan menampilkan data untuk periode tanggal yang dipilih'}
          </p>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {activeReport === 'income' && (
          <IncomeStatement startDate={startDate} endDate={endDate} />
        )}
        {activeReport === 'balance' && <BalanceSheet asOfDate={asOfDate} />}
        {activeReport === 'cashflow' && (
          <CashFlowStatement startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  )
}
