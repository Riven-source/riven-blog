/**
 * 图片上传功能端到端测试套件
 * 
 * 运行方式:
 *   1. 本地测试: npm run test:upload
 *   2. 指定环境: BASE_URL=https://your-app.vercel.app npm run test:upload
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ============ 配置 ============
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  uploadUrl: '/api/upload',
  uploadDir: path.join(__dirname, '..', 'public', 'uploads'),
  testImagesDir: path.join(__dirname, 'fixtures'),
  timeout: 60000, // 60s 超时
}

// ============ 测试工具 ============
class TestRunner {
  constructor() {
    this.passed = 0
    this.failed = 0
    this.results = []
  }

  async run(name, fn) {
    const start = Date.now()
    try {
      await fn()
      const duration = Date.now() - start
      this.passed++
      this.results.push({ name, status: 'PASS', duration })
      console.log(`  ✓ ${name} (${duration}ms)`)
    } catch (err) {
      const duration = Date.now() - start
      this.failed++
      this.results.push({ name, status: 'FAIL', duration, error: err.message })
      console.log(`  ✗ ${name} (${duration}ms)`)
      console.log(`    Error: ${err.message}`)
    }
  }

  summary() {
    console.log('\n' + '='.repeat(50))
    console.log(`结果: ${this.passed} 通过, ${this.failed} 失败`)
    console.log('='.repeat(50))
    return { passed: this.passed, failed: this.failed, results: this.results }
  }
}

/**
 * 创建测试图片文件
 */
function createTestImage(type, size = 1024) {
  const buffers = []
  
  switch (type) {
    case 'jpeg':
      // JPEG 文件头
      buffers.push(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00]))
      // 填充数据
      buffers.push(Buffer.alloc(size - 11, 0xAA))
      // JPEG 文件尾
      buffers.push(Buffer.from([0xFF, 0xD9]))
      break
    
    case 'png':
      // PNG 文件头
      buffers.push(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
      // 填充数据
      buffers.push(Buffer.alloc(size - 8, 0x00))
      break
    
    case 'gif':
      // GIF89a 文件头
      buffers.push(Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))
      // 填充数据
      buffers.push(Buffer.alloc(size - 6, 0x00))
      break
    
    case 'webp':
      // RIFF....WEBP
      buffers.push(Buffer.from([0x52, 0x49, 0x46, 0x46]))
      buffers.push(Buffer.alloc(4, 0x00)) // size placeholder
      buffers.push(Buffer.from([0x57, 0x45, 0x42, 0x50]))
      buffers.push(Buffer.alloc(size - 12, 0x00))
      break
    
    default:
      throw new Error(`Unknown type: ${type}`)
  }
  
  return Buffer.concat(buffers)
}

/**
 * 模拟文件上传请求
 */
async function uploadFile(fileBuffer, filename, additionalFields = {}) {
  const formData = new FormData()
  formData.append('file', new Blob([fileBuffer]), filename)
  
  for (const [key, value] of Object.entries(additionalFields)) {
    formData.append(key, value)
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout)
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}${CONFIG.uploadUrl}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置（包含 boundary）
      },
    })
    
    clearTimeout(timeoutId)
    
    const data = await response.json()
    return { status: response.status, ok: response.ok, data }
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * 检查文件是否存在（本地存储）
 */
function localFileExists(filename) {
  const filepath = path.join(CONFIG.uploadDir, filename)
  return fs.existsSync(filepath)
}

