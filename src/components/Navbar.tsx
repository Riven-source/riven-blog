// src/components/Navbar.tsx
'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭账户菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-paper-100/90 backdrop-blur-sm border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-xl text-ink-950 hover:text-ink-700 transition-colors">
            Riven Blog
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-8">
            <Link href="/" className="nav-link">首页</Link>
            <Link href="/articles" className="nav-link">文章</Link>
            <Link href="/forum" className="nav-link">论坛</Link>
            <Link href="/about" className="nav-link">关于</Link>

            {session ? (
              <div className="flex items-center gap-4">
                {/* 账户下拉菜单 */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 text-ink-500 hover:text-ink-800 transition-colors"
                  >
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-ink-200 flex items-center justify-center text-ink-500 text-sm">
                        {session.user?.name?.[0] || '?'}
                      </div>
                    )}
                    <span className="text-sm">账户</span>
                    <svg className={`w-4 h-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 下拉菜单 */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-paper-50 border border-paper-300 rounded-sm shadow-lg py-1 animate-fade-in">
                      <div className="px-4 py-2 border-b border-paper-200">
                        <p className="font-medium text-ink-800 text-sm">{session.user?.name}</p>
                        <p className="text-xs text-ink-400 truncate">{session.user?.email}</p>
                      </div>
                      !!(session.user as any)?.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-ink-600 hover:bg-paper-100 transition-colors"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          管理后台
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-paper-100 transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/login" className="nav-link">登录</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden text-ink-500 hover:text-ink-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-paper-300 space-y-1">
            <Link href="/" className="block nav-link py-2" onClick={() => setMobileMenuOpen(false)}>首页</Link>
            <Link href="/articles" className="block nav-link py-2" onClick={() => setMobileMenuOpen(false)}>文章</Link>
            <Link href="/forum" className="block nav-link py-2" onClick={() => setMobileMenuOpen(false)}>论坛</Link>
            <Link href="/about" className="block nav-link py-2" onClick={() => setMobileMenuOpen(false)}>关于</Link>
            {session ? (
              <>
                {(session.user as Record<string, unknown>).isAdmin && (
                  <Link href="/admin" className="block nav-link py-2" onClick={() => setMobileMenuOpen(false)}>管理后台</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="block nav-link py-2 w-full text-left text-red-600">退出登录</button>
              </>
            ) : (
              <Link href="/login" className="block nav-link py-2" onClick={() => setMobileMenuOpen(false)}>登录</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
