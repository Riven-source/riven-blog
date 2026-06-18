// src/app/books/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getBookBySlug, getBookContent, books, MACRO_TOC } from '@/lib/books'
import { BookContent } from './components/BookContent'
import { BookToc } from './components/BookToc'
import { ChartRunner } from './components/ChartRunner'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return books.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = getBookBySlug(params.slug)
  if (!book) return {}
  const prefix = book.author.includes('Mankiw') ? '曼昆《' : ''
  const suffix = prefix ? '》' : ''
  return {
    title: `${prefix}${book.title}${suffix}`,
    description: book.description,
  }
}

export default function BookPage({ params }: Props) {
  const book = getBookBySlug(params.slug)
  if (!book) notFound()

  const content = getBookContent(params.slug)
  if (!content) notFound()

  return (
    <div className="flex gap-6 px-6 lg:px-8 py-12 transition-all duration-300">
      {/* 左侧 sticky 目录 — 侧边栏收起时容器变宽，百分比自动扩宽 */}
      <aside
        className="hidden lg:block shrink-0 transition-all duration-300"
        style={{ width: 'clamp(148px, 18%, 240px)', minWidth: 148, maxWidth: 240 }}
      >
        <BookToc
          chapters={params.slug === 'mankiw-macroeconomics' ? MACRO_TOC : []}
          headings={content.headings}
        />
      </aside>

      {/* 右侧内容区 — 宽度优先级最高，不压缩 */}
      <div className="min-w-0 flex-1 max-w-3xl">
        <BookContent
          title={content.title}
          html={content.html}
          author={book.author}
        />
      </div>

      {/* Canvas 图表脚本执行器 */}
      <ChartRunner script={content.script} />
    </div>
  )
}
