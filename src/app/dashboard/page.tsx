'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DailyIncomeForm from '@/components/DailyIncomeForm'
import DailyIncomeList from '@/components/DailyIncomeList'
import OtherIncomeForm from '@/components/OtherIncomeForm'
import OtherIncomeList from '@/components/OtherIncomeList'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import InternalTransferForm from '@/components/InternalTransferForm'
import InternalTransferList from '@/components/InternalTransferList'
import Dashboard from '@/components/Dashboard'
import Logo from '@/components/Logo'
import AccountForm from '@/components/AccountForm'
import AccountList from '@/components/AccountList'
import JournalEntryManager from '@/components/JournalEntryManager'
import FinancialReports from '@/components/FinancialReports'
import UserForm from '@/components/UserForm'
import UserList from '@/components/UserList'
import AuditLogList from '@/components/AuditLogList'

type TabType = 'dashboard' | 'daily' | 'other' | 'expense' | 'transfer' | 'accounts' | 'journal' | 'reports' | 'users' | 'audit'

type User = {
  id: string
  username: string
  name: string
  role: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dailyRefreshTrigger, setDailyRefreshTrigger] = useState(0)
  const [otherRefreshTrigger, setOtherRefreshTrigger] = useState(0)
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState(0)
  const [transferRefreshTrigger, setTransferRefreshTrigger] = useState(0)
  const [accountsRefreshTrigger, setAccountsRefreshTrigger] = useState(0)
  const [usersRefreshTrigger, setUsersRefreshTrigger] = useState(0)
  const [auditRefreshTrigger, setAuditRefreshTrigger] = useState(0)

  // Check session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        if (!data.user) {
          router.push('/login')
          return
        }

        setUser(data.user)
      } catch (error) {
        console.error('Session check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleDailyFormSuccess = () => {
    setDailyRefreshTrigger((prev) => prev + 1)
  }

  const handleOtherFormSuccess = () => {
    setOtherRefreshTrigger((prev) => prev + 1)
  }

  const handleExpenseFormSuccess = () => {
    setExpenseRefreshTrigger((prev) => prev + 1)
  }

  const handleTransferFormSuccess = () => {
    setTransferRefreshTrigger((prev) => prev + 1)
  }

  const handleAccountsFormSuccess = () => {
    setAccountsRefreshTrigger((prev) => prev + 1)
  }

  const handleUsersFormSuccess = () => {
    setUsersRefreshTrigger((prev) => prev + 1)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Memuat...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo className="w-14 h-14" />
              <div>
                <h1 className="text-3xl font-bold">FIRIDA</h1>
                <p className="text-blue-100 mt-1 text-sm">Firdaus Digital Finance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-blue-100">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md transition-colors text-sm font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
          <p className="text-blue-100 mt-2 text-sm">Sistem Manajemen Keuangan Klinik</p>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:shadow-none lg:border-r border-gray-200`}>
          <div className="h-full overflow-y-auto pt-20 lg:pt-8 pb-4">
            <nav className="px-3 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'dashboard'
                    ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>📊</span>
                Dashboard
              </button>

              <button
                onClick={() => {
                  setActiveTab('daily')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'daily'
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>💰</span>
                Pendapatan Harian
              </button>

              <button
                onClick={() => {
                  setActiveTab('other')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'other'
                    ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>💵</span>
                Pendapatan Lain
              </button>

              <button
                onClick={() => {
                  setActiveTab('expense')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'expense'
                    ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>💸</span>
                Pengeluaran/Biaya
              </button>

              <button
                onClick={() => {
                  setActiveTab('transfer')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'transfer'
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>🔄</span>
                Transfer Internal
              </button>

              <button
                onClick={() => {
                  setActiveTab('accounts')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'accounts'
                    ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>📋</span>
                Bagan Akun
              </button>

              <button
                onClick={() => {
                  setActiveTab('journal')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'journal'
                    ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>📝</span>
                Jurnal Umum
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports')
                  setSidebarOpen(false)
                }}
                className={`${
                  activeTab === 'reports'
                    ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                    : 'text-gray-700 hover:bg-gray-50'
                } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
              >
                <span>📈</span>
                Laporan Keuangan
              </button>

              {user?.role === 'admin' && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Admin
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('users')
                      setSidebarOpen(false)
                    }}
                    className={`${
                      activeTab === 'users'
                        ? 'bg-slate-50 text-slate-700 border-l-4 border-slate-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
                  >
                    <span>👥</span>
                    Manajemen User
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('audit')
                      setSidebarOpen(false)
                    }}
                    className={`${
                      activeTab === 'audit'
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    } w-full text-left px-4 py-3 rounded-r-md font-medium text-sm transition-colors flex items-center gap-3`}
                  >
                    <span>📜</span>
                    Riwayat Aktivitas
                  </button>
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          <div className="space-y-8">
          {activeTab === 'dashboard' && <Dashboard />}

          {activeTab === 'daily' && (
            <>
              <DailyIncomeForm onSuccess={handleDailyFormSuccess} />
              <DailyIncomeList refreshTrigger={dailyRefreshTrigger} />
            </>
          )}

          {activeTab === 'other' && (
            <>
              <OtherIncomeForm onSuccess={handleOtherFormSuccess} />
              <OtherIncomeList refreshTrigger={otherRefreshTrigger} />
            </>
          )}

          {activeTab === 'expense' && (
            <>
              <ExpenseForm onSuccess={handleExpenseFormSuccess} />
              <ExpenseList refreshTrigger={expenseRefreshTrigger} />
            </>
          )}

          {activeTab === 'transfer' && (
            <>
              <InternalTransferForm onSuccess={handleTransferFormSuccess} />
              <InternalTransferList refreshTrigger={transferRefreshTrigger} />
            </>
          )}

          {activeTab === 'accounts' && (
            <>
              <AccountForm onSuccess={handleAccountsFormSuccess} />
              <AccountList refreshTrigger={accountsRefreshTrigger} />
            </>
          )}

          {activeTab === 'journal' && <JournalEntryManager />}

          {activeTab === 'reports' && <FinancialReports />}

          {activeTab === 'users' && user?.role === 'admin' && (
            <>
              <UserForm onSuccess={handleUsersFormSuccess} />
              <UserList refreshTrigger={usersRefreshTrigger} />
            </>
          )}

          {activeTab === 'audit' && user?.role === 'admin' && (
            <AuditLogList refreshTrigger={auditRefreshTrigger} />
          )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>&copy; 2026 FIRIDA - Clinic Financial Management System</p>
        </div>
      </footer>
    </div>
  )
}
