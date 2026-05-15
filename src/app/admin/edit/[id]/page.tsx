// src/app/admin/edit/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { PostEditor } from '../../components/PostEditor'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: '编辑文章' }

export default async function EditPostPage({ params }: Props) {
  const isNew = params.id === 'new'

  let post = null
  if (!isNew) {
    post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { tags: true },
    })
    if (!post) notFound()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl text-ink-950 mb-8">
        {isNew ? '新建文章' : '编辑文章'}
      </h1>
      <PostEditor
        postId={isNew ? undefined : params.id}
        initialData={
          post
            ? {
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt || '',
                coverImage: post.coverImage || '',
                published: post.published,
                tags: post.tags.map((t) => t.name).join(', '),
              }
            : undefined
        }
      />
    </div>
  )
}