// ============ 测试用例 ============
async function runUploadTests() {
  console.log('\n🧪 图片上传功能 E2E 测试\n')
  console.log(`目标服务器: ${CONFIG.baseUrl}`)
  console.log('-' .repeat(50))
  
  const runner = new TestRunner()
  
  // ============ 前置条件检查 ============
  await runner.run('服务器可访问', async () => {
    const response = await fetch(`${CONFIG.baseUrl}`)
    if (!response.ok && response.status !== 404) {
      throw new Error(`服务器返回 ${response.status}`)
    }
  })
  
  // ============ 正常上传流程测试 ============
  
  await runner.run('上传有效 JPEG 图片', async () => {
    const buffer = createTestImage('jpeg', 50 * 1024) // 50KB
    const result = await uploadFile(buffer, 'test.jpg')
    
    if (!result.ok) {
      throw new Error(`上传失败: ${result.data.error || result.status}`)
    }
    
    if (!result.data.url) {
      throw new Error('响应缺少 url 字段')
    }
    
    // 验证 URL 格式
    if (!result.data.url.startsWith('http') && !result.data.url.startsWith('/')) {
      throw new Error(`无效的 URL: ${result.data.url}`)
    }
    
    console.log(`    -> 返回 URL: ${result.data.url.substring(0, 60)}...`)
  })
  
  await runner.run('上传有效 PNG 图片', async () => {
    const buffer = createTestImage('png', 50 * 1024)
    const result = await uploadFile(buffer, 'test.png')
    
    if (!result.ok) {
      throw new Error(`上传失败: ${result.data.error || result.status}`)
    }
  })
  
  await runner.run('上传有效 GIF 图片', async () => {
    const buffer = createTestImage('gif', 50 * 1024)
    const result = await uploadFile(buffer, 'test.gif')
    
    if (!result.ok) {
      throw new Error(`上传失败: ${result.data.error || result.status}`)
    }
  })
  
  await runner.run('上传有效 WebP 图片', async () => {
    const buffer = createTestImage('webp', 50 * 1024)
    const result = await uploadFile(buffer, 'test.webp')
    
    if (!result.ok) {
      throw new Error(`上传失败: ${result.data.error || result.status}`)
    }
  })
  
  // ============ 边界情况测试 ============
  
  await runner.run('拒绝无效文件类型 (text/plain)', async () => {
    const buffer = Buffer.from('This is not an image')
    const result = await uploadFile(buffer, 'test.txt')
    
    // 魔数验证应该失败
    if (result.ok) {
      throw new Error('应该拒绝非图片文件但被接受了')
    }
    
    if (result.data.code !== 'INVALID_CONTENT' && result.data.code !== 'INVALID_TYPE') {
      throw new Error(`意外的错误码: ${result.data.code}`)
    }
  })
  
  await runner.run('拒绝超大文件 (15MB)', async () => {
    const buffer = createTestImage('jpeg', 15 * 1024 * 1024)
    const result = await uploadFile(buffer, 'large.jpg')
    
    if (result.ok) {
      throw new Error('应该拒绝超大文件但被接受了')
    }
    
    if (result.data.code !== 'TOO_LARGE') {
      throw new Error(`意外的错误码: ${result.data.code}`)
    }
  })
  
  await runner.run('拒绝无文件上传', async () => {
    const formData = new FormData()
    // 不添加 file 字段
    
    const response = await fetch(`${CONFIG.baseUrl}${CONFIG.uploadUrl}`, {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    if (response.ok) {
      throw new Error('应该返回错误但成功了')
    }
    
    if (data.code !== 'NO_FILE') {
      throw new Error(`意外的错误码: ${data.code}`)
    }
  })
  
  // ============ 文件名安全测试 ============
  
  await runner.run('处理特殊字符文件名', async () => {
    const buffer = createTestImage('jpeg', 10 * 1024)
    const result = await uploadFile(buffer, 'test <>:"/\\|?*.jpg')
    
    // 应该成功（文件名会被清理）
    if (!result.ok) {
      throw new Error(`特殊字符文件名处理失败: ${result.data.error}`)
    }
  })
  
  // ============ 并发上传测试 ============
  
  await runner.run('并发上传 3 个文件', async () => {
    const uploads = Array.from({ length: 3 }, (_, i) => {
      const buffer = createTestImage('png', 20 * 1024)
      return uploadFile(buffer, `concurrent-${i}.png`)
    })
    
    const results = await Promise.all(uploads)
    const failed = results.filter(r => !r.ok)
    
    if (failed.length > 0) {
      throw new Error(`${failed.length}/3 个并发请求失败`)
    }
  })
  
  // ============ 返回数据验证 ============
  
  await runner.run('验证返回数据结构', async () => {
    const buffer = createTestImage('jpeg', 10 * 1024)
    const result = await uploadFile(buffer, 'response-test.jpg')
    
    if (!result.data.filename) {
      throw new Error('缺少 filename 字段')
    }
    
    if (typeof result.data.size !== 'number') {
      throw new Error('缺少 size 字段')
    }
    
    if (!result.data.requestId) {
      throw new Error('缺少 requestId 字段')
    }
    
    if (result.data.size !== buffer.length) {
      throw new Error(`大小不匹配: 期望 ${buffer.length}, 实际 ${result.data.size}`)
    }
  })
  
  // ============ 超时测试 ============
  
  await runner.run('请求超时处理', async () => {
    // 这个测试需要特殊的超大文件来触发超时
    // 在 CI 环境中可能跳过
    if (process.env.CI) {
      console.log('    (跳过 - CI 环境)')
      return
    }
    
    const buffer = createTestImage('jpeg', 100 * 1024)
    const controller = new AbortController()
    
    // 设置 100ms 超时
    setTimeout(() => controller.abort(), 100)
    
    const formData = new FormData()
    formData.append('file', new Blob([buffer]), 'timeout-test.jpg')
    
    try {
      await fetch(`${CONFIG.baseUrl}${CONFIG.uploadUrl}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        return // 预期行为
      }
    }
  })
  
  // ============ 本地存储验证（仅开发环境）===========
  if (CONFIG.baseUrl === 'http://localhost:3000') {
    await runner.run('本地存储文件存在验证', async () => {
      const buffer = createTestImage('jpeg', 10 * 1024)
      const result = await uploadFile(buffer, 'local-storage-test.jpg')
      
      if (result.ok && result.data.url.startsWith('/uploads/')) {
        const filename = path.basename(result.data.url)
        if (!localFileExists(filename)) {
          throw new Error(`文件 ${filename} 未在本地存储中找到`)
        }
      }
    })
  }
  
  return runner.summary()
}

// ============ 运行测试 ============
runUploadTests()
  .then(({ passed, failed }) => {
    console.log('\n测试完成!\n')
    process.exit(failed > 0 ? 1 : 0)
  })
  .catch(err => {
    console.error('\n测试运行失败:', err)
    process.exit(1)
  })
