// src/app/api/forum/route.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 获取论坛帖子列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') || 'latest'

  const posts = await prisma.forumPost.findMany({
    orderBy: sort === 'hot'
      ? { comments: { _count: 'desc' } }
      : { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  })

  return NextResponse.json(posts)
}

// 创建论坛帖子
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content } = body

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
  }

  const post = await prisma.forumPost.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  })

  revalidatePath('/forum')
  return NextResponse.json(post)
}
