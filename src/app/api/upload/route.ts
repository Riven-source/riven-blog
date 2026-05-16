// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, generateFilename } from '@/lib/upload'

// Vercel Serverless 兼容性配置
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

// 图片文件魔数（用于验证文件内容）
const IMAGE_SIGNATURES: Record<string, { bytes: number[]; offset?: number }> = {
  'image/jpeg': { bytes: [0xFF, 0xD8, 0xFF] },
  'image/png': { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  'image/gif': { bytes: [0x47, 0x49, 0x46] }, // GIF87a or GIF89a
  'image/webp': { bytes: [0x52, 0x49, 0x46, 0x46], offset: 8 }, // RIFF....WEBP
}

/**
 * 通过魔数验证文件内容
 */
function verifyImageContent(buffer: Buffer, mimeType: string): boolean {
  const sig = IMAGE_SIGNATURES[mimeType]
  if (!sig) return false
  
  const offset = sig.offset || 0
  const header = buffer.slice(offset, offset + sig.bytes.length)
  
  return sig.bytes.every((byte, i) => header[i] === byte)
}

/**
 * 清理文件名，移除危险字符
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

  // 设置超时保护（Vercel Serverless 最大 60s）
  const timeoutMs = 55000
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs)
  })

  const uploadPromise = handleUpload(request, requestId, startTime)

  try {
    return await Promise.race([uploadPromise, timeoutPromise])
  } catch (err) {
    const duration = Date.now() - startTime
    const errMsg = err instanceof Error ? err.message : String(err)

    if (errMsg === 'REQUEST_TIMEOUT') {
      console.error(`[${requestId}] [TIMEOUT] ${duration}ms - 请求超时`)
      return NextResponse.json(
        { error: '上传超时，请尝试更小的图片或检查网络连接', code: 'TIMEOUT' },
        { status: 408 }
      )
    }

    console.error(`[${requestId}] [ERROR] ${duration}ms: ${errMsg}`)
    return NextResponse.json(
      { error: '上传失败，请稍后重试', code: 'UPLOAD_FAILED' },
      { status: 500 }
    )
  }
}

async function handleUpload(request: NextRequest, requestId: string, startTime: number) {
  // 1. Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    console.log(`[${requestId}] [AUTH] 未登录，401`)
    return NextResponse.json({ error: '请先登录', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { isEmailAllowed } = await import('@/lib/permissions')
  if (!isEmailAllowed(session.user.email)) {
    console.log(`[${requestId}] [AUTH] 无权限: ${session.user.email}，403`)
    return NextResponse.json({ error: '无权限', code: 'FORBIDDEN' }, { status: 403 })
  }
  console.log(`[${requestId}] [AUTH] OK: ${session.user.email}`)

  // 2. Parse form data
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    console.log(`[${requestId}] [PARSE] 无文件`)
    return NextResponse.json({ error: '请选择图片', code: 'NO_FILE' }, { status: 400 })
  }
  console.log(`[${requestId}] [PARSE] file=${file.name} type=${file.type} size=${file.size}`)

  // 3. Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.log(`[${requestId}] [VALID] 类型不合法: ${file.type}`)
    return NextResponse.json(
      { error: `不支持 ${file.type} 格式，仅支持 JPEG、PNG、GIF、WebP`, code: 'INVALID_TYPE' },
      { status: 400 }
    )
  }

  // 4. Validate size
  if (file.size > MAX_SIZE) {
    console.log(`[${requestId}] [VALID] 过大: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
    return NextResponse.json(
      { error: `文件不能超过 10MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB）`, code: 'TOO_LARGE' },
      { status: 400 }
    )
  }

  // 5. Read file into buffer
  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch (err) {
    console.error(`[${requestId}] [READ] 文件读取失败:`, err)
    return NextResponse.json(
      { error: '文件读取失败，请重试', code: 'READ_ERROR' },
      { status: 500 }
    )
  }

  // 6. Verify content by magic bytes
  if (!verifyImageContent(buffer, file.type)) {
    console.log(`[${requestId}] [VALID] 文件内容与类型不符`)
    return NextResponse.json(
      { error: '文件内容与声明类型不符，可能文件已损坏', code: 'INVALID_CONTENT' },
      { status: 400 }
    )
  }

  // 7. Generate and sanitize filename
  const originalName = sanitizeFilename(file.name)
  const filename = generateFilename(originalName)
  console.log(`[${requestId}] [UPLOAD] 开始上传: ${filename} (${buffer.length} bytes)`)

  // 8. Upload to storage
  try {
    const result = await uploadFile(buffer, filename, file.type)
    const duration = Date.now() - startTime
    console.log(`[${requestId}] [SUCCESS] ${duration}ms url=${result.url}`)

    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
      requestId,
      duration,
    })
  } catch (err) {
    const duration = Date.now() - startTime
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`[${requestId}] [UPLOAD_ERROR] ${duration}ms: ${errMsg}`)

    // 特定错误处理
    if (errMsg.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        { error: '服务器存储未配置，请联系管理员', code: 'STORAGE_NOT_CONFIGURED' },
        { status: 500 }
      )
    }

    if (errMsg.includes('fetch failed') || errMsg.includes('ENOTFOUND')) {
      return NextResponse.json(
        { error: '存储服务暂时不可用，请稍后重试', code: 'STORAGE_UNAVAILABLE' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: '上传失败，请稍后重试', code: 'UPLOAD_FAILED' },
      { status: 500 }
    )
  }
}
