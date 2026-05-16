// src/components/PostCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, estimateReadingTime } from '@/lib/utils'

interface Post {
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  createdAt: Date
  author: { name: string | null; image: string | null }
  tags: { id: string; name: string }[]
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`} className="card group block">
      {post.coverImage && (
        <div className="overflow-hidden aspect-video bg-paper-200">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={600}
            height={340}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="tag-badge text-xs">{tag.name}</span>
            ))}
          </div>
        )}
        <h2 className="font-serif text-lg text-ink-900 leading-snug mb-3 group-hover:text-ink-600 transition-colors line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-ink-500 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <time>{formatDate(post.createdAt)}</time>
          <span>·</span>
          <span>{estimateReadingTime(post.excerpt || post.title)} 分钟阅读</span>
        </div>
      </div>
    </Link>
  )
}
