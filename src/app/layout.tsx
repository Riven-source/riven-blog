// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import SessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: {
    default: 'Riven Blog',
    template: '%s | Riven Blog',
  },
  description: '记录思考、分享知识、探索技术的个人空间',
  keywords: ['博客', '技术', '随笔', 'Blog'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Riven Blog',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
