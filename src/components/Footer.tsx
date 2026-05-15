// src/components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-paper-300 bg-paper-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <p className="font-serif italic">Built with Next.js · Deployed on Vercel</p>
          <p>© {new Date().getFullYear()} Riven Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
