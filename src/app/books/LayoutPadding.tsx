// src/app/books/LayoutPadding.tsx
'use client'

import { useSidebar } from '@/lib/sidebar-context'

export function LayoutPadding({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div
      className="flex-1 min-w-0 transition-all duration-300"
      style={{ marginLeft: collapsed ? '56px' : '220px' }}
    >
      {children}
    </div>
  )
}
