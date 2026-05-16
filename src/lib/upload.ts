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
  const blob = await put(filename, buffer, {
    contentType,
    access: 'public',
  })
  return {
    url: blob.url,
    filename,
    size: buffer.length,
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
  await mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)
  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  }
}

/**
 * 生成唯一文件名
 */
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.png'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `upload-${timestamp}-${random}${ext}`
}

/**
 * 根据环境自动选择存储方式上传文件
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  // 生产环境使用 Vercel Blob
  if (process.env.NODE_ENV === 'production' && process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadToBlob(buffer, filename, contentType)
  }
  // 开发环境使用本地文件系统
  return uploadToLocal(buffer, filename)
}
