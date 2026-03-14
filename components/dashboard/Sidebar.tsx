'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  Users,
  BarChart3,
  Truck,
} from 'lucide-react'

interface SidebarProps {
  role: 'exporter' | 'admin'
  companyName?: string
  email?: string
}

const exporterNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/shipments', label: 'My Shipments', icon: Package },
  { href: '/dashboard/shipments/new', label: 'New Shipment', icon: PlusCircle },
]

const adminNav = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/exporters', label: 'Exporters', icon: Users },
  { href: '/admin/shipments', label: 'All Shipments', icon: Package },
  { href: '/admin/pickups', label: 'Cargo Pickups', icon: Truck },
  { href: '/admin/transporters', label: 'Transporters', icon: Truck },
]

export default function Sidebar({ role, companyName, email }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const nav = role === 'admin' ? adminNav : exporterNav

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full w-64 bg-[#02284d] text-white flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-[#E4DC1F] rounded-lg flex items-center justify-center">
            <span className="text-[#02284d] font-bold text-xs">A</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">ALTITUDE</span>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest leading-none">
              {role === 'admin' ? 'Admin Panel' : 'Export Platform'}
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">
          {role === 'admin' ? 'Administrator' : 'Exporter'}
        </p>
        <p className="text-sm font-semibold text-white truncate">{companyName || email}</p>
        {companyName && <p className="text-xs text-blue-300 truncate">{email}</p>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive(item.href, item.exact)
                ? 'bg-[#E4DC1F] text-[#02284d]'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all duration-150 w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
