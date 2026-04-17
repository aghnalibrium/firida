'use client'

import { useState } from 'react'

type InternalTransferFormData = {
  date: string
  fromCode: string
  toCode: string
  amount: number
  memo: string
}

type InternalTransferFormProps = {
  onSuccess?: () => void
}

// Bank accounts for internal transfer
const BANK_ACCOUNTS = [
  { code: '101', name: 'Kas Tunai' },
  { code: '102', name: 'Bank BNI' },
  { code: '103', name: 'Bank BSI Operasional' },
  { code: '104', name: 'Bank Mandiri' },
]

export default function InternalTransferForm({ onSuccess }: InternalTransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<InternalTransferFormData>({
    date: new Date().toISOString().split('T')[0],
    fromCode: '',
    toCode: '',
    amount: 0,
    memo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation: from and to cannot be the same
    if (formData.fromCode === formData.toCode) {
      setError('Rekening asal dan tujuan tidak boleh sama')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/internal-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          memo: formData.memo || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create entry')
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        fromCode: '',
        toCode: '',
        amount: 0,
        memo: '',
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

  // Get available "To" accounts (exclude selected "From" account)
  const getAvailableToAccounts = () => {
    if (!formData.fromCode) return BANK_ACCOUNTS
    return BANK_ACCOUNTS.filter((acc) => `${acc.code} ${acc.name}` !== formData.fromCode)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transfer Internal</h2>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        {/* From Account */}
        <div>
          <label htmlFor="fromCode" className="block text-sm font-medium text-gray-700 mb-1">
            Dari Rekening *
          </label>
          <select
            id="fromCode"
            name="fromCode"
            required
            value={formData.fromCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">Pilih Rekening Asal</option>
            {BANK_ACCOUNTS.map((acc) => (
              <option key={acc.code} value={`${acc.code} ${acc.name}`}>
                {acc.code} - {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* To Account */}
        <div>
          <label htmlFor="toCode" className="block text-sm font-medium text-gray-700 mb-1">
            Ke Rekening *
          </label>
          <select
            id="toCode"
            name="toCode"
            required
            value={formData.toCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">Pilih Rekening Tujuan</option>
            {getAvailableToAccounts().map((acc) => (
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>
      </div>

      {/* Transfer Summary */}
      {formData.fromCode && formData.toCode && formData.amount > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-md">
          <p className="text-sm text-gray-700 mb-2">Ringkasan Transfer:</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dari:</span>
              <span className="font-medium text-gray-800">{formData.fromCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ke:</span>
              <span className="font-medium text-gray-800">{formData.toCode}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
              <span className="text-gray-700">Jumlah:</span>
              <span className="text-xl font-bold text-indigo-600">
                Rp {formData.amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Memproses Transfer...' : 'Transfer'}
        </button>
      </div>
    </form>
  )
}
