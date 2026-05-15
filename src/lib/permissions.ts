// src/lib/permissions.ts
// 独立的权限检查模块，不依赖 bcrypt 或 prisma（用于 Edge Runtime）

/**
 * 检查邮箱是否有管理员权限（不区分大小写）
 * 仅依赖环境变量，可安全用于 middleware/edge runtime
 */
export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  
  // 统一转为小写进行比较
  const normalizedEmail = email.toLowerCase()
  const allowedEmails = process.env.ALLOWED_EMAILS
    ?.split(',')
    .map((e) => e.trim().toLowerCase()) || []
  
  if (allowedEmails.length === 0) return true // 未配置时允许所有
  return allowedEmails.includes(normalizedEmail)
}
