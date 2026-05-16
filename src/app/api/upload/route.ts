// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, generateFilename } from '@/lib/upload'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

  try {
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

    // 3. Validate type & size
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log(`[${requestId}] [VALID] 类型不合法: ${file.type}`)
      return NextResponse.json(
        { error: `不支持 ${file.type} 格式`, code: 'INVALID_TYPE' },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      console.log(`[${requestId}] [VALID] 过大: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      return NextResponse.json(
        { error: `文件不能超过 10MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB）`, code: 'TOO_LARGE' },
        { status: 400 }
      )
    }

    // 4. Upload
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = generateFilename(file.name)
    console.log(`[${requestId}] [UPLOAD] 开始上传: ${filename}`)

    const result = await uploadFile(buffer, filename, file.type)

    const duration = Date.now() - startTime
    console.log(`[${requestId}] [SUCCESS] ${duration}ms url=${result.url}`)

    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
      requestId,
    })
  } catch (err) {
    const duration = Date.now() - startTime
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`[${requestId}] [ERROR] ${duration}ms: ${errMsg}`, err)

    // 返回具体错误信息帮助排查
    return NextResponse.json(
      {
        error: errMsg.includes('BLOB_READ_WRITE_TOKEN')
          ? '服务器存储未配置，请联系管理员设置 BLOB_READ_WRITE_TOKEN'
          : '上传失败，请稍后重试',
        code: 'UPLOAD_FAILED',
        detail: process.env.NODE_ENV === 'development' ? errMsg : undefined,
      },
      { status: 500 }
    )
  }
}
