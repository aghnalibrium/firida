'use client'

import { useState } from 'react'

type OtherIncomeFormData = {
  date: string
  category: string
  memo: string
  paymentMethod: 'TUNAI' | 'TRANSFER' | 'QRIS' | ''
  amount: number
}

type OtherIncomeFormProps = {
  onSuccess?: () => void
}

// Common categories for Other Income
const COMMON_CATEGORIES = [
  'Sewa',
  'Jasa Konsultasi',
  'Penjualan Aset',
  'Bunga Bank',
  'Lain-lain',
]

export default function OtherIncomeForm({ onSuccess }: OtherIncomeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<OtherIncomeFormData>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    memo: '',
    paymentMethod: '',
    amount: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/other-income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          paymentMethod: formData.paymentMethod || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create entry')
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        memo: '',
        paymentMethod: '',
        amount: 0,
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Input Pendapatan Lain</h2>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Kategori *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            required
            list="category-suggestions"
            value={formData.category}
            onChange={handleChange}
            placeholder="Pilih atau ketik kategori baru"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <datalist id="category-suggestions">
            {COMMON_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-gray-500">
            Pilih dari daftar atau ketik kategori baru
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Metode Pembayaran
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Tidak Ada</option>
            <option value="TUNAI">Tunai</option>
            <option value="TRANSFER">Transfer</option>
            <option value="QRIS">QRIS</option>
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
            step="1"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Total Display */}
      <div className="mt-6 p-4 bg-green-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total:</span>
          <span className="text-xl font-bold text-green-600">
            Rp {formData.amount.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
