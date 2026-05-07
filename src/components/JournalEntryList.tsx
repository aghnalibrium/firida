'use client'

import { useState, useEffect } from 'react'

type JournalLine = {
  id: string
  accountId: string
  debit: number
  credit: number
  account: {
    code: string
    name: string
  }
}

type JournalEntry = {
  id: string
  date: string
  memo: string | null
  sourceType: string | null
  sourceId: string | null
  lines: JournalLine[]
  createdAt: string
}

type JournalEntryListProps = {
  onEdit: (entry: JournalEntry) => void
  refreshTrigger: number
}

export default function JournalEntryList({ onEdit, refreshTrigger }: JournalEntryListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [refreshTrigger])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('sourceType', 'MANUAL') // Only fetch manual entries
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/journal-entries?${params.toString()}`)
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/journal-entries/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Jurnal berhasil dihapus')
        fetchEntries()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menghapus jurnal')
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      alert('Terjadi kesalahan saat menghapus jurnal')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTotalDebit = (lines: JournalLine[]) => {
    return lines.reduce((sum, line) => sum + Number(line.debit), 0)
  }

  const getTotalCredit = (lines: JournalLine[]) => {
    return lines.reduce((sum, line) => sum + Number(line.credit), 0)
  }

  const toggleExpand = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId)
  }

  if (loading) {
    return <div className="text-gray-600">Memuat data...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filter Jurnal</h3>
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
            onClick={fetchEntries}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Filter
          </button>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
              fetchEntries()
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h3 className="text-lg font-semibold text-white">
            Daftar Jurnal Umum ({entries.length} entri)
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Belum ada jurnal umum. Klik tombol "Tambah Jurnal Baru" untuk membuat jurnal.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => {
              const isExpanded = expandedEntry === entry.id
              const totalDebit = getTotalDebit(entry.lines)
              const totalCredit = getTotalCredit(entry.lines)

              return (
                <div key={entry.id} className="p-4 hover:bg-gray-50">
                  {/* Entry Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(entry.date)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          Manual Entry
                        </span>
                      </div>
                      {entry.memo && (
                        <p className="text-sm text-gray-600 italic">{entry.memo}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          Debit: <span className="font-semibold text-green-600">{formatCurrency(totalDebit)}</span>
                        </span>
                        <span className="text-gray-600">
                          Kredit: <span className="font-semibold text-blue-600">{formatCurrency(totalCredit)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        {isExpanded ? 'Tutup' : 'Detail'}
                      </button>
                      <button
                        onClick={() => onEdit(entry)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-2 px-2 text-gray-700">Kode</th>
                            <th className="text-left py-2 px-2 text-gray-700">Nama Akun</th>
                            <th className="text-right py-2 px-2 text-gray-700">Debit</th>
                            <th className="text-right py-2 px-2 text-gray-700">Kredit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.lines.map((line) => (
                            <tr key={line.id} className="border-b border-gray-200">
                              <td className="py-2 px-2 text-gray-600 font-mono text-xs">
                                {line.account.code}
                              </td>
                              <td className="py-2 px-2 text-gray-800">{line.account.name}</td>
                              <td className="py-2 px-2 text-right font-mono text-green-700">
                                {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-blue-700">
                                {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-semibold border-t-2 border-gray-400">
                            <td colSpan={2} className="py-2 px-2 text-gray-900">Total</td>
                            <td className="py-2 px-2 text-right text-green-700">
                              {formatCurrency(totalDebit)}
                            </td>
                            <td className="py-2 px-2 text-right text-blue-700">
                              {formatCurrency(totalCredit)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
