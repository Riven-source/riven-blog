// src/lib/upload.ts
// 支持本地开发（临时文件系统）和 Vercel 生产环境（Blob 存储）

import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export interface UploadResult {
  url: string
  filename: string
  size: number
}

/**
 * 上传文件到 Vercel Blob（生产环境）
 */
async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  console.log(`[${new Date().toISOString()}] [UPLOAD] [BLOB] 开始上传到 Vercel Blob`, {
    filename,
    contentType,
    size: buffer.length,
  })

  try {
    const blob = await put(filename, buffer, {
      contentType,
      access: 'public',
    })

    console.log(`[${new Date().toISOString()}] [UPLOAD] [BLOB] 上传成功`, {
      filename,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    })

    return {
      url: blob.url,
      filename,
      size: buffer.length,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : undefined

    console.error(`[${new Date().toISOString()}] [UPLOAD] [BLOB] 上传失败`, {
      filename,
      contentType,
      error: errorMessage,
      stack: errorStack,
    })

    throw new Error(`Vercel Blob 上传失败: ${errorMessage}`)
  }
}

/**
 * 上传文件到本地文件系统（仅用于本地开发）
 */
async function uploadToLocal(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  console.log(`[${new Date().toISOString()}] [UPLOAD] [LOCAL] 开始写入本地文件`, {
    filename,
    uploadDir,
    size: buffer.length,
  })

  try {
    await mkdir(uploadDir, { recursive: true })
    console.log(`[${new Date().toISOString()}] [UPLOAD] [LOCAL] 目录已确保存在: ${uploadDir}`)
  } catch (mkdirErr) {
    const errorMessage = mkdirErr instanceof Error ? mkdirErr.message : String(mkdirErr)
    console.error(`[${new Date().toISOString()}] [UPLOAD] [LOCAL] 创建目录失败`, {
      uploadDir,
      error: errorMessage,
    })
    throw new Error(`创建上传目录失败: ${errorMessage}`)
  }

  const filePath = path.join(uploadDir, filename)

  try {
    await writeFile(filePath, buffer)
    console.log(`[${new Date().toISOString()}] [UPLOAD] [LOCAL] 文件写入成功`, {
      filePath,
      url: `/uploads/${filename}`,
      size: buffer.length,
    })

    return {
      url: `/uploads/${filename}`,
      filename,
      size: buffer.length,
    }
  } catch (writeErr) {
    const errorMessage = writeErr instanceof Error ? writeErr.message : String(writeErr)
    console.error(`[${new Date().toISOString()}] [UPLOAD] [LOCAL] 文件写入失败`, {
      filePath,
      error: errorMessage,
    })
    throw new Error(`写入本地文件失败: ${errorMessage}`)
  }
}

/**
 * 生成唯一文件名
 */
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.png'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const filename = `upload-${timestamp}-${random}${ext}`

  console.log(`[${new Date().toISOString()}] [UPLOAD] [FILENAME] 生成文件名`, {
    originalName,
    generatedFilename: filename,
    extension: ext,
  })

  return filename
}

/**
 * 根据环境自动选择存储方式上传文件
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const isProduction = process.env.NODE_ENV === 'production'
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN

  console.log(`[${new Date().toISOString()}] [UPLOAD] [STRATEGY] 选择上传策略`, {
    nodeEnv: process.env.NODE_ENV,
    isProduction,
    hasBlobToken,
    filename,
    contentType,
    bufferSize: buffer.length,
  })

  // 生产环境使用 Vercel Blob
  if (isProduction && hasBlobToken) {
    console.log(`[${new Date().toISOString()}] [UPLOAD] [STRATEGY] 策略: Vercel Blob (生产环境)`)
    return uploadToBlob(buffer, filename, contentType)
  }

  // 生产环境但无 Blob Token - 这是问题所在！
  if (isProduction && !hasBlobToken) {
    console.error(`[${new Date().toISOString()}] [UPLOAD] [STRATEGY] 错误: 生产环境未配置 BLOB_READ_WRITE_TOKEN`)
    console.error(`[${new Date().toISOString()}] [UPLOAD] [STRATEGY] 提示: 请在 Vercel 环境变量中配置 BLOB_READ_WRITE_TOKEN`)
    throw new Error('生产环境未配置 BLOB_READ_WRITE_TOKEN，无法上传文件')
  }

  // 开发环境使用本地文件系统
  console.log(`[${new Date().toISOString()}] [UPLOAD] [STRATEGY] 策略: 本地文件系统 (开发环境)`)
  return uploadToLocal(buffer, filename)
}
