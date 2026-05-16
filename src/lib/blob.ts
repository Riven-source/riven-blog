// src/lib/blob.ts
// 处理 Vercel Blob 私有文件的 URL 转换

/**
 * 判断是否为 Vercel Blob URL
 */
export function isBlobUrl(url: string): boolean {
  if (!url) return false
  return url.includes('blob.vercel-storage.com') || 
         url.includes('vercel-blob.com') ||
         url.includes('.public.blob.')
}

/**
 * 判断是否为私有 Blob URL（不含 public 关键字）
 */
export function isPrivateBlobUrl(url: string): boolean {
  return isBlobUrl(url) && !url.includes('.public.blob.')
}

/**
 * 从 Blob URL 中提取文件名
 * 例如: https://xxx.blob.vercel-storage.com/uploads/abc.png -> abc.png
 */
export function extractBlobFilename(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/')
    return parts[parts.length - 1] || null
  } catch {
    return null
  }
}

/**
 * 将私有 Blob URL 转换为代理 URL
 * 私有 URL: https://xxx.blob.vercel-storage.com/path/filename.png
 * 代理 URL: /api/blob/filename.png?url=https://xxx.blob.vercel-storage.com/path/filename.png
 */
export function toProxyUrl(url: string): string {
  if (!isPrivateBlobUrl(url)) {
    return url // 非私有 blob 或非 blob URL，直接返回
  }
  
  const filename = extractBlobFilename(url)
  if (!filename) return url
  
  return `/api/blob/${encodeURIComponent(filename)}?url=${encodeURIComponent(url)}`
}

/**
 * 获取适合 img src 使用的 URL
 * - 公共 blob URL: 直接使用
 * - 私有 blob URL: 转换为代理 URL
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (isPrivateBlobUrl(url)) {
    return toProxyUrl(url)
  }
  return url
}
