// src/app/api/forum/comments/[id]/like/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const existingLike = await prisma.forumCommentLike.findUnique({
    where: {
      commentId_userId: {
        commentId: params.id,
        userId: session.user.id,
      },
    },
  })

  if (existingLike) {
    await prisma.forumCommentLike.delete({ where: { id: existingLike.id } })
    return NextResponse.json({ liked: false })
  } else {
    await prisma.forumCommentLike.create({
      data: { commentId: params.id, userId: session.user.id },
    })
    return NextResponse.json({ liked: true })
  }
}
