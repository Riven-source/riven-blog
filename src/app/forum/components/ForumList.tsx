// src/app/forum/components/ForumList.tsx
'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface ForumPost {
  id: string
  title: string
  content: string
  createdAt: string
  author: { id: string; name: string | null; image: string | null }
  _count: { comments: number }
}

interface ForumListProps {
  initialPosts: ForumPost[]
}

export function ForumList({ initialPosts }: ForumListProps) {
  const { data: session } = useSession()
  const [posts, setPosts] = useState(initialPosts)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        const newPost = await res.json()
        setPosts([newPost, ...posts])
        setTitle('')
        setContent('')
        setShowForm(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* 发帖按钮 */}
      {session && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full py-3 border-2 border-dashed border-paper-300 text-ink-400 hover:text-ink-600 hover:border-ink-400 rounded-sm transition-colors"
          >
            {showForm ? '取消发帖' : '+ 发布新话题'}
          </button>
        </div>
      )}

      {/* 发帖表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-paper-50 border border-paper-300 rounded-sm animate-fade-in">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="话题标题"
            className="w-full px-4 py-3 mb-4 border border-paper-300 rounded-sm bg-paper-50 text-ink-700 font-medium focus:outline-none focus:border-ink-400 transition-colors"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法..."
            rows={5}
            className="w-full px-4 py-3 mb-4 border border-paper-300 rounded-sm bg-paper-50 text-ink-700 resize-none focus:outline-none focus:border-ink-400 transition-colors"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-ink-500 hover:text-ink-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布话题'}
            </button>
          </div>
        </form>
      )}

      {/* 未登录提示 */}
      {!session && (
        <div className="mb-6 p-4 bg-paper-50 border border-paper-200 rounded-sm text-center text-ink-500">
          <a href="/login" className="text-ink-700 hover:text-ink-900 underline">登录</a> 后可以发表话题
        </div>
      )}

      {/* 帖子列表 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/forum/${post.id}`}
            className="block p-6 bg-paper-50 border border-paper-300 rounded-sm hover:border-ink-400 transition-colors animate-fade-up"
          >
            <h3 className="font-serif text-lg text-ink-950 mb-2">{post.title}</h3>
            <p className="text-ink-500 text-sm line-clamp-2 mb-4">{post.content}</p>
            <div className="flex items-center gap-4 text-xs text-ink-400">
              <div className="flex items-center gap-2">
                {post.author.image ? (
                  <Image src={post.author.image} alt="" width={20} height={20} className="rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-ink-200 flex items-center justify-center text-ink-500">
                    {post.author.name?.[0] || '?'}
                  </div>
                )}
                <span>{post.author.name || '匿名'}</span>
              </div>
              <span>{formatDate(new Date(post.createdAt))}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {post._count.comments}
              </span>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-16 text-ink-400">
            <p className="font-serif text-lg italic">暂无话题</p>
            <p className="text-sm mt-2">成为第一个发起讨论的人吧</p>
          </div>
        )}
      </div>
    </div>
  )
}
