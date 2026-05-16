// src/app/api/diagnostic/route.ts
// 数据库连接诊断 API（仅用于排查问题，生产环境可删除）
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result: {
    status: string
    databaseUrl: { configured: boolean; protocol: string | null }
    prismaConnection: { success: boolean; error?: string; duration?: number }
    neonConfig: { hasPoolParams: boolean; hasConnectionLimit: boolean }
  } = {
    status: 'unknown',
    databaseUrl: { configured: false, protocol: null },
    prismaConnection: { success: false },
    neonConfig: { hasPoolParams: false, hasConnectionLimit: false },
  }

  // 检查 DATABASE_URL 配置
  const dbUrl = process.env.DATABASE_URL || ''
  if (dbUrl) {
    result.databaseUrl.configured = true
    try {
      const url = new URL(dbUrl)
      result.databaseUrl.protocol = url.protocol
      result.neonConfig.hasPoolParams = dbUrl.includes('pgBouncer=true')
      result.neonConfig.hasConnectionLimit = dbUrl.includes('connection_limit=')
    } catch {
      result.databaseUrl.protocol = 'invalid'
    }
  }

  // 测试 Prisma 连接
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  })

  const startTime = Date.now()
  try {
    await prisma.$connect()
    result.prismaConnection.success = true
    result.prismaConnection.duration = Date.now() - startTime
    result.status = 'connected'
  } catch (err) {
    result.prismaConnection.error = err instanceof Error ? err.message : String(err)
    result.status = 'error'

    // 识别特定错误
    if (result.prismaConnection.error.includes('P1001')) {
      result.prismaConnection.error += ' (database server unreachable: check if Neon is paused or has network restrictions)'
    } else if (result.prismaConnection.error.includes('P1003')) {
      result.prismaConnection.error += ' (database not found: check DATABASE_URL database name)'
    } else if (result.prismaConnection.error.includes('authentication failed')) {
      result.prismaConnection.error += ' (authentication failed: check username and password)'
    }
  } finally {
    await prisma.$disconnect()
  }

  return NextResponse.json(result)
}
