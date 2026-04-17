'use client'

import { useState } from 'react'

type AccountFormData = {
  code: string
  name: string
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE' | ''
  normalBalance: 'DEBIT' | 'CREDIT' | ''
  isActive: boolean
}

type AccountFormProps = {
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: 'ASSET', label: 'Aset (Asset)' },
  { value: 'LIABILITY', label: 'Kewajiban (Liability)' },
  { value: 'EQUITY', label: 'Modal (Equity)' },
  { value: 'INCOME', label: 'Pendapatan (Income)' },
  { value: 'EXPENSE', label: 'Beban (Expense)' },
]

const NORMAL_BALANCES = [
  { value: 'DEBIT', label: 'Debit' },
  { value: 'CREDIT', label: 'Kredit (Credit)' },
]

export default function AccountForm({ onSuccess }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<AccountFormData>({
    code: '',
    name: '',
    category: '',
    normalBalance: '',
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Reset form
      setFormData({
        code: '',
        name: '',
        category: '',
        normalBalance: '',
        isActive: true,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tambah Akun Baru</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Kode Akun *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            required
            value={formData.code}
            onChange={handleChange}
            placeholder="Contoh: 101, 102, 401"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">Kode akun harus unik</p>
        </div>

        {/* Account Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Akun *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: Kas Tunai, Bank BNI"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Kategori *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
          >
            <option value="">Pilih Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Normal Balance */}
        <div>
          <label htmlFor="normalBalance" className="block text-sm font-medium text-gray-700 mb-1">
            Saldo Normal *
          </label>
          <select
            id="normalBalance"
            name="normalBalance"
            required
            value={formData.normalBalance}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
          >
            <option value="">Pilih Saldo Normal</option>
            {NORMAL_BALANCES.map((nb) => (
              <option key={nb.value} value={nb.value}>
                {nb.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Aset & Beban: Debit | Kewajiban, Modal & Pendapatan: Kredit
          </p>
        </div>

        {/* Is Active */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">Akun Aktif</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Akun yang tidak aktif tidak akan muncul dalam pilihan transaksi
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
        </button>
      </div>
    </form>
  )
}
