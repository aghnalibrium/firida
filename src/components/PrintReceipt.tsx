'use client'

type DailyIncome = {
  id: string
  date: string
  shift: string
  patientName: string | null
  paymentMethod: string
  qrisFee: number
  konsultasi: number
  tindakanMedis: number
  obat: number
  gigi: number
  antigen: number
  memo: string | null
}

type PrintReceiptProps = {
  income: DailyIncome
  onClose: () => void
}

export default function PrintReceipt({ income, onClose }: PrintReceiptProps) {
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

  const total =
    income.konsultasi +
    income.tindakanMedis +
    income.obat +
    income.gigi +
    income.antigen -
    income.qrisFee

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Print area */}
        <div className="p-8 print:p-0" id="receipt">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">FIRIDA</h1>
            <p className="text-sm text-gray-600">Firdaus Digital Finance - Klinik</p>
            <p className="text-xs text-gray-500 mt-1">Sistem Manajemen Keuangan</p>
            <div className="border-b-2 border-gray-300 my-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">KUITANSI PEMBAYARAN</h2>
          </div>

          {/* Transaction Details */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">Tanggal</td>
                  <td className="py-1">: {formatDate(income.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Shift</td>
                  <td className="py-1">: {income.shift}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Nama Pasien</td>
                  <td className="py-1">: {income.patientName || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Metode Pembayaran</td>
                  <td className="py-1">: {income.paymentMethod}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Items */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-gray-700">Item</th>
                  <th className="text-right py-2 text-gray-700">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {income.konsultasi > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Konsultasi</td>
                    <td className="text-right py-2">{formatCurrency(income.konsultasi)}</td>
                  </tr>
                )}
                {income.tindakanMedis > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Tindakan Medis</td>
                    <td className="text-right py-2">{formatCurrency(income.tindakanMedis)}</td>
                  </tr>
                )}
                {income.obat > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Obat</td>
                    <td className="text-right py-2">{formatCurrency(income.obat)}</td>
                  </tr>
                )}
                {income.gigi > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Gigi</td>
                    <td className="text-right py-2">{formatCurrency(income.gigi)}</td>
                  </tr>
                )}
                {income.antigen > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Antigen</td>
                    <td className="text-right py-2">{formatCurrency(income.antigen)}</td>
                  </tr>
                )}
                {income.qrisFee > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-red-600">Biaya QRIS</td>
                    <td className="text-right py-2 text-red-600">-{formatCurrency(income.qrisFee)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="py-3 font-bold text-gray-800">TOTAL</td>
                  <td className="text-right py-3 font-bold text-gray-800">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Memo */}
          {income.memo && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Catatan:</span> {income.memo}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Terima kasih atas kepercayaan Anda
            </p>
            <p className="text-xs text-center text-gray-400 mt-1">
              ID Transaksi: {income.id}
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
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
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
