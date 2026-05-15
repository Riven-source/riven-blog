// src/app/forum/[id]/components/ForumCommentSection.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string | null; image: string | null }
  parentId: string | null
  replies: Comment[]
  _count: { likes: number }
  likes: { userId: string }[]
}

interface ForumCommentSectionProps {
  postId: string
}

export function ForumCommentSection({ postId }: ForumCommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    const res = await fetch(`/api/forum/${postId}/comments`)
    const data = await res.json()
    setComments(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/forum/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })
      if (res.ok) {
        setNewComment('')
        fetchComments()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !replyTo) return

    setLoading(true)
    try {
      const res = await fetch(`/api/forum/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId: replyTo.id }),
      })
      if (res.ok) {
        setReplyContent('')
        setReplyTo(null)
        fetchComments()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session) {
      alert('请先登录')
      return
    }
    await fetch(`/api/forum/comments/${commentId}/like`, { method: 'POST' })
    fetchComments()
  }

  const isLiked = (comment: Comment) => {
    return comment.likes.some((l) => l.userId === session?.user?.id)
  }

  return (
    <div className="mt-12 pt-8 border-t border-paper-300">
      <h3 className="font-serif text-xl text-ink-950 mb-6">
        回复 ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})
      </h3>

      {/* 发表评论 */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的回复..."
            className="w-full p-4 border border-paper-300 rounded-sm bg-paper-50 text-ink-700 resize-none focus:outline-none focus:border-ink-400"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button type="submit" disabled={loading || !newComment.trim()} className="btn-primary disabled:opacity-50">
              {loading ? '发送中...' : '发送回复'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-paper-50 border border-paper-200 rounded-sm text-center text-ink-500">
          <a href="/login" className="text-ink-700 hover:text-ink-900 underline">登录</a> 后参与讨论
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem
              comment={comment}
              isLiked={isLiked(comment)}
              onLike={() => handleLike(comment.id)}
              onReply={() => setReplyTo({ id: comment.id, name: comment.author.name || '匿名' })}
              isReplying={replyTo?.id === comment.id}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReply={handleReply}
              loading={loading}
              setReplyTo={setReplyTo}
            />
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-ink-400 py-8">暂无回复，来发表第一条回复吧</p>
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  isLiked: boolean
  onLike: () => void
  onReply: () => void
  isReplying: boolean
  replyContent: string
  setReplyContent: (v: string) => void
  handleReply: (e: React.FormEvent) => void
  loading: boolean
  setReplyTo: (v: { id: string; name: string } | null) => void
}

function CommentItem({
  comment,
  isLiked,
  onLike,
  onReply,
  isReplying,
  replyContent,
  setReplyContent,
  handleReply,
  loading,
  setReplyTo,
}: CommentItemProps) {
  return (
    <div className="bg-paper-50 border border-paper-200 rounded-sm p-4">
      <div className="flex gap-3">
        {comment.author.image ? (
          <Image src={comment.author.image} alt="" width={32} height={32} className="rounded-full shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center text-ink-500 text-sm shrink-0">
            {comment.author.name?.[0] || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-ink-800 text-sm">{comment.author.name || '匿名'}</span>
            <span className="text-xs text-ink-400">{formatDate(new Date(comment.createdAt))}</span>
          </div>
          <p className="text-ink-700 text-sm whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={onLike} className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-ink-400 hover:text-red-500'}`}>
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {comment._count.likes || ''}
            </button>
            <button onClick={onReply} className="text-xs text-ink-400 hover:text-ink-600 transition-colors">回复</button>
          </div>

          {isReplying && (
            <form onSubmit={handleReply} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`回复 @${comment.author.name}...`}
                className="w-full p-3 border border-paper-300 rounded-sm bg-paper-50 text-ink-700 resize-none focus:outline-none focus:border-ink-400 text-sm"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-ink-400 hover:text-ink-600 px-2 py-1">取消</button>
                <button type="submit" disabled={loading || !replyContent.trim()} className="text-xs bg-ink-800 text-paper-50 px-3 py-1 rounded-sm hover:bg-ink-700 disabled:opacity-50">发送</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3 border-l-2 border-paper-200 pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              {reply.author.image ? (
                <Image src={reply.author.image} alt="" width={24} height={24} className="rounded-full shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-ink-200 flex items-center justify-center text-ink-500 text-xs shrink-0">
                  {reply.author.name?.[0] || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-ink-800 text-xs">{reply.author.name || '匿名'}</span>
                  <span className="text-xs text-ink-400">{formatDate(new Date(reply.createdAt))}</span>
                </div>
                <p className="text-ink-700 text-sm whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
