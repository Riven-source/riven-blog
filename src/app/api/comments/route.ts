// src/app/api/comments/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取文章评论
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')
  const sort = searchParams.get('sort') || 'latest' // latest | hot

  if (!postId) {
    return NextResponse.json({ error: '缺少文章ID' }, { status: 400 })
  }

  const orderBy = sort === 'hot'
    ? { likes: { _count: 'desc' as const } }
    : { createdAt: 'desc' as const }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null, // 只获取顶级评论
    },
    orderBy,
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, image: true } },
          likes: { select: { userId: true } },
          _count: { select: { likes: true } },
        },
      },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, replies: true } },
    },
  })

  return NextResponse.json(comments)
}

// 创建评论
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const body = await request.json()
  const { postId, content, parentId } = body

  if (!postId || !content?.trim()) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  // 如果是回复，检查父评论是否存在
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent) {
      return NextResponse.json({ error: '父评论不存在' }, { status: 404 })
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: session.user.id,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, replies: true } },
    },
  })

  return NextResponse.json(comment)
}
