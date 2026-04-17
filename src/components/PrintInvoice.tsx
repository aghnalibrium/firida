'use client'

type Expense = {
  id: string
  date: string
  jenis: string
  memo: string | null
  amount: number
  payFrom: string
  vendor: string | null
  refNo: string | null
}

type PrintInvoiceProps = {
  expense: Expense
  onClose: () => void
}

export default function PrintInvoice({ expense, onClose }: PrintInvoiceProps) {
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Print area */}
        <div className="p-8 print:p-0" id="invoice">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">FIRIDA</h1>
            <p className="text-sm text-gray-600">Firdaus Digital Finance - Klinik</p>
            <p className="text-xs text-gray-500 mt-1">Sistem Manajemen Keuangan</p>
            <div className="border-b-2 border-gray-300 my-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">BUKTI PENGELUARAN</h2>
          </div>

          {/* Transaction Details */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600 w-1/3">Tanggal</td>
                  <td className="py-1">: {formatDate(expense.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Kategori</td>
                  <td className="py-1">: {expense.jenis}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Dibayar dari</td>
                  <td className="py-1">: {expense.payFrom}</td>
                </tr>
                {expense.vendor && (
                  <tr>
                    <td className="py-1 text-gray-600">Vendor/Penerima</td>
                    <td className="py-1">: {expense.vendor}</td>
                  </tr>
                )}
                {expense.refNo && (
                  <tr>
                    <td className="py-1 text-gray-600">No. Referensi</td>
                    <td className="py-1">: {expense.refNo}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-gray-700">Deskripsi</th>
                  <th className="text-right py-2 text-gray-700">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">{expense.jenis}</td>
                  <td className="text-right py-2">{formatCurrency(expense.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="py-3 font-bold text-gray-800">TOTAL</td>
                  <td className="text-right py-3 font-bold text-gray-800">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Memo */}
          {expense.memo && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Keterangan:</span> {expense.memo}
              </p>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-12">Dibuat oleh,</p>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-sm text-gray-600">( ________________ )</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-12">Disetujui oleh,</p>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-sm text-gray-600">( ________________ )</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan
            </p>
            <p className="text-xs text-center text-gray-400 mt-1">
              ID Transaksi: {expense.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice,
          #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
