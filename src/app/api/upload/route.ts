// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  // 检查邮箱权限
  const { isEmailAllowed } = await import('@/lib/permissions')
  if (!isEmailAllowed(session.user.email)) {
    return NextResponse.json({ error: '无权限访问' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件格式，仅支持 JPEG、PNG、GIF、WebP' },
        { status: 400 }
      )
    }

    // 检查文件大小（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `文件大小不能超过 ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成唯一文件名
    const ext = path.extname(file.name).toLowerCase() || '.png'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${random}${ext}`

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // 写入文件
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // 返回公开访问的 URL
    const url = `/uploads/${filename}`

    // 文件上传成功，返回 URL
    return NextResponse.json({
      url,
      filename,
      size: file.size,
    })
  } catch {
    return NextResponse.json(
      { error: '图片上传失败，请稍后重试' },
      { status: 500 }
    )
  }
}
