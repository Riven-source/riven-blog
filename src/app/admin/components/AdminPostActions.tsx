// src/app/admin/components/AdminPostActions.tsx
'use client'
import Link from 'next/link'
import { deletePost, togglePublish } from '@/app/actions/post'
import { useTransition } from 'react'

interface Props {
  postId: string
  slug: string
  published: boolean
}

export function AdminPostActions({ postId, slug, published }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return
    startTransition(async () => {
      await deletePost(postId)
    })
  }

  const handleToggle = () => {
    startTransition(async () => {
      await togglePublish(postId, !published)
    })
  }

  // 草稿预览 → 编辑页面（可查看完整内容）
  // 已发布预览 → 公开文章页面（外部分享用）
  const previewHref = published ? `/posts/${slug}` : `/admin/edit/${postId}`
  const previewTarget = published ? '_blank' : undefined

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={previewHref}
        target={previewTarget}
        className="text-xs text-ink-400 hover:text-ink-700 px-3 py-1.5 border border-paper-300 rounded-sm hover:border-ink-300 transition-colors"
      >
        {published ? '预览' : '查看'}
      </Link>
      <Link
        href={`/admin/edit/${postId}`}
        className="text-xs text-ink-600 hover:text-ink-900 px-3 py-1.5 border border-paper-300 rounded-sm hover:border-ink-400 transition-colors"
      >
        编辑
      </Link>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`text-xs px-3 py-1.5 border rounded-sm transition-colors ${
          published
            ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
            : 'text-green-600 border-green-200 hover:bg-green-50'
        }`}
      >
        {published ? '下线' : '发布'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-sm hover:bg-red-50 transition-colors"
      >
        删除
      </button>
    </div>
  )
}
