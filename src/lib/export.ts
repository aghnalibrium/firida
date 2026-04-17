import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type FinancialData = {
  accounts: Array<{
    code: string
    name: string
    category: string
    balance: number
  }>
  incomeStatement: {
    totalIncome: number
    totalExpense: number
    netIncome: number
    incomeDetails: Array<{ account: string; amount: number }>
    expenseDetails: Array<{ account: string; amount: number }>
  }
  cashFlow: {
    totalIn: number
    totalOut: number
    netCashFlow: number
  }
  period: {
    startDate: string
    endDate: string
  }
}

export function exportToExcel(data: FinancialData) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Trial Balance
  const trialBalanceData = [
    ['NERACA SALDO'],
    ['Periode:', `${data.period.startDate} s/d ${data.period.endDate}`],
    [],
    ['Kode', 'Nama Akun', 'Kategori', 'Saldo'],
    ...data.accounts.map((acc) => [
      acc.code,
      acc.name,
      acc.category,
      acc.balance,
    ]),
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(trialBalanceData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Neraca Saldo')

  // Sheet 2: Income Statement
  const incomeStatementData = [
    ['LAPORAN LABA RUGI'],
    ['Periode:', `${data.period.startDate} s/d ${data.period.endDate}`],
    [],
    ['PENDAPATAN'],
    ...data.incomeStatement.incomeDetails.map((item) => [
      item.account,
      item.amount,
    ]),
    ['Total Pendapatan', data.incomeStatement.totalIncome],
    [],
    ['PENGELUARAN'],
    ...data.incomeStatement.expenseDetails.map((item) => [
      item.account,
      item.amount,
    ]),
    ['Total Pengeluaran', data.incomeStatement.totalExpense],
    [],
    ['LABA/RUGI BERSIH', data.incomeStatement.netIncome],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(incomeStatementData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Laba Rugi')

  // Sheet 3: Cash Flow
  const cashFlowData = [
    ['LAPORAN ARUS KAS'],
    ['Periode:', `${data.period.startDate} s/d ${data.period.endDate}`],
    [],
    ['Kas Masuk', data.cashFlow.totalIn],
    ['Kas Keluar', data.cashFlow.totalOut],
    ['Arus Kas Bersih', data.cashFlow.netCashFlow],
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(cashFlowData)
  XLSX.utils.book_append_sheet(wb, ws3, 'Arus Kas')

  // Generate filename
  const filename = `Laporan_Keuangan_${data.period.startDate}_${data.period.endDate}.xlsx`

  // Download
  XLSX.writeFile(wb, filename)
}

export function exportToPDF(data: FinancialData) {
  const doc = new jsPDF()

  // Page 1: Trial Balance
  doc.setFontSize(16)
  doc.text('NERACA SALDO', 14, 15)
  doc.setFontSize(10)
  doc.text(`Periode: ${data.period.startDate} s/d ${data.period.endDate}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [['Kode', 'Nama Akun', 'Kategori', 'Saldo']],
    body: data.accounts.map((acc) => [
      acc.code,
      acc.name,
      acc.category,
      new Intl.NumberFormat('id-ID').format(acc.balance),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  })

  // Page 2: Income Statement
  doc.addPage()
  doc.setFontSize(16)
  doc.text('LAPORAN LABA RUGI', 14, 15)
  doc.setFontSize(10)
  doc.text(`Periode: ${data.period.startDate} s/d ${data.period.endDate}`, 14, 22)

  let currentY = 28

  // Pendapatan
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('PENDAPATAN', 14, currentY)
  currentY += 7

  autoTable(doc, {
    startY: currentY,
    body: data.incomeStatement.incomeDetails.map((item) => [
      item.account,
      new Intl.NumberFormat('id-ID').format(item.amount),
    ]),
    theme: 'plain',
    columnStyles: { 1: { halign: 'right' } },
  })

  currentY = (doc as any).lastAutoTable.finalY + 2
  doc.setFont(undefined, 'bold')
  doc.text(
    'Total Pendapatan',
    14,
    currentY
  )
  doc.text(
    new Intl.NumberFormat('id-ID').format(data.incomeStatement.totalIncome),
    doc.internal.pageSize.width - 14,
    currentY,
    { align: 'right' }
  )

  currentY += 10

  // Pengeluaran
  doc.setFont(undefined, 'bold')
  doc.text('PENGELUARAN', 14, currentY)
  currentY += 7

  autoTable(doc, {
    startY: currentY,
    body: data.incomeStatement.expenseDetails.map((item) => [
      item.account,
      new Intl.NumberFormat('id-ID').format(item.amount),
    ]),
    theme: 'plain',
    columnStyles: { 1: { halign: 'right' } },
  })

  currentY = (doc as any).lastAutoTable.finalY + 2
  doc.setFont(undefined, 'bold')
  doc.text('Total Pengeluaran', 14, currentY)
  doc.text(
    new Intl.NumberFormat('id-ID').format(data.incomeStatement.totalExpense),
    doc.internal.pageSize.width - 14,
    currentY,
    { align: 'right' }
  )

  currentY += 10

  // Net Income
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('LABA/RUGI BERSIH', 14, currentY)
  doc.text(
    new Intl.NumberFormat('id-ID').format(data.incomeStatement.netIncome),
    doc.internal.pageSize.width - 14,
    currentY,
    { align: 'right' }
  )

  // Page 3: Cash Flow
  doc.addPage()
  doc.setFontSize(16)
  doc.text('LAPORAN ARUS KAS', 14, 15)
  doc.setFontSize(10)
  doc.text(`Periode: ${data.period.startDate} s/d ${data.period.endDate}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    body: [
      [
        'Kas Masuk',
        new Intl.NumberFormat('id-ID').format(data.cashFlow.totalIn),
      ],
      [
        'Kas Keluar',
        new Intl.NumberFormat('id-ID').format(data.cashFlow.totalOut),
      ],
      [
        'Arus Kas Bersih',
        new Intl.NumberFormat('id-ID').format(data.cashFlow.netCashFlow),
      ],
    ],
    theme: 'grid',
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  })

  // Generate filename
  const filename = `Laporan_Keuangan_${data.period.startDate}_${data.period.endDate}.pdf`

  // Download
  doc.save(filename)
}
