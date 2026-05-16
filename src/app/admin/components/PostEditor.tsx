// src/app/admin/components/PostEditor.tsx
'use client'
import { useState, useCallback } from 'react'
import { createPost, updatePost } from '@/app/actions/post'
import { generateSlug } from '@/lib/utils'
import { MarkdownViewer } from '@/components/MarkdownViewer'

// 生成请求 ID 用于日志追踪
function generateRequestId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

// 前端日志输出
function logUpload(
  level: 'info' | 'warn' | 'error' | 'debug',
  requestId: string,
  stage: string,
  message: string,
  data?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString()
  const logData = { timestamp, requestId, stage, message, ...data }
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${requestId}] [${stage}] ${message}`

  if (level === 'error') {
    console.error(logMessage, data)
  } else if (level === 'warn') {
    console.warn(logMessage, data)
  } else {
    console.log(logMessage, data || '')
  }
}

// 封装的文件上传函数（带详细日志）
async function uploadFileWithLogging(
  file: File,
  requestId: string
): Promise<{ url?: string; error?: string }> {
  const uploadUrl = '/api/upload'
  const maxRetries = 3
  const timeout = 30000

  logUpload('info', requestId, 'UPLOAD_START', '开始上传文件', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
    uploadUrl,
  })

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logUpload('info', requestId, 'UPLOAD_ATTEMPT', `第 ${attempt} 次上传尝试`, {
      attempt,
      maxRetries,
    })

    try {
      const fd = new FormData()
      fd.append('file', file)

      logUpload('debug', requestId, 'REQUEST_SEND', '发送上传请求', {
        attempt,
        timeout,
        hasFile: fd.has('file'),
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        logUpload('warn', requestId, 'REQUEST_TIMEOUT', '请求超时，自动中止', { attempt })
        controller.abort()
      }, timeout)

      const startTime = Date.now()
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      })
      const duration = Date.now() - startTime

      clearTimeout(timeoutId)

      logUpload('info', requestId, 'RESPONSE_RECEIVED', '收到服务器响应', {
        attempt,
        status: res.status,
        statusText: res.statusText,
        duration: `${duration}ms`,
      })

      if (!res.ok) {
        logUpload('warn', requestId, 'RESPONSE_ERROR', '服务器返回错误状态码', {
          attempt,
          status: res.status,
          statusText: res.statusText,
        })
        continue // 重试
      }

      const data = await res.json()
      logUpload('debug', requestId, 'RESPONSE_PARSE', '响应数据解析完成', {
        attempt,
        hasUrl: !!data.url,
        hasError: !!data.error,
        code: data.code,
        requestId: data.requestId,
      })

      if (data.url) {
        logUpload('info', requestId, 'UPLOAD_SUCCESS', '文件上传成功', {
          attempt,
          url: data.url,
          filename: data.filename,
          size: data.size,
          duration: `${duration}ms`,
        })
        return { url: data.url }
      }

      logUpload('warn', requestId, 'UPLOAD_FAILED', '服务器返回失败响应', {
        attempt,
        error: data.error,
        code: data.code,
      })

      if (attempt === maxRetries) {
        return { error: data.error || '图片上传失败' }
      }
    } catch (err) {
      const errorName = err instanceof Error ? err.name : 'Unknown'
      const errorMessage = err instanceof Error ? err.message : String(err)

      logUpload('error', requestId, 'UPLOAD_ERROR', '上传过程发生异常', {
        attempt,
        errorName,
        errorMessage,
        isAbort: errorName === 'AbortError',
      })

      if (errorName === 'AbortError') {
        logUpload('warn', requestId, 'UPLOAD_ABORT', '请求被中止（超时）', { attempt })
        return { error: '上传超时，请检查网络后重试' }
      }

      if (attempt < maxRetries) {
        logUpload('info', requestId, 'UPLOAD_RETRY', `等待 1 秒后重试...`, {
          remainingRetries: maxRetries - attempt,
        })
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
  }

  logUpload('error', requestId, 'UPLOAD_EXHAUSTED', '所有重试次数已用完，上传失败', {
    maxRetries,
  })
  return { error: '图片上传失败，请稍后重试' }
}

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

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const requestId = generateRequestId()

    // 前端预校验
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      logUpload('warn', requestId, 'VALIDATION', '文件类型不合法', {
        fileType: file.type,
        allowedTypes,
      })
      setError('不支持的文件格式，仅支持 JPEG、PNG、GIF、WebP')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      logUpload('warn', requestId, 'VALIDATION', '文件大小超限', {
        fileSize: file.size,
        maxSize: 10 * 1024 * 1024,
      })
      setError('文件大小不能超过 10MB')
      return
    }

    logUpload('info', requestId, 'UI_STATE', '开始上传，设置上传状态', {})
    setUploading(true)
    setError('')

    const result = await uploadFileWithLogging(file, requestId)

    logUpload('info', requestId, 'UI_UPDATE', '上传完成，更新UI状态', {
      success: !!result.url,
      hasError: !!result.error,
    })

    if (result.url) {
      update('coverImage', result.url)
      logUpload('info', requestId, 'UPLOAD_COMPLETE', '封面图上传成功并更新', {
        url: result.url,
      })
    } else {
      setError(result.error || '图片上传失败')
      logUpload('error', requestId, 'UPLOAD_COMPLETE', '封面上传失败', {
        error: result.error,
      })
    }
    setUploading(false)
  }, [])

  const handleInsertImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const requestId = generateRequestId()

    // 前端预校验
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      logUpload('warn', requestId, 'VALIDATION', '文件类型不合法', {
        fileType: file.type,
        allowedTypes,
      })
      setError('不支持的文件格式，仅支持 JPEG、PNG、GIF、WebP')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      logUpload('warn', requestId, 'VALIDATION', '文件大小超限', {
        fileSize: file.size,
        maxSize: 10 * 1024 * 1024,
      })
      setError('文件大小不能超过 10MB')
      return
    }

    logUpload('info', requestId, 'UI_STATE', '开始上传，设置上传状态', {})
    setUploading(true)
    setError('')

    const result = await uploadFileWithLogging(file, requestId)

    logUpload('info', requestId, 'UI_UPDATE', '上传完成，更新UI状态', {
      success: !!result.url,
      hasError: !!result.error,
    })

    if (result.url) {
      const markdown = `\n![${file.name}](${result.url})\n`
      update('content', form.content + markdown)
      logUpload('info', requestId, 'UPLOAD_COMPLETE', '图片插入Markdown成功', {
        url: result.url,
        markdownPreview: markdown.substring(0, 50),
      })
    } else {
      setError(result.error || '图片上传失败')
      logUpload('error', requestId, 'UPLOAD_COMPLETE', '图片插入失败', {
        error: result.error,
      })
    }
    setUploading(false)
  }, [form.content])

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

    // 设置对应的加载状态
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
        // 保存成功后跳转到管理页面
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-sm text-green-700 text-sm">
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
              onChange={handleImageUpload}
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
                onChange={handleInsertImage}
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
