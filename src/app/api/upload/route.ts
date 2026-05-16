// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, generateFilename } from '@/lib/upload'

// 文件类型和大小限制
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

// 错误类型
const UploadErrors = {
  NO_FILE: { code: 'NO_FILE', message: '请选择要上传的图片' },
  INVALID_TYPE: { code: 'INVALID_TYPE', message: '不支持的文件格式，仅支持 JPEG、PNG、GIF、WebP' },
  FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', message: '文件大小不能超过 10MB' },
  UNUTHORIZED: { code: 'UNAUTHORIZED', message: '请先登录后再上传图片' },
  FORBIDDEN: { code: 'FORBIDDEN', message: '您没有上传权限' },
  UPLOAD_FAILED: { code: 'UPLOAD_FAILED', message: '图片上传失败，请稍后重试' },
} as const

function createErrorResponse(error: (typeof UploadErrors)[keyof typeof UploadErrors], status: number) {
  return NextResponse.json(
    { error: error.message, code: error.code },
    { status }
  )
}

export async function POST(request: NextRequest) {
  // 1. 权限检查
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return createErrorResponse(UploadErrors.UNUTHORIZED, 401)
  }

  const { isEmailAllowed } = await import('@/lib/permissions')
  if (!isEmailAllowed(session.user.email)) {
    return createErrorResponse(UploadErrors.FORBIDDEN, 403)
  }

  try {
    // 2. 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return createErrorResponse(UploadErrors.NO_FILE, 400)
    }

    // 3. 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return createErrorResponse(UploadErrors.INVALID_TYPE, 400)
    }

    // 4. 验证文件大小
    if (file.size > MAX_SIZE) {
      return createErrorResponse(UploadErrors.FILE_TOO_LARGE, 400)
    }

    // 5. 读取并上传文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = generateFilename(file.name)

    const result = await uploadFile(buffer, filename, file.type)

    // 6. 返回成功结果
    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
    })
  } catch (err) {
    console.error('[Upload Error]', err)
    return createErrorResponse(UploadErrors.UPLOAD_FAILED, 500)
  }
}
