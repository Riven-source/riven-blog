// src/app/actions/post.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { CreatePostInput } from '@/types/post'

interface ActionResult {
  success: boolean
  error?: string
  postId?: string
}

async function getAuthorizedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error('请先登录')
  }

  // 使用缓存的查询，避免不必要的数据库调用
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  })

  if (!user) {
    throw new Error('用户不存在')
  }
  return user
}

export async function createPost(input: CreatePostInput): Promise<ActionResult> {
  try {
    const user = await getAuthorizedUser()

    const post = await prisma.post.create({
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt || null,
        coverImage: input.coverImage || null,
        published: input.published,
        authorId: user.id,
        tags: {
          connectOrCreate: input.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })

    // 清理相关缓存
    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true, postId: post.id }
  } catch (error) {
    // 不记录敏感信息到日志
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建文章失败',
    }
  }
}

export async function updatePost(id: string, input: CreatePostInput): Promise<ActionResult> {
  try {
    await getAuthorizedUser()

    await prisma.post.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt || null,
        coverImage: input.coverImage || null,
        published: input.published,
        tags: {
          set: [],
          connectOrCreate: input.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })

    // 清理相关缓存
    revalidatePath('/')
    revalidatePath(`/posts/${input.slug}`)
    revalidatePath('/admin')

    return { success: true, postId: id }
  } catch (error) {
    // 不记录敏感信息到日志
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新文章失败',
    }
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await getAuthorizedUser()
    await prisma.post.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    // 不记录敏感信息到日志
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除文章失败',
    }
  }
}

export async function togglePublish(id: string, published: boolean): Promise<ActionResult> {
  try {
    await getAuthorizedUser()
    const post = await prisma.post.update({
      where: { id },
      data: { published },
    })
    revalidatePath('/')
    revalidatePath(`/posts/${post.slug}`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    // 不记录敏感信息到日志
    return {
      success: false,
      error: error instanceof Error ? error.message : '操作失败',
    }
  }
}
