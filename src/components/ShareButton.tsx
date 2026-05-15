// src/components/ShareButton.tsx
'use client'

interface ShareButtonProps {
  url: string
}

export function ShareButton({ url }: ShareButtonProps) {
  const handleShare = () => {
    const fullUrl = window.location.origin + url
    navigator.clipboard.writeText(fullUrl).then(() => {
      // 创建提示气泡
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-ink-800 text-paper-50 px-4 py-2 rounded-sm text-sm shadow-lg animate-fade-in z-50'
      toast.textContent = '✓ 已复制链接'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 2000)
    })
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-ink-400 hover:text-ink-700 text-sm transition-colors px-3 py-1.5 border border-paper-300 rounded-sm hover:border-ink-300"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      分享
    </button>
  )
}
