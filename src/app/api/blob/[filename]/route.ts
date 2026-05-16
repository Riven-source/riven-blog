// src/app/api/blob/[filename]/route.ts
// 用于访问 Vercel Blob 私有文件的代理路由
import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const searchParams = request.nextUrl.searchParams
  const blobUrl = searchParams.get('url')

  if (!blobUrl) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 })
  }

  try {
    // 列出 Blob 以获取下载信息
    const { blobs } = await list({
      prefix: filename,
      mode: 'folded',
      limit: 10,
    })

    // 查找匹配的 blob
    const matchedBlob = blobs.find(b => b.url === blobUrl)

    if (!matchedBlob) {
      // 如果找不到精确匹配，返回 404
      return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    }

    // 重定向到 downloadUrl（Vercel Blob 生成的带授权的临时 URL）
    return NextResponse.redirect(matchedBlob.downloadUrl)
  } catch (err) {
    console.error('[BLOB] 获取文件失败:', err)
    return NextResponse.json({ error: '获取文件失败' }, { status: 500 })
  }
}
