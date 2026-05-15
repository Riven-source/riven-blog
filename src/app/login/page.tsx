'use client'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

// 错误码映射
const ErrorMessages: Record<string, string> = {
  USER_NOT_FOUND: '用户不存在',
  INVALID_PASSWORD: '密码错误',
  INVALID_CREDENTIALS: '请填写邮箱和密码',
  ACCESS_DENIED: '该账号没有管理员权限',
}

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, callbackUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        // 根据错误码显示细分提示
        const errorMessage = ErrorMessages[data.code] || data.error || '登录失败'
        setFormError(errorMessage)
      } else {
        // 登录成功后使用 NextAuth signIn
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl,
        })

        if (result?.url) {
          router.push(result.url)
        } else {
          router.push(callbackUrl)
        }
      }
    } catch {
      setFormError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || '注册失败')
      } else {
        setSuccessMessage('注册成功！请使用邮箱和密码登录')
        setIsLogin(true)
        setPassword('')
      }
    } catch {
      setFormError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-ink-950 mb-3">
            {isLogin ? '管理员登录' : '注册账号'}
          </h1>
          <p className="text-ink-500 text-sm">
            {isLogin ? '登录管理后台' : '创建新账号'}
          </p>
        </div>

        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
            {error === 'AccessDenied'
              ? '❌ 该账号没有访问权限，请联系管理员'
              : error || formError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm text-green-700 text-sm">
            ✅ {successMessage}
          </div>
        )}

        <div className="bg-paper-50 border border-paper-300 rounded-sm p-8">
          {/* Tab 切换 */}
          <div className="flex mb-6 border-b border-paper-300">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setFormError(''); setSuccessMessage('') }}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                isLogin ? 'text-ink-950 border-b-2 border-ink-950' : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setFormError(''); setSuccessMessage('') }}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                !isLogin ? 'text-ink-950 border-b-2 border-ink-950' : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              注册
            </button>
          </div>

          {isLogin ? (
            <>
              {/* 邮箱登录表单 */}
              <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-ink-700 mb-1">
                    邮箱
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-paper-300 rounded-sm bg-paper-50 text-ink-900 focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-ink-700 mb-1">
                    密码
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-paper-300 rounded-sm bg-paper-50 text-ink-900 focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-3 disabled:opacity-50"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-paper-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-paper-50 px-3 text-ink-400">或</span>
                </div>
              </div>

              {/* GitHub 登录 */}
              <button
                onClick={() => signIn('github', { callbackUrl })}
                className="w-full btn-primary justify-center py-3 gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                使用 GitHub 登录
              </button>
            </>
          ) : (
            /* 注册表单 */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-ink-700 mb-1">
                  昵称
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-paper-300 rounded-sm bg-paper-50 text-ink-900 focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500"
                  placeholder="你的昵称"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-ink-700 mb-1">
                  邮箱
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-paper-300 rounded-sm bg-paper-50 text-ink-900 focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-ink-700 mb-1">
                  密码
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-paper-300 rounded-sm bg-paper-50 text-ink-900 focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500"
                  placeholder="至少 6 个字符"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 disabled:opacity-50"
              >
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><p className="text-ink-400">加载中...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
