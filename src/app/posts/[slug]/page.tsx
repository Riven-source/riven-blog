// src/app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MarkdownViewer } from '@/components/MarkdownViewer'
import { ShareButton } from '@/components/ShareButton'
import { Comments } from '@/components/Comments'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PostPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug, published: true } })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true } })
  return posts.map((p) => ({ slug: p.slug }))
}

export const revalidate = 60

export default async function PostPage({ params }: PostPageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      tags: true,
      author: { select: { name: true, bio: true } },
    },
  })

  if (!post) notFound()

  const postUrl = `/posts/${post.slug}`

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/articles" className="inline-flex items-center gap-2 text-ink-400 hover:text-ink-700 text-sm transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          返回文章
        </Link>
        <div className="flex items-center gap-3">
          {post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/articles?tag=${tag.name}`} className="tag-badge">{tag.name}</Link>
              ))}
            </div>
          )}
          <ShareButton url={postUrl} />
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        <MarkdownViewer content={post.content} />
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-paper-300">
        <div className="text-sm text-ink-500">
          <p>作者：{post.author.name}</p>
          {post.author.bio && <p className="mt-1">{post.author.bio}</p>}
        </div>
      </footer>

      {/* Comments */}
      <Comments postId={post.id} />
    </article>
  )
}
