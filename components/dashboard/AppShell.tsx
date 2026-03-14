'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

interface AppShellProps {
  role: 'exporter' | 'admin'
  companyName?: string
  email?: string
  children: React.ReactNode
}

export default function AppShell({ role, companyName, email, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, drawer on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar role={role} companyName={companyName} email={email} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#02284d] border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-[#E4DC1F] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#E4DC1F] rounded flex items-center justify-center">
              <span className="text-[#02284d] font-bold text-[10px]">A</span>
            </div>
            <span className="font-bold text-white text-sm tracking-tight">ALTITUDE</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
