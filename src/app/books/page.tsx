// src/app/books/page.tsx
import { books } from '@/lib/books'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '书籍 · 经典教材笔记',
  description: '经济学、心理学、哲学与社会、逻辑学等经典教材自学笔记，涵盖曼昆经济学、资本论、博弈论、乌合之众、理想国等',
}

const categories = [
  { name: '经济学', icon: '📊', color: 'border-l-ink-600' },
  { name: '心理学', icon: '🧠', color: 'border-l-purple-500' },
  { name: '哲学与社会', icon: '🏛️', color: 'border-l-amber-600' },
  { name: '逻辑学', icon: '🔢', color: 'border-l-emerald-600' },
]

export default function BooksPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-14 animate-fade-up">
        <h1 className="font-serif text-4xl text-ink-950 mb-4">📚 书籍</h1>
        <p className="text-ink-500 leading-relaxed max-w-2xl">
          系统整理的经济学与心理学经典教材自学笔记。
          每本书涵盖完整的知识体系、核心公式推导与案例解析，适合体系化学习与快速查阅。
        </p>
      </div>

      {/* Books by category */}
      {categories.map((cat) => {
        const catBooks = books.filter((b) => b.category === cat.name)
        if (catBooks.length === 0) return null
        return (
          <div key={cat.name} className="mb-12 animate-fade-up">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-800 mb-5">
              <span>{cat.icon}</span>
              {cat.name}
              <span className="text-xs text-ink-400 font-normal ml-2">({catBooks.length} 本)</span>
            </h2>
            <div className="grid gap-4">
              {catBooks.map((book) => (
                <Link
                  key={book.slug}
                  href={`/books/${book.slug}`}
                  className={`group block bg-paper-50 border border-paper-200 border-l-4 rounded-sm p-5 hover:shadow-md hover:border-paper-400 transition-all ${cat.color}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg text-ink-900 group-hover:text-ink-700 transition-colors mb-1">
                        曼昆《{book.title}》
                      </h3>
                      <p className="text-sm text-ink-400">
                        {book.author}
                      </p>
                      <p className="text-sm text-ink-500 mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    </div>
                    <span className="text-ink-300 group-hover:text-ink-500 group-hover:translate-x-1 transition-all mt-1 shrink-0">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}

      {/* Empty state fallback */}
      {books.length === 0 && (
        <div className="text-center py-24 text-ink-400">
          <p className="font-serif text-2xl mb-3">📭</p>
          <p className="font-serif text-lg italic">暂无书籍</p>
        </div>
      )}
    </div>
  )
}
