'use client'

import { useState } from 'react'

type ExpenseFormData = {
  date: string
  jenis: string
  memo: string
  amount: number
  payFrom: string
  vendor: string
  refNo: string
}

type ExpenseFormProps = {
  onSuccess?: () => void
}

// Common expense categories
const EXPENSE_CATEGORIES = [
  'Gaji Karyawan',
  'Obat & Alat Kesehatan',
  'Utilitas (Listrik, Air)',
  'Sewa Gedung',
  'Perawatan & Perbaikan',
  'ATK & Perlengkapan',
  'Transport & Operasional',
  'Marketing & Promosi',
  'Pajak & Administrasi',
  'Lain-lain',
]

// Common payment accounts (based on typical clinic accounts)
const PAYMENT_ACCOUNTS = [
  { code: '101', name: 'Kas Tunai' },
  { code: '102', name: 'Bank BNI' },
  { code: '103', name: 'Bank BSI Operasional' },
  { code: '104', name: 'Bank Mandiri' },
]

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    jenis: '',
    memo: '',
    amount: 0,
    payFrom: '',
    vendor: '',
    refNo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vendor: formData.vendor || null,
          refNo: formData.refNo || null,
          memo: formData.memo || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create entry')
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        jenis: '',
        memo: '',
        amount: 0,
        payFrom: '',
        vendor: '',
        refNo: '',
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Input Pengeluaran/Biaya</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Jenis/Category */}
        <div>
          <label htmlFor="jenis" className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Pengeluaran *
          </label>
          <select
            id="jenis"
            name="jenis"
            required
            value={formData.jenis}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          >
            <option value="">Pilih Jenis</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Pay From */}
        <div>
          <label htmlFor="payFrom" className="block text-sm font-medium text-gray-700 mb-1">
            Dibayar Dari *
          </label>
          <select
            id="payFrom"
            name="payFrom"
            required
            value={formData.payFrom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          >
            <option value="">Pilih Rekening</option>
            {PAYMENT_ACCOUNTS.map((acc) => (
              <option key={acc.code} value={`${acc.code} ${acc.name}`}>
                {acc.code} - {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah (Rp) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            min="0"
            step="1000"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Vendor */}
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
            Vendor/Pemasok
          </label>
          <input
            type="text"
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Reference Number */}
        <div>
          <label htmlFor="refNo" className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Referensi
          </label>
          <input
            type="text"
            id="refNo"
            name="refNo"
            value={formData.refNo}
            onChange={handleChange}
            placeholder="No. Invoice, Faktur, dll"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Memo */}
        <div className="md:col-span-2">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
            Catatan
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={3}
            value={formData.memo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>
      </div>

      {/* Total Display */}
      <div className="mt-6 p-4 bg-red-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Pengeluaran:</span>
          <span className="text-xl font-bold text-red-600">
            Rp {formData.amount.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
