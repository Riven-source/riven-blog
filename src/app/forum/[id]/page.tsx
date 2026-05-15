// src/app/forum/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ForumCommentSection } from './components/ForumCommentSection'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.forumPost.findUnique({
    where: { id: params.id },
    select: { title: true, content: true },
  })
  if (!post) return {}
  return {
    title: post.title,
    description: post.content.substring(0, 160),
  }
}

export default async function ForumPostPage({ params }: Props) {
  const post = await prisma.forumPost.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
    },
  })

  if (!post) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 返回 */}
      <Link href="/forum" className="inline-flex items-center gap-2 text-ink-400 hover:text-ink-700 text-sm mb-8 transition-colors">
        <span>←</span>
        返回论坛
      </Link>

      {/* 帖子内容 */}
      <article className="animate-fade-up">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink-950 mb-6">{post.title}</h1>
        
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-paper-300">
          {post.author.image ? (
            <Image src={post.author.image} alt="" width={40} height={40} className="rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-ink-200 flex items-center justify-center text-ink-500">
              {post.author.name?.[0] || '?'}
            </div>
          )}
          <div>
            <p className="font-medium text-ink-800">{post.author.name}</p>
            <p className="text-xs text-ink-400">
              {new Date(post.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>

        <div className="prose prose-ink max-w-none mb-12">
          <p className="whitespace-pre-wrap text-ink-700 leading-relaxed">{post.content}</p>
        </div>
      </article>

      {/* 评论区 */}
      <ForumCommentSection postId={post.id} />
    </div>
  )
}
