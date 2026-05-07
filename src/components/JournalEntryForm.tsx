'use client'

import { useState, useEffect } from 'react'

type Account = {
  id: string
  code: string
  name: string
  category: string
  normalBalance: string
}

type JournalLine = {
  accountId: string
  debit: string
  credit: string
}

type JournalLineDisplay = JournalLine & {
  account?: {
    code: string
    name: string
  }
}

type EditJournalEntry = {
  id: string
  date: string
  memo: string | null
  lines: JournalLineDisplay[]
}

type JournalEntryFormProps = {
  editEntry?: EditJournalEntry | null
  onSuccess: () => void
  onCancel: () => void
}

export default function JournalEntryForm({ editEntry, onSuccess, onCancel }: JournalEntryFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [date, setDate] = useState('')
  const [memo, setMemo] = useState('')
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: '', debit: '', credit: '' },
    { accountId: '', debit: '', credit: '' },
  ])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (editEntry) {
      setDate(editEntry.date.split('T')[0])
      setMemo(editEntry.memo || '')
      setLines(
        editEntry.lines.map((line) => ({
          accountId: line.accountId,
          debit: line.debit.toString(),
          credit: line.credit.toString(),
        }))
      )
    }
  }, [editEntry])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts?isActive=true')
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', debit: '', credit: '' }])
  }

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      alert('Minimal harus ada 2 baris jurnal')
      return
    }
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleLineChange = (index: number, field: keyof JournalLine, value: string) => {
    const newLines = [...lines]
    newLines[index][field] = value

    // Auto-clear the opposite field when one is entered
    if (field === 'debit' && value !== '') {
      newLines[index].credit = ''
    } else if (field === 'credit' && value !== '') {
      newLines[index].debit = ''
    }

    setLines(newLines)
  }

  const calculateTotals = () => {
    let totalDebit = 0
    let totalCredit = 0

    lines.forEach((line) => {
      totalDebit += parseFloat(line.debit) || 0
      totalCredit += parseFloat(line.credit) || 0
    })

    return { totalDebit, totalCredit }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!date) {
      alert('Tanggal harus diisi')
      return
    }

    if (lines.length < 2) {
      alert('Minimal harus ada 2 baris jurnal')
      return
    }

    // Check if all lines have account selected
    for (const line of lines) {
      if (!line.accountId) {
        alert('Semua baris jurnal harus memilih akun')
        return
      }
      if (!line.debit && !line.credit) {
        alert('Setiap baris harus memiliki nilai Debit atau Kredit')
        return
      }
      if (line.debit && line.credit) {
        alert('Setiap baris tidak boleh memiliki Debit dan Kredit sekaligus')
        return
      }
    }

    // Check if debit equals credit
    const { totalDebit, totalCredit } = calculateTotals()
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert(`Total Debit (${formatCurrency(totalDebit)}) harus sama dengan Total Kredit (${formatCurrency(totalCredit)})`)
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        date,
        memo: memo || null,
        lines: lines.map((line) => ({
          accountId: line.accountId,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
        })),
      }

      const url = editEntry
        ? `/api/journal-entries/${editEntry.id}`
        : '/api/journal-entries'
      const method = editEntry ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert(editEntry ? 'Jurnal berhasil diperbarui' : 'Jurnal berhasil dibuat')
        onSuccess()

        // Reset form if creating new
        if (!editEntry) {
          setDate('')
          setMemo('')
          setLines([
            { accountId: '', debit: '', credit: '' },
            { accountId: '', debit: '', credit: '' },
          ])
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menyimpan jurnal')
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Terjadi kesalahan saat menyimpan jurnal')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const { totalDebit, totalCredit } = calculateTotals()
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {editEntry ? 'Edit Jurnal Umum' : 'Tambah Jurnal Umum Baru'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Memo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Contoh: Jurnal Modal Awal"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
        </div>

        {/* Journal Lines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Baris Jurnal <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddLine}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              + Tambah Baris
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                    Akun
                  </th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700 border-b">
                    Debit
                  </th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700 border-b">
                    Kredit
                  </th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700 border-b w-20">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                        required
                      >
                        <option value="">Pilih Akun</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={line.debit}
                        onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right text-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={line.credit}
                        onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right text-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={lines.length <= 2}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-3 py-2 text-gray-900">TOTAL</td>
                  <td className="px-3 py-2 text-right text-green-700">
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className="px-3 py-2 text-right text-blue-700">
                    {formatCurrency(totalCredit)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isBalanced ? (
                      <span className="text-green-600 text-xs">✓ Balance</span>
                    ) : (
                      <span className="text-red-600 text-xs">✗ Not Balanced</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {!isBalanced && (
            <p className="mt-2 text-sm text-red-600">
              ⚠️ Total Debit harus sama dengan Total Kredit
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || !isBalanced}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Menyimpan...' : editEntry ? 'Update Jurnal' : 'Simpan Jurnal'}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Petunjuk:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Minimal harus ada 2 baris jurnal</li>
          <li>Setiap baris harus diisi Debit ATAU Kredit, tidak boleh keduanya</li>
          <li>Total Debit harus sama dengan Total Kredit (prinsip double-entry)</li>
          <li>Gunakan untuk jurnal modal awal, jurnal penyesuaian, atau jurnal koreksi</li>
        </ul>
      </div>
    </div>
  )
}
