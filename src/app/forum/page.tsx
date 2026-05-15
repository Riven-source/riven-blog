// src/app/forum/page.tsx
import { prisma } from '@/lib/prisma'
import { ForumList } from './components/ForumList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '论坛',
  description: '自由讨论、交流思想的社区',
}

export const revalidate = 60

export default async function ForumPage() {
  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  })

  // 转换日期为字符串以匹配客户端组件类型
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-4xl text-ink-950 mb-2">论坛</h1>
            <p className="text-ink-500">自由讨论、交流思想</p>
          </div>
        </div>
      </div>

      <ForumList initialPosts={serializedPosts} />
    </div>
  )
}
