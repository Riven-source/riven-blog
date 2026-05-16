// src/app/admin/components/PostEditor.tsx
'use client'
import { useState, useCallback } from 'react'
import { createPost, updatePost } from '@/app/actions/post'
import { generateSlug } from '@/lib/utils'
import { MarkdownViewer } from '@/components/MarkdownViewer'

interface PostEditorProps {
  postId?: string
  initialData?: {
    title: string
    slug: string
    content: string
    excerpt: string
    coverImage: string
    published: boolean
    tags: string
  }
}

export function PostEditor({ postId, initialData }: PostEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [form, setForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    coverImage: initialData?.coverImage || '',
    published: initialData?.published ?? false,
    tags: initialData?.tags || '',
  })
  const [uploading, setUploading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    update('title', title)
    if (!postId) update('slug', generateSlug(title))
  }

  // 统一的上传函数
  const doUpload = useCallback(async (
    file: File,
    mode: 'cover' | 'insert'
  ): Promise<void> => {
    console.log('[UPLOAD_START]', { fileName: file.name, fileType: file.type, fileSize: file.size, mode })

    // 前端预校验
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError(`不支持的文件格式 "${file.type}"，仅支持 JPEG、PNG、GIF、WebP`)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`文件过大 ${(file.size / 1024 / 1024).toFixed(1)}MB，不能超过 10MB`)
      return
    }

    setUploading(true)
    setError('')
    let retryCount = 0
    const maxRetries = 3

    while (retryCount <= maxRetries) {
      try {
        console.log(`[UPLOAD_ATTEMPT] 第 ${retryCount + 1} 次...`)
        const fd = new FormData()
        fd.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        console.log('[RESPONSE]', { status: res.status, statusText: res.statusText })

        if (!res.ok) {
          const body = await res.text()
          console.error('[RESPONSE_ERROR]', { status: res.status, body: body.substring(0, 500) })
          retryCount++
          continue
        }

        const data = await res.json() as Record<string, unknown>
        console.log('[RESPONSE_DATA]', data)

        if (data.url && typeof data.url === 'string') {
          if (mode === 'cover') {
            update('coverImage', data.url as string)
            setError('')
          } else {
            update('content', form.content + `\n![${file.name}](${data.url})\n`)
            setError('')
          }
          return // 成功退出
        }

        // 服务器返回了非 URL 响应
        const serverError = typeof data.error === 'string' ? data.error : '服务器返回异常'
        setError(serverError)
        retryCount++
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error('[UPLOAD_EXCEPTION]', { attempt: retryCount + 1, error: errMsg, name: err instanceof Error ? err.name : 'unknown' })

        if ((err as Error).name === 'AbortError') {
          setError('上传超时，请稍后重试')
          return
        }
        retryCount++
        if (retryCount <= maxRetries) {
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
    }

    // 所有重试都失败
    setError(`图片上传失败（已尝试 ${maxRetries} 次），请检查网络后重试`)
  }, [form.content])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await doUpload(file, 'cover')
    } catch (err) {
      console.error('[HANDLE_UPLOAD_ERROR]', err)
      setError('上传过程发生未知错误')
    } finally {
      setUploading(false)
    }
  }, [doUpload])

  const handleInsertImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await doUpload(file, 'insert')
    } catch (err) {
      console.error('[HANDLE_INSERT_ERROR]', err)
      setError('插入图片时发生未知错误')
    } finally {
      setUploading(false)
    }
  }, [doUpload])

  const handleSubmit = async (published: boolean) => {
    if (!form.title.trim()) {
      setError('请输入标题')
      return
    }
    if (!form.content.trim()) {
      setError('请输入内容')
      return
    }

    setError('')
    setSuccess('')

    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const input = { ...form, published, tags }

    if (published) {
      setIsPublishing(true)
    } else {
      setIsSavingDraft(true)
    }

    try {
      const result = postId
        ? await updatePost(postId, input)
        : await createPost(input)

      if (result.success) {
        setSuccess(published ? '文章已发布！' : '草稿已保存！')
        setTimeout(() => {
          window.location.href = '/admin'
        }, 1000)
      } else {
        setError(result.error || '保存失败')
      }
    } catch {
      setError('保存失败，请稍后重试')
    } finally {
      setIsSavingDraft(false)
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="p-4 bg-green-50 border border-green-200 rounded-sm text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="文章标题..."
          value={form.title}
          onChange={handleTitleChange}
          disabled={isSavingDraft || isPublishing}
          className="w-full font-serif text-3xl bg-transparent border-0 border-b-2 border-paper-300 focus:border-ink-500 focus:outline-none pb-3 text-ink-950 placeholder-ink-300 transition-colors disabled:opacity-60"
        />
      </div>

      {/* Slug */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-ink-500 uppercase tracking-widest w-16 shrink-0">URL</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => update('slug', e.target.value)}
          disabled={isSavingDraft || isPublishing}
          className="input-field text-xs font-mono disabled:opacity-60"
          placeholder="post-url-slug"
        />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-ink-500 uppercase tracking-widest w-16 shrink-0">标签</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => update('tags', e.target.value)}
          disabled={isSavingDraft || isPublishing}
          className="input-field disabled:opacity-60"
          placeholder="技术, 随笔, 生活（逗号分隔）"
        />
      </div>

      {/* Excerpt */}
      <div className="flex items-start gap-3">
        <label className="text-xs text-ink-500 uppercase tracking-widest w-16 shrink-0 pt-3">摘要</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => update('excerpt', e.target.value)}
          rows={2}
          disabled={isSavingDraft || isPublishing}
          className="input-field resize-none disabled:opacity-60"
          placeholder="文章摘要（可选，不填则截取正文前160字）"
        />
      </div>

      {/* Cover Image */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-ink-500 uppercase tracking-widest w-16 shrink-0">封面</label>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={form.coverImage}
            onChange={(e) => update('coverImage', e.target.value)}
            disabled={isSavingDraft || isPublishing || uploading}
            className="input-field disabled:opacity-60"
            placeholder="图片URL或上传"
          />
          <label className={`btn-secondary cursor-pointer shrink-0 ${uploading || isSavingDraft || isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? '上传中...' : '上传'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                void handleImageUpload(e)
                // 重置 input 以允许重复选择同一文件
                e.target.value = ''
              }}
              className="hidden"
              disabled={uploading || isSavingDraft || isPublishing}
            />
          </label>
        </div>
      </div>

      {/* Content Editor */}
      <div className="border border-paper-300 rounded-sm overflow-hidden">
        <div className="flex border-b border-paper-300 bg-paper-100">
          <button
            onClick={() => setActiveTab('edit')}
            disabled={isSavingDraft || isPublishing}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-paper-50 text-ink-800 border-b-2 border-ink-600' : 'text-ink-500 hover:text-ink-700'}`}
          >
            编辑
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            disabled={isSavingDraft || isPublishing}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-paper-50 text-ink-800 border-b-2 border-ink-600' : 'text-ink-500 hover:text-ink-700'}`}
          >
            预览
          </button>
          <div className="ml-auto flex items-center px-4">
            <label className={`text-xs text-ink-500 hover:text-ink-700 cursor-pointer flex items-center gap-1.5 ${uploading || isSavingDraft || isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>📎</span> 插入图片
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  void handleInsertImage(e)
                  e.target.value = ''
                }}
                className="hidden"
                disabled={uploading || isSavingDraft || isPublishing}
              />
            </label>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <textarea
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            rows={20}
            disabled={isSavingDraft || isPublishing}
            className="w-full p-6 bg-paper-50 font-mono text-sm text-ink-700 resize-y focus:outline-none placeholder-ink-300 disabled:opacity-60"
            placeholder="用 Markdown 写作...&#10;&#10;支持：**粗体** *斜体* # 标题 > 引用 `代码` ```代码块```&#10;&#10;Markdown 语法完全兼容"
          />
        ) : (
          <div className="p-6 bg-paper-50 min-h-[400px]">
            {form.content ? (
              <MarkdownViewer content={form.content} />
            ) : (
              <p className="text-ink-300 italic font-serif">开始写作后可在此预览...</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-paper-200">
        <a href="/admin" className="text-sm text-ink-500 hover:text-ink-700">← 返回列表</a>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSavingDraft || isPublishing}
            className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingDraft ? '保存中...' : '保存草稿'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSavingDraft || isPublishing}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPublishing ? '发布中...' : (form.published ? '更新发布' : '发布文章')}
          </button>
        </div>
      </div>
    </div>
  )
}
