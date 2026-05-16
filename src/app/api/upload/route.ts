// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, generateFilename } from '@/lib/upload'
import logger, { generateRequestId } from '@/lib/logger'

// 文件类型和大小限制
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

// 错误类型
const UploadErrors = {
  NO_FILE: { code: 'NO_FILE', message: '请选择要上传的图片' },
  INVALID_TYPE: { code: 'INVALID_TYPE', message: '不支持的文件格式，仅支持 JPEG、PNG、GIF、WebP' },
  FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', message: '文件大小不能超过 10MB' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: '请先登录后再上传图片' },
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
  const requestId = generateRequestId()

  logger.info(requestId, 'REQUEST_RECEIVED', '开始处理图片上传请求', {
    method: request.method,
    url: request.url,
  })

  // 1. 权限检查
  logger.info(requestId, 'AUTH_CHECK', '开始验证用户权限')
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    logger.warn(requestId, 'AUTH_CHECK', '用户未登录，拒绝访问')
    return createErrorResponse(UploadErrors.UNAUTHORIZED, 401)
  }

  logger.debug(requestId, 'AUTH_CHECK', '用户已登录', {
    email: session.user.email,
    userId: (session.user as Record<string, unknown>).id,
  })

  const { isEmailAllowed } = await import('@/lib/permissions')
  const emailAllowed = isEmailAllowed(session.user.email)

  logger.debug(requestId, 'AUTH_CHECK', '邮箱权限检查结果', {
    email: session.user.email,
    allowed: emailAllowed,
  })

  if (!emailAllowed) {
    logger.warn(requestId, 'AUTH_CHECK', '用户邮箱不在白名单，拒绝访问')
    return createErrorResponse(UploadErrors.FORBIDDEN, 403)
  }

  // 2. 解析表单数据
  logger.info(requestId, 'PARSE_FORMDATA', '开始解析表单数据')
  let file: File | null = null

  try {
    const formData = await request.formData()
    file = formData.get('file') as File | null

    logger.debug(requestId, 'PARSE_FORMDATA', '表单数据解析完成', {
      hasFile: !!file,
      fieldNames: Array.from(formData.keys()),
    })
  } catch (err) {
    logger.error(requestId, 'PARSE_FORMDATA', '解析表单数据失败', {
      error: err instanceof Error ? err.message : String(err),
    })
    return createErrorResponse(UploadErrors.UPLOAD_FAILED, 500)
  }

  if (!file) {
    logger.warn(requestId, 'VALIDATION', '未提供文件')
    return createErrorResponse(UploadErrors.NO_FILE, 400)
  }

  // 记录文件信息
  logger.info(requestId, 'VALIDATION', '开始验证文件', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
  })

  // 3. 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    logger.warn(requestId, 'VALIDATION', '文件类型不合法', {
      receivedType: file.type,
      allowedTypes: ALLOWED_TYPES,
    })
    return createErrorResponse(UploadErrors.INVALID_TYPE, 400)
  }

  // 4. 验证文件大小
  if (file.size > MAX_SIZE) {
    logger.warn(requestId, 'VALIDATION', '文件大小超限', {
      fileSize: file.size,
      maxSize: MAX_SIZE,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
    })
    return createErrorResponse(UploadErrors.FILE_TOO_LARGE, 400)
  }

  logger.info(requestId, 'VALIDATION', '文件验证通过')

  // 5. 读取文件内容
  logger.info(requestId, 'READ_FILE', '开始读取文件内容')
  let buffer: Buffer

  try {
    const bytes = await file.arrayBuffer()
    buffer = Buffer.from(bytes)
    logger.debug(requestId, 'READ_FILE', '文件读取完成', {
      bufferLength: buffer.length,
      expectedLength: file.size,
    })
  } catch (err) {
    logger.error(requestId, 'READ_FILE', '读取文件内容失败', {
      error: err instanceof Error ? err.message : String(err),
    })
    return createErrorResponse(UploadErrors.UPLOAD_FAILED, 500)
  }

  // 6. 生成文件名
  const filename = generateFilename(file.name)
  logger.debug(requestId, 'GENERATE_FILENAME', '生成文件名', {
    originalName: file.name,
    generatedName: filename,
  })

  // 7. 上传文件
  logger.info(requestId, 'UPLOAD_START', '开始上传文件到存储服务', {
    filename,
    contentType: file.type,
    environment: process.env.NODE_ENV,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  })

  try {
    const result = await uploadFile(buffer, filename, file.type)
    logger.info(requestId, 'UPLOAD_SUCCESS', '文件上传成功', {
      url: result.url,
      filename: result.filename,
      size: result.size,
    })

    // 8. 返回成功结果
    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
      requestId,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : undefined

    logger.error(requestId, 'UPLOAD_FAILED', '文件上传失败', {
      error: errorMessage,
      stack: errorStack,
      filename,
      contentType: file.type,
      bufferLength: buffer.length,
    })

    return createErrorResponse(UploadErrors.UPLOAD_FAILED, 500)
  }
}
