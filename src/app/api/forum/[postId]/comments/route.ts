// src/app/api/forum/[postId]/comments/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取论坛帖子评论
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const comments = await prisma.forumComment.findMany({
    where: { postId: params.postId, parentId: null },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, image: true } },
          likes: { select: { userId: true } },
        },
      },
      likes: { select: { userId: true } },
      _count: { select: { likes: true } },
    },
  })
  return NextResponse.json(comments)
}

// 创建评论
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const body = await request.json()
  const { content, parentId } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
  }

  const comment = await prisma.forumComment.create({
    data: {
      content: content.trim(),
      postId: params.postId,
      authorId: session.user.id,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: { select: { userId: true } },
      _count: { select: { likes: true } },
    },
  })

  return NextResponse.json(comment)
}
