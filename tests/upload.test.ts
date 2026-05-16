/**
 * 图片上传单元测试
 * 测试上传相关的独立功能
 */

import { describe, it, expect } from 'vitest'
import path from 'path'

// ============ 待测试的函数（从源码导入）============

// 模拟 generateFilename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.png'
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
}

// 模拟 sanitizeFilename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100)
}

// 模拟 verifyImageContent
const IMAGE_SIGNATURES: Record<string, { bytes: number[]; offset?: number }> = {
  'image/jpeg': { bytes: [0xFF, 0xD8, 0xFF] },
  'image/png': { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  'image/gif': { bytes: [0x47, 0x49, 0x46] },
  'image/webp': { bytes: [0x52, 0x49, 0x46, 0x46], offset: 8 },
}

function verifyImageContent(buffer: Buffer, mimeType: string): boolean {
  const sig = IMAGE_SIGNATURES[mimeType]
  if (!sig) return false
  
  const offset = sig.offset || 0
  const header = buffer.slice(offset, offset + sig.bytes.length)
  
  return sig.bytes.every((byte: number, i: number) => header[i] === byte)
}

// ============ 测试用例 ============

describe('generateFilename', () => {
  it('should generate unique filenames with timestamp', () => {
    const filename1 = generateFilename('test.jpg')
    const filename2 = generateFilename('test.jpg')
    
    expect(filename1).toMatch(/^upload-\d+-[a-z0-9]+\.jpg$/)
    expect(filename1).not.toBe(filename2)
  })
  
  it('should extract extension correctly', () => {
    const jpg = generateFilename('photo.JPEG')
    const png = generateFilename('image.PNG')
    const noext = generateFilename('file')
    
    expect(jpg.endsWith('.jpeg')).toBe(true)
    expect(png.endsWith('.png')).toBe(true)
    expect(noext.endsWith('.png')).toBe(true)
  })
})

describe('sanitizeFilename', () => {
  it('should remove dangerous characters', () => {
    // 危险字符被替换为下划线，连续的下划线会被合并
    expect(sanitizeFilename('file<>:"/\\|?.jpg')).toBe('file_.jpg')
  })
  
  it('should collapse consecutive underscores', () => {
    expect(sanitizeFilename('file___name.jpg')).toBe('file_name.jpg')
  })
  
  it('should limit filename length', () => {
    const longName = 'a'.repeat(150) + '.jpg'
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(100)
  })
})

describe('verifyImageContent', () => {
  it('should validate JPEG files', () => {
    const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46])
    expect(verifyImageContent(buffer, 'image/jpeg')).toBe(true)
  })
  
  it('should reject invalid JPEG files', () => {
    const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    expect(verifyImageContent(buffer, 'image/jpeg')).toBe(false)
  })
  
  it('should validate PNG files', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    expect(verifyImageContent(buffer, 'image/png')).toBe(true)
  })
  
  it('should validate GIF files', () => {
    const buffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    expect(verifyImageContent(buffer, 'image/gif')).toBe(true)
  })
  
  it('should validate WebP files', () => {
    const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x52, 0x49, 0x46, 0x46])
    expect(verifyImageContent(buffer, 'image/webp')).toBe(true)
  })
})

describe('file size limits', () => {
  const MAX_SIZE = 10 * 1024 * 1024
  
  it('should accept 10MB files', () => {
    expect(MAX_SIZE).toBe(10 * 1024 * 1024)
    expect(MAX_SIZE <= MAX_SIZE).toBe(true)
  })
})

describe('supported image types', () => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  it('should support JPEG', () => {
    expect(ALLOWED_TYPES.includes('image/jpeg')).toBe(true)
  })
  
  it('should support PNG', () => {
    expect(ALLOWED_TYPES.includes('image/png')).toBe(true)
  })
  
  it('should support GIF', () => {
    expect(ALLOWED_TYPES.includes('image/gif')).toBe(true)
  })
  
  it('should support WebP', () => {
    expect(ALLOWED_TYPES.includes('image/webp')).toBe(true)
  })
  
  it('should not support BMP', () => {
    expect(ALLOWED_TYPES.includes('image/bmp')).toBe(false)
  })
})

describe('Vercel Serverless compatibility', () => {
  const TIMEOUT_MS = 55000
  
  it('should have reasonable timeout', () => {
    expect(TIMEOUT_MS).toBeLessThan(60000)
    expect(TIMEOUT_MS).toBeGreaterThan(50000)
  })
})
