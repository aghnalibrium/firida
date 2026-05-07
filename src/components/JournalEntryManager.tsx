'use client'

import { useState } from 'react'
import JournalEntryList from './JournalEntryList'
import JournalEntryForm from './JournalEntryForm'

type JournalLineDisplay = {
  accountId: string
  debit: string
  credit: string
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

export default function JournalEntryManager() {
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<EditJournalEntry | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (entry: any) => {
    setEditEntry(entry)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditEntry(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditEntry(null)
  }

  const handleNewEntry = () => {
    setEditEntry(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jurnal Umum</h2>
          <p className="text-gray-600 mt-1">
            Buat jurnal manual untuk modal awal, jurnal penyesuaian, dan transaksi khusus lainnya
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleNewEntry}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 shadow-md font-semibold"
          >
            + Tambah Jurnal Baru
          </button>
        )}
      </div>

      {/* Form or List */}
      {showForm ? (
        <JournalEntryForm
          editEntry={editEntry}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <JournalEntryList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      )}
    </div>
  )
}
