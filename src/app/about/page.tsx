// src/app/about/page.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: '关于我',
  description: '了解更多关于博主的故事',
}

export default async function AboutPage() {
  const postCount = await prisma.post.count({ where: { published: true } })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="animate-fade-up">
        <p className="font-serif italic text-ink-400 text-lg mb-3">About me</p>
        <h1 className="font-serif text-5xl text-ink-950 mb-12">关于我</h1>
      </div>

      <div className="prose prose-lg max-w-none animate-fade-in">
        <p className="font-serif text-xl text-ink-600 italic leading-relaxed">
          你好，欢迎来到我的个人博客。这里是我记录思考、分享知识的地方。
        </p>

        <p>
          这个博客使用 <strong>Next.js 14</strong>、<strong>Prisma</strong>、
          <strong>Neon PostgreSQL</strong> 和 <strong>Vercel</strong> 构建，
          完全免费部署，适合个人展示和内容创作。
        </p>

        <h2>我在写什么</h2>
        <ul>
          <li>技术探索与实践笔记</li>
          <li>读书思考与随笔</li>
          <li>生活观察与感悟</li>
        </ul>

        <h2>联系方式</h2>
        <p>
          如果你想联系我，可以通过以下方式：
        </p>
        <ul>
          <li>Email: <a href="mailto:your@email.com">muriyuedyf@gmail.com</a></li>
          <li>GitHub: <a href="https://github.com/yourname" target="_blank" rel="noopener noreferrer">@Riven-source</a></li>
        </ul>
      </div>

      <div className="mt-16 pt-8 border-t border-paper-300">
        <div className="grid grid-cols-2 gap-6 max-w-sm">
          <div className="text-center p-6 bg-paper-50 border border-paper-300 rounded-sm">
            <p className="font-serif text-4xl text-ink-950 mb-1">{postCount}</p>
            <p className="text-sm text-ink-500">篇文章</p>
          </div>
          <div className="text-center p-6 bg-paper-50 border border-paper-300 rounded-sm">
            <p className="font-serif text-4xl text-ink-950 mb-1">∞</p>
            <p className="text-sm text-ink-500">持续更新</p>
          </div>
        </div>
      </div>
    </div>
  )
}
