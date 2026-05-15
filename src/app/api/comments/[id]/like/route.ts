// src/app/api/comments/[id]/like/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 点赞/取消点赞评论
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const commentId = params.id

  // 检查评论是否存在
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) {
    return NextResponse.json({ error: '评论不存在' }, { status: 404 })
  }

  // 检查是否已点赞
  const existingLike = await prisma.commentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId: session.user.id,
      },
    },
  })

  if (existingLike) {
    // 取消点赞
    await prisma.commentLike.delete({
      where: { id: existingLike.id },
    })
    return NextResponse.json({ liked: false })
  } else {
    // 点赞
    await prisma.commentLike.create({
      data: {
        commentId,
        userId: session.user.id,
      },
    })
    return NextResponse.json({ liked: true })
  }
}
