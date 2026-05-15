// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
      <div>
        <p className="font-serif text-8xl text-ink-200 mb-4">404</p>
        <h1 className="font-serif text-3xl text-ink-800 mb-3">页面不存在</h1>
        <p className="text-ink-500 mb-8">你访问的页面已被删除或不存在</p>
        <Link href="/" className="btn-primary">← 返回首页</Link>
      </div>
    </div>
  )
}
