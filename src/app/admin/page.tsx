// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { AdminPostActions } from './components/AdminPostActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '管理后台' }

type FilterType = 'all' | 'published' | 'draft'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const params = await searchParams
  const filter = (params.filter as FilterType) || 'all'

  // 构建查询条件
  const where = filter === 'published'
    ? { published: true }
    : filter === 'draft'
      ? { published: false }
      : {}

  const [posts, totalPosts, publishedCount] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { tags: true, author: { select: { name: true } } },
    }),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
  ])

  const draftCount = totalPosts - publishedCount

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl text-ink-950 mb-1">管理后台</h1>
          <p className="text-ink-500 text-sm">欢迎回来，{session?.user?.name}</p>
        </div>
        <Link href="/admin/edit/new" className="btn-primary">
          <span>+</span> 新建文章
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-paper-50 border border-paper-300 rounded-sm p-5 text-center">
          <p className="font-serif text-3xl text-ink-950 mb-1">{totalPosts}</p>
          <p className="text-xs text-ink-500 uppercase tracking-widest">全部文章</p>
        </div>
        <div className="bg-paper-50 border border-paper-300 rounded-sm p-5 text-center">
          <p className="font-serif text-3xl text-green-600 mb-1">{publishedCount}</p>
          <p className="text-xs text-ink-500 uppercase tracking-widest">已发布</p>
        </div>
        <div className="bg-paper-50 border border-paper-300 rounded-sm p-5 text-center">
          <p className="font-serif text-3xl text-ink-400 mb-1">{draftCount}</p>
          <p className="text-xs text-ink-500 uppercase tracking-widest">草稿</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: '全部' },
          { key: 'published', label: '已发布' },
          { key: 'draft', label: '草稿箱' },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/admin?filter=${tab.key}`}
            className={`px-4 py-2 text-sm rounded-sm transition-colors ${
              filter === tab.key
                ? 'bg-ink-800 text-paper-50'
                : 'bg-paper-100 text-ink-600 hover:bg-paper-200'
            }`}
          >
            {tab.label}
            {tab.key === 'draft' && draftCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-ink-300 text-paper-50 rounded">
                {draftCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Posts Table */}
      <div className="bg-paper-50 border border-paper-300 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-paper-300">
          <h2 className="font-medium text-ink-800">
            {filter === 'draft' ? '草稿箱' : filter === 'published' ? '已发布' : '所有文章'}
            <span className="ml-2 text-ink-400 font-normal">({posts.length})</span>
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-ink-400">
            {filter === 'draft' ? (
              <>
                <p className="font-serif text-lg italic">草稿箱是空的</p>
                <p className="text-sm mt-2">点击"保存草稿"将文章存入此处</p>
                <Link href="/admin/edit/new" className="inline-block mt-4 btn-secondary">
                  开始写作
                </Link>
              </>
            ) : (
              <>
                <p className="font-serif text-lg italic">还没有文章</p>
                <p className="text-sm mt-2">点击"新建文章"开始写作</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-paper-200">
            {posts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-paper-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${post.published ? 'bg-green-400' : 'bg-ink-300'}`}></span>
                    <h3 className="font-medium text-ink-800 truncate">{post.title || '无标题'}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-400">
                    <span>{formatDate(post.updatedAt)}</span>
                    <span>·</span>
                    <span>{post.published ? '已发布' : '草稿'}</span>
                    {post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{post.tags.map((t) => t.name).join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/edit/${post.id}`}
                    className="text-xs text-ink-500 hover:text-ink-700 px-2 py-1"
                  >
                    编辑
                  </Link>
                  <AdminPostActions postId={post.id} slug={post.slug} published={post.published} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
