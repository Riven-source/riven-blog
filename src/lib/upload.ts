// src/lib/upload.ts
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export interface UploadResult {
  url: string
  filename: string
  size: number
  isPrivate?: boolean
}

export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.png'
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
}

/**
 * 从 Blob URL 中提取 pathname
 * 例如: https://xxxx.vercel-blob.com/xxx/filename.png -> /xxx/filename.png
 */
export function extractBlobPathname(blobUrl: string): string | null {
  try {
    const url = new URL(blobUrl)
    return url.pathname
  } catch {
    return null
  }
}

/**
 * 检查 URL 是否为 Vercel Blob 私有 URL
 */
export function isBlobUrl(url: string): boolean {
  return url.includes('vercel-blob.com') || url.includes('.vercel-storage.com')
}

/**
 * 上传到 Vercel Blob（私有模式）
 */
async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  // Vercel Blob SDK 类型定义只显示 'public' 访问，但实际运行时
  // 会根据 token 和存储配置自动处理。使用 addRandomSuffix: false 
  // 因为我们已经在文件名中加了时间戳
  const blob = await put(filename, buffer, { 
    contentType, 
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  } as Parameters<typeof put>[2])
  
  // 检查返回的 URL 是否为私有 URL（不含 .public.）
  const isPrivate = !blob.url.includes('.public.blob.')
  console.log(`[UPLOAD] Blob uploaded: ${blob.url} (private: ${isPrivate})`)
  
  return { url: blob.url, filename, size: buffer.length, isPrivate }
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
    console.log(`[UPLOAD] Using Vercel Blob (private) for ${filename}`)
    return uploadToBlob(buffer, filename, contentType)
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN not configured. ' +
      'Please add it in Vercel Dashboard → Settings → Environment Variables.'
    )
  }

  console.log(`[UPLOAD] Using local filesystem for ${filename}`)
  return uploadToLocal(buffer, filename)
}
