// src/app/books/[slug]/components/BookToc.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TocChapter } from '@/lib/books'
import { cn } from '@/lib/utils'

interface BookTocProps {
  chapters: TocChapter[]
  headings?: { id: string; text: string; level: number }[]
}

export function BookToc({ chapters, headings }: BookTocProps) {
  const [activeId, setActiveId] = useState<string>('ch1')
  const [expanded, setExpanded] = useState(true)

  // 收集所有锚点 id
  const allIds = chapters.flatMap((ch) => [ch.id, ...ch.items.map((it) => it.id)])

  useEffect(() => {
    if (allIds.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    for (const id of allIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [allIds])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }, [])

  // 无结构化数据时，回退到 headings 平铺模式
  if (chapters.length === 0 && headings?.length) {
    return (
      <nav className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain pr-4" aria-label="内容目录">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-ink-400 hover:text-ink-700 mb-3 transition-colors">
          目录 <span className="text-ink-300 font-normal normal-case">({headings.length})</span>
        </button>
        {expanded && (
          <ul className="space-y-1 border-l border-paper-200 ml-1">
            {headings.map((h) => (
              <li key={h.id}>
                <button onClick={() => scrollTo(h.id)} className={cn(
                  'block w-full text-left text-xs py-2 pl-4 pr-2 transition-colors border-l-2 -ml-px',
                  h.level === 3 ? 'pl-7' : '',
                  activeId === h.id ? 'border-ink-500 text-ink-800 font-medium' : 'border-transparent text-ink-400 hover:text-ink-600'
                )}>{h.text}</button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    )
  }

  if (chapters.length === 0) return null

  return (
    <nav
      className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain pr-3"
      aria-label="本书章节目录"
    >
      {/* 折叠标题 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 w-full text-left text-[11px] font-semibold uppercase tracking-widest text-ink-400 hover:text-ink-700 mb-3 transition-colors"
      >
        本书目录
        <span className="text-ink-300 font-normal normal-case ml-1">({chapters.length} 章)</span>
        <svg
          className={cn('w-3 h-3 ml-auto transition-transform', expanded ? 'rotate-90' : '')}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-l border-paper-200 ml-0.5">
          {chapters.map((ch, chi) => (
            <div key={ch.id}>
              {/* 章节间细分割线 */}
              {chi > 0 && <div className="mx-3 border-t border-paper-200/80 my-1.5" />}

              {/* 一级：章节标题 */}
              <button
                onClick={() => scrollTo(ch.id)}
                className={cn(
                  'block w-full text-left text-[12px] py-1.5 pl-3 pr-1 transition-colors border-l-2 -ml-px font-medium',
                  activeId === ch.id || ch.items.some((it) => it.id === activeId)
                    ? 'border-ink-500 text-ink-900 bg-paper-100/50'
                    : 'border-transparent text-ink-600 hover:text-ink-800 hover:border-paper-300'
                )}
              >
                {ch.label}
              </button>

              {/* 二级：小节（缩进分组） */}
              {ch.items.length > 0 && (
                <div>
                  {ch.items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => scrollTo(it.id)}
                      className={cn(
                        'block w-full text-left text-[11px] py-1.5 pl-6 pr-1 transition-colors border-l-2 -ml-px',
                        activeId === it.id
                          ? 'border-ink-400 text-ink-800 font-medium'
                          : 'border-transparent text-ink-400 hover:text-ink-600'
                      )}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
