// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // 防止 Next.js 热重载时创建多个 Prisma Client 实例
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// 复用全局实例（开发环境热重载时不会重复创建）
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
