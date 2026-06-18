// src/app/books/layout.tsx
import { books } from '@/lib/books'
import { BookSidebar } from '@/components/BookSidebar'
import { SidebarProvider } from '@/lib/sidebar-context'
import { LayoutPadding } from './LayoutPadding'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '书籍',
  description: '经济学与心理学经典教材 · 自学笔记',
}

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <BookSidebar books={books} />
        <LayoutPadding>{children}</LayoutPadding>
      </div>
    </SidebarProvider>
  )
}
