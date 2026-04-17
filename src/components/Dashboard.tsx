'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Summary = {
  totalDailyIncome: number
  totalOtherIncome: number
  totalIncome: number
  totalExpenses: number
  netProfit: number
}

type Counts = {
  dailyIncomeCount: number
  otherIncomeCount: number
  expenseCount: number
}

type Breakdowns = {
  paymentMethod: { [key: string]: number }
  shift: { [key: string]: number }
  expenseCategory: { [key: string]: number }
  otherIncomeCategory: { [key: string]: number }
}

type ReportData = {
  summary: Summary
  counts: Counts
  breakdowns: Breakdowns
}

export default function Dashboard() {
  const [data, setData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Date range state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/summary?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFilterApply = () => {
    fetchData()
  }

  const handleResetFilter = () => {
    setStartDate('')
    setEndDate('')
    // Trigger fetch after state update
    setTimeout(() => fetchData(), 0)
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

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

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Tidak ada data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Laporan Keuangan</h2>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilterApply}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Terapkan Filter
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Daily Income */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Pendapatan Harian</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.summary.totalDailyIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{data.counts.dailyIncomeCount} transaksi</p>
        </div>

        {/* Other Income */}
        <div className="bg-green-50 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Pendapatan Lain</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(data.summary.totalOtherIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{data.counts.otherIncomeCount} transaksi</p>
        </div>

        {/* Total Income */}
        <div className="bg-teal-50 p-6 rounded-lg shadow-md border-l-4 border-teal-500">
          <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-teal-600">
            {formatCurrency(data.summary.totalIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.counts.dailyIncomeCount + data.counts.otherIncomeCount} transaksi
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-red-50 p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(data.summary.totalExpenses)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{data.counts.expenseCount} transaksi</p>
        </div>

        {/* Net Profit */}
        <div className={`p-6 rounded-lg shadow-md border-l-4 ${
          data.summary.netProfit >= 0
            ? 'bg-purple-50 border-purple-500'
            : 'bg-orange-50 border-orange-500'
        }`}>
          <p className="text-sm text-gray-600 mb-1">Laba Bersih</p>
          <p className={`text-2xl font-bold ${
            data.summary.netProfit >= 0 ? 'text-purple-600' : 'text-orange-600'
          }`}>
            {formatCurrency(data.summary.netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.summary.netProfit >= 0 ? 'Profit' : 'Loss'}
          </p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Pendapatan Harian per Metode Pembayaran
          </h3>
          {Object.keys(data.breakdowns.paymentMethod).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(data.breakdowns.paymentMethod).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">{method}</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada data</p>
          )}
        </div>

        {/* Shift Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Pendapatan Harian per Shift</h3>
          {Object.keys(data.breakdowns.shift).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(data.breakdowns.shift).map(([shift, amount]) => (
                <div key={shift} className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">{shift}</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada data</p>
          )}
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Pengeluaran per Kategori</h3>
          {Object.keys(data.breakdowns.expenseCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(data.breakdowns.expenseCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-semibold text-red-600">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada data</p>
          )}
        </div>

        {/* Other Income Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Pendapatan Lain per Kategori</h3>
          {Object.keys(data.breakdowns.otherIncomeCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(data.breakdowns.otherIncomeCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada data</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Pendapatan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Pendapatan Harian', value: data.summary.totalDailyIncome },
                { name: 'Pendapatan Lain', value: data.summary.totalOtherIncome },
                { name: 'Pengeluaran', value: data.summary.totalExpenses },
                { name: 'Laba Bersih', value: data.summary.netProfit },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Category Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Distribusi Pengeluaran</h3>
          {Object.keys(data.breakdowns.expenseCategory).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.breakdowns.expenseCategory).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(data.breakdowns.expenseCategory).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-20">Tidak ada data pengeluaran</p>
          )}
        </div>

        {/* Payment Method Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Metode Pembayaran</h3>
          {Object.keys(data.breakdowns.paymentMethod).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.breakdowns.paymentMethod).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(data.breakdowns.paymentMethod).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-20">Tidak ada data</p>
          )}
        </div>

        {/* Shift Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Distribusi per Shift</h3>
          {Object.keys(data.breakdowns.shift).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.breakdowns.shift).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(data.breakdowns.shift).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-20">Tidak ada data</p>
          )}
        </div>
      </div>
    </div>
  )
}
