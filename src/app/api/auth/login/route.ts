// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { isEmailAllowed } from '@/lib/permissions'

// 错误码
const AuthErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCESS_DENIED: 'ACCESS_DENIED',
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '请填写邮箱和密码', code: AuthErrorCodes.INVALID_CREDENTIALS },
        { status: 400 }
      )
    }

    // 统一转为小写
    const normalizedEmail = email.toLowerCase()

    // 检查邮箱是否有访问权限（不区分大小写）
    if (!isEmailAllowed(normalizedEmail)) {
      return NextResponse.json(
        { error: '该账号没有管理员权限', code: AuthErrorCodes.ACCESS_DENIED },
        { status: 403 }
      )
    }

    // 使用小写邮箱查询用户
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在', code: AuthErrorCodes.USER_NOT_FOUND },
        { status: 401 }
      )
    }

    // 用户存在但未设置密码（可能是 GitHub 登录的用户）
    if (!user.password) {
      return NextResponse.json(
        { error: '该账号未设置密码，请使用 GitHub 登录', code: AuthErrorCodes.USER_NOT_FOUND },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: '密码错误', code: AuthErrorCodes.INVALID_PASSWORD },
        { status: 401 }
      )
    }

    // 登录成功
    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error) {
    // 不记录敏感信息到日志
    return NextResponse.json(
      { error: '服务器错误，请稍后重试', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
