'use client'

import { useState } from 'react'

type DailyIncomeFormData = {
  date: string
  shift: 'PAGI' | 'SIANG' | 'MALAM'
  patientName: string
  paymentMethod: 'TUNAI' | 'TRANSFER' | 'QRIS'
  qrisFee: number
  konsultasi: number
  tindakanMedis: number
  obat: number
  gigi: number
  antigen: number
  memo: string
}

type DailyIncomeFormProps = {
  onSuccess?: () => void
}

export default function DailyIncomeForm({ onSuccess }: DailyIncomeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<DailyIncomeFormData>({
    date: new Date().toISOString().split('T')[0],
    shift: 'PAGI',
    patientName: '',
    paymentMethod: 'TUNAI',
    qrisFee: 0,
    konsultasi: 0,
    tindakanMedis: 0,
    obat: 0,
    gigi: 0,
    antigen: 0,
    memo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/daily-income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create entry')
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        shift: 'PAGI',
        patientName: '',
        paymentMethod: 'TUNAI',
        qrisFee: 0,
        konsultasi: 0,
        tindakanMedis: 0,
        obat: 0,
        gigi: 0,
        antigen: 0,
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

    // Reset qrisFee jika payment method bukan QRIS
    if (name === 'paymentMethod' && value !== 'QRIS') {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: value as 'TUNAI' | 'TRANSFER' | 'QRIS',
        qrisFee: 0,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }))
    }
  }

  const totalKotor =
    formData.konsultasi +
    formData.tindakanMedis +
    formData.obat +
    formData.gigi +
    formData.antigen

  // Potongan QRIS hanya berlaku jika metode pembayaran adalah QRIS
  const potonganQris = formData.paymentMethod === 'QRIS' ? formData.qrisFee : 0
  const totalBersih = totalKotor - potonganQris

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Input Pendapatan Harian</h2>

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

        {/* Shift */}
        <div>
          <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
            Shift *
          </label>
          <select
            id="shift"
            name="shift"
            required
            value={formData.shift}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="PAGI">Pagi</option>
            <option value="SIANG">Siang</option>
            <option value="MALAM">Malam</option>
          </select>
        </div>

        {/* Patient Name */}
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Pasien
          </label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Metode Pembayaran *
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            required
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="TUNAI">Tunai</option>
            <option value="TRANSFER">Transfer</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        {/* Service Amounts */}
        <div>
          <label htmlFor="konsultasi" className="block text-sm font-medium text-gray-700 mb-1">
            Konsultasi (Rp)
          </label>
          <input
            type="number"
            id="konsultasi"
            name="konsultasi"
            min="0"
            step="1"
            value={formData.konsultasi}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="tindakanMedis" className="block text-sm font-medium text-gray-700 mb-1">
            Tindakan Medis (Rp)
          </label>
          <input
            type="number"
            id="tindakanMedis"
            name="tindakanMedis"
            min="0"
            step="1"
            value={formData.tindakanMedis}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="obat" className="block text-sm font-medium text-gray-700 mb-1">
            Obat (Rp)
          </label>
          <input
            type="number"
            id="obat"
            name="obat"
            min="0"
            step="1"
            value={formData.obat}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="gigi" className="block text-sm font-medium text-gray-700 mb-1">
            Gigi (Rp)
          </label>
          <input
            type="number"
            id="gigi"
            name="gigi"
            min="0"
            step="1"
            value={formData.gigi}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="antigen" className="block text-sm font-medium text-gray-700 mb-1">
            Antigen (Rp)
          </label>
          <input
            type="number"
            id="antigen"
            name="antigen"
            min="0"
            step="1"
            value={formData.antigen}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="qrisFee" className="block text-sm font-medium text-gray-700 mb-1">
            Biaya QRIS (Rp)
          </label>
          <input
            type="number"
            id="qrisFee"
            name="qrisFee"
            min="0"
            step="100"
            value={formData.qrisFee}
            onChange={handleChange}
            disabled={formData.paymentMethod !== 'QRIS'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {formData.paymentMethod !== 'QRIS' && (
            <p className="text-xs text-gray-500 mt-1">Hanya untuk pembayaran QRIS</p>
          )}
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

      {/* Total */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total:</span>
          <span className="text-lg font-semibold text-gray-800">
            Rp {totalKotor.toLocaleString('id-ID')}
          </span>
        </div>
        {potonganQris > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Potongan QRIS:</span>
            <span className="text-lg font-semibold text-red-600">
              - Rp {potonganQris.toLocaleString('id-ID')}
            </span>
          </div>
        )}
        {potonganQris > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
            <span className="text-gray-700">Total Bersih:</span>
            <span className="text-xl font-bold text-blue-600">
              Rp {totalBersih.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
