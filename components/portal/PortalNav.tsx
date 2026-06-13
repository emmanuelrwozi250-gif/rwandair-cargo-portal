'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, PackageSearch, FileText, Receipt, Tags,
  Bell, Users, BarChart3, LogOut, Menu, X,
} from 'lucide-react'

const LINKS = [
  { href: '/portal/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/portal/bookings',      label: 'Bookings',      icon: PackageSearch },
  { href: '/portal/awb',           label: 'eAWB',          icon: FileText },
  { href: '/portal/invoices',      label: 'Invoices',      icon: Receipt },
  { href: '/portal/rates',         label: 'Rates',         icon: Tags },
  { href: '/portal/notifications', label: 'Notifications', icon: Bell },
  { href: '/portal/team',          label: 'Team',          icon: Users },
  { href: '/portal/reports',       label: 'Reports',       icon: BarChart3 },
]

export default function PortalNav({ company, email }: { company: string; email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/portal/login')
    router.refresh()
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Portal">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={active
                  ? { background: 'rgba(255,255,255,0.14)', color: 'var(--wb-yellow)' }
                  : { color: 'rgba(255,255,255,0.8)' }}>
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" /> {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-30"
           style={{ background: 'var(--brand-blue)' }}>
        <span className="font-bold text-sm" style={{ color: 'var(--wb-yellow)' }}>RwandAir Cargo · Portal</span>
        <button onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open} className="p-2 text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (desktop) / drawer (mobile) */}
      <aside className={`${open ? 'block' : 'hidden'} lg:block lg:fixed lg:inset-y-0 lg:w-64 z-30`}
             style={{ background: 'var(--brand-blue-dark)' }}>
        <div className="flex flex-col h-full p-4">
          <Link href="/portal/dashboard" className="hidden lg:block px-2 py-3 mb-2">
            <span className="font-extrabold text-lg" style={{ color: 'white' }}>RwandAir <span style={{ color: 'var(--wb-yellow)' }}>Cargo</span></span>
            <span className="block text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Agent Portal</span>
          </Link>
          {nav}
          <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="px-3 text-xs font-semibold truncate" style={{ color: 'white' }}>{company || 'Your agency'}</p>
            <p className="px-3 text-xs truncate mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{email}</p>
            <button onClick={signOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{ color: 'rgba(255,255,255,0.8)' }}>
              <LogOut className="w-4 h-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
