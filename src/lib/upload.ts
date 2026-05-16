// src/lib/upload.ts
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export interface UploadResult {
  url: string
  filename: string
  size: number
}

export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.png'
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
}

/**
 * 上传到 Vercel Blob（生产环境 + 有 Token）
 */
async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const blob = await put(filename, buffer, { contentType, access: 'public' })
  return { url: blob.url, filename, size: buffer.length }
}

/**
 * 上传到本地 public/uploads/（开发环境）
 */
async function uploadToLocal(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  return { url: `/uploads/${filename}`, filename, size: buffer.length }
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const useBlob = process.env.NODE_ENV === 'production' && !!process.env.BLOB_READ_WRITE_TOKEN

  if (useBlob) {
    console.log(`[UPLOAD] Using Vercel Blob for ${filename}`)
    return uploadToBlob(buffer, filename, contentType)
  }

  if (process.env.NODE_ENV === 'production') {
    // 生产环境没有配置 BLOB_READ_WRITE_TOKEN
    throw new Error(
      'BLOB_READ_WRITE_TOKEN not configured. ' +
      'Please add it in Vercel Dashboard → Settings → Environment Variables.'
    )
  }

  console.log(`[UPLOAD] Using local filesystem for ${filename}`)
  return uploadToLocal(buffer, filename)
}
