// src/components/BookSidebar.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/sidebar-context'
import type { BookMeta } from '@/lib/books'

// 分类 → 极简线性图标 SVG
const categoryIcons: Record<string, JSX.Element> = {
  经济学: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 11h6" />
    </svg>
  ),
  心理学: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M12 3a5 5 0 0 1 5 5c0 4-5 9-5 9s-5-5-5-9a5 5 0 0 1 5-5z" />
      <path d="M10 10v4M14 10v4" />
    </svg>
  ),
  '哲学与社会': (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="14" rx="1" /><path d="M3 10h18" /><path d="M8 3v18M16 3v18" />
    </svg>
  ),
  逻辑学: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),
}

export function BookSidebar({ books }: { books: BookMeta[] }) {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleOverlayClick = useCallback(() => setMobileOpen(false), [])
  useEffect(() => setMobileOpen(false), [pathname])

  // 按类别分组
  const groups = useMemo(() => {
    const map: Record<string, BookMeta[]> = {}
    for (const book of books) {
      if (!map[book.category]) map[book.category] = []
      map[book.category].push(book)
    }
    return map
  }, [books])

  const categories = Object.keys(groups)

  // ========== 展开态内容 ==========
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/books" className="inline-flex items-center gap-2 font-serif text-base text-ink-900 hover:text-ink-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 2v4M16 2v4M8 20v2M16 20v2" />
          </svg>
          书籍
        </Link>
        <p className="text-[11px] text-ink-400 mt-1.5">经典教材自学笔记</p>
      </div>

      {/* 分类 + 书籍列表 */}
      <nav className="flex-1 overflow-y-auto px-5 pt-1 pb-4">
        {categories.map((category, ci) => (
          <div key={category}>
            {/* 分类间间距 */}
            {ci > 0 && <div className="h-[18px]" />}

            {/* 一级：分类标题 */}
            <div className="flex items-center gap-1.5 mt-4 mb-2">
              <span className="text-ink-500 shrink-0">{categoryIcons[category]}</span>
              <h3 className="text-[12px] font-semibold text-ink-700 tracking-wide">{category}</h3>
            </div>

            {/* 二级：书籍条目（统一缩进 12px） */}
            <div className="ml-3 space-y-1">
              {groups[category].map((book) => {
                const href = `/books/${book.slug}`
                const isActive = pathname === href
                return (
                  <Link
                    key={book.slug}
                    href={href}
                    className={cn(
                      'block rounded-sm transition-colors py-1.5 pl-3 border-l-2',
                      isActive
                        ? 'border-ink-500 bg-paper-200/50'
                        : 'border-transparent hover:bg-paper-100/60'
                    )}
                  >
                    <span
                      className={cn(
                        'block text-[12px] truncate leading-tight',
                        isActive ? 'text-ink-900 font-medium' : 'text-ink-600'
                      )}
                    >
                      {book.title}
                    </span>
                    <span className="block text-[10px] text-ink-400 truncate mt-0.5 leading-tight">
                      {book.author}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-paper-200">
        <p className="text-[10px] text-ink-300 leading-relaxed">
          内容仅供学习参考<br />版权归原作者所有
        </p>
      </div>
    </div>
  )

  // ========== 折叠态内容 ==========
  const collapsedContent = (
    <div className="flex flex-col items-center pt-5 gap-5">
      <button
        onClick={() => setCollapsed(false)}
        className="text-ink-400 hover:text-ink-700 p-1.5 transition-colors"
        title="展开侧边栏"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      {categories.map((category) => {
        const firstBook = groups[category][0]
        const isActive = groups[category].some((b) => pathname === `/books/${b.slug}`)
        return (
          <Link
            key={category}
            href={`/books/${firstBook.slug}`}
            title={category}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded transition-colors',
              isActive ? 'text-ink-800 bg-ink-100' : 'text-ink-400 hover:text-ink-700 hover:bg-paper-100'
            )}
          >
            <span className="w-4 h-4">{categoryIcons[category]}</span>
          </Link>
        )
      })}
      {/* 回到书籍首页 */}
      <Link
        href="/books"
        title="书籍首页"
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded transition-colors mt-2',
          pathname === '/books'
            ? 'text-ink-800 bg-ink-100'
            : 'text-ink-400 hover:text-ink-700 hover:bg-paper-100'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Link>
    </div>
  )

  return (
    <>
      {/* 移动端浮动按钮 */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 left-4 z-50 w-11 h-11 bg-ink-800 text-paper-50 rounded-full shadow-lg flex items-center justify-center"
        aria-label="打开书籍列表"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={handleOverlayClick} />}

      {/* ===== 桌面端侧边栏 ===== */}
      <aside
        className={cn(
          'hidden lg:block fixed left-0 top-16 bottom-0 z-30 border-r border-paper-200 bg-paper-50/95 backdrop-blur-sm transition-all duration-300',
          collapsed ? 'w-[56px]' : 'w-[220px]'
        )}
      >
        {collapsed ? collapsedContent : sidebarContent}

        {/* 折叠/展开手柄 */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-paper-100 border border-paper-300 flex items-center justify-center text-ink-400 hover:text-ink-700 transition-colors text-xs"
            title="收起侧边栏"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </aside>

      {/* ===== 移动端侧边栏 ===== */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-16 bottom-0 z-50 w-[256px] border-r border-paper-200 bg-paper-50 shadow-xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
