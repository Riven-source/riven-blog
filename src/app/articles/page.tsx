// src/app/articles/page.tsx
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/PostCard'
import { TagFilter } from '@/components/TagFilter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '文章',
  description: '探索所有文章、随笔与思考',
}

export const revalidate = 60

interface ArticlesPageProps {
  searchParams: { tag?: string; page?: string }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const currentTag = searchParams.tag
  const page = parseInt(searchParams.page || '1')
  const limit = 9

  const where = {
    published: true,
    ...(currentTag ? { tags: { some: { name: currentTag } } } : {}),
  }

  const [posts, total, allTags] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, image: true } },
        tags: true,
      },
    }),
    prisma.post.count({ where }),
    prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { posts: { _count: 'desc' } } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12 animate-fade-up">
        <h1 className="font-serif text-4xl sm:text-5xl text-ink-950 mb-4">文章</h1>
        <p className="text-ink-500">探索思考、记录与分享</p>
      </div>

      {/* Tags */}
      <TagFilter tags={allTags.map((t) => ({ name: t.name, count: t._count.posts }))} currentTag={currentTag} />

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-24 text-ink-400">
          <p className="font-serif text-xl italic">暂无文章</p>
          <p className="text-sm mt-2">请稍后回来查看</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post, i) => (
            <div key={post.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/articles?${currentTag ? `tag=${currentTag}&` : ''}page=${p}`}
              className={`w-9 h-9 flex items-center justify-center text-sm rounded-sm transition-colors ${
                p === page
                  ? 'bg-ink-800 text-paper-50'
                  : 'border border-paper-300 text-ink-600 hover:border-ink-400'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
