// src/app/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '首页',
}

export default function HomePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-4xl">
        {/* 主标语 */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-ink-950 leading-tight tracking-tight mb-8 animate-fade-up">
          <span className="block">静以修身</span>
          <span className="block">虚以观道</span>
          <span className="block">日拱一卒</span>
          <span className="block">润物自成</span>
        </h1>
        
        {/* 装饰线 */}
        <div className="flex items-center justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="w-16 h-px bg-ink-300"></div>
          <span className="text-ink-400 text-sm tracking-widest uppercase">Riven Blog</span>
          <div className="w-16 h-px bg-ink-300"></div>
        </div>

        {/* 副标语 */}
        <p className="text-ink-500 text-lg sm:text-xl mb-16 animate-fade-up" style={{ animationDelay: '400ms' }}>
          记录思考 · 分享知识 · 探索技术
        </p>

        {/* CTA 按钮 */}
        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '600ms' }}>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-ink-800 text-paper-50 px-8 py-4 rounded-sm text-base font-medium hover:bg-ink-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            阅读文章
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 border-2 border-ink-800 text-ink-800 px-8 py-4 rounded-sm text-base font-medium hover:bg-ink-800 hover:text-paper-50 transition-colors"
          >
            关于我
          </Link>
        </div>

        {/* 装饰元素 */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-ink-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-paper-200 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  )
}
