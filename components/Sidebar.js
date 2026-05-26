'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',  label: '대시보드',    icon: '📊' },
  { href: '/as',         label: 'AS 목록',     icon: '🔧' },
  { href: '/as-receipt', label: 'AS 수령관리', icon: '📦' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-48 min-h-screen bg-white shadow-sm flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-base font-bold text-gray-800">AS 관리</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          // pathname === href  : 정확히 일치 (/as, /as-receipt 각각)
          // startsWith(href+'/') : 하위 경로 (/as/[id]) — /as-receipt 는 해당 없음
          const active =
            pathname === href ||
            pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}