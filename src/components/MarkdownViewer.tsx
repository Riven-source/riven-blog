// src/components/MarkdownViewer.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { isPrivateBlobUrl, extractBlobFilename } from '@/lib/blob'
import { visit } from 'unist-util-visit'
import type { Node, Element } from 'hast'

interface MarkdownViewerProps {
  content: string
}

/**
 * 将 Markdown 中的私有 blob 图片 URL 转换为代理 URL
 */
function transformBlobUrls(content: string): string {
  // 匹配 markdown 图片语法: ![alt](url)
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, url) => {
      if (isPrivateBlobUrl(url)) {
        const filename = extractBlobFilename(url)
        if (filename) {
          const proxyUrl = `/api/blob/${encodeURIComponent(filename)}?url=${encodeURIComponent(url)}`
          return `![${alt}](${proxyUrl})`
        }
      }
      return match
    }
  )
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  // 预处理：转换私有 blob URL
  const processedContent = transformBlobUrls(content)

  return (
    <div className="prose prose-lg max-w-none
      prose-headings:font-serif
      prose-h1:text-4xl prose-h1:text-ink-950
      prose-h2:text-2xl prose-h2:text-ink-900 prose-h2:border-b prose-h2:border-paper-300 prose-h2:pb-2
      prose-h3:text-xl prose-h3:text-ink-800
      prose-p:text-ink-700 prose-p:leading-relaxed
      prose-a:text-ink-600 prose-a:underline-offset-2 hover:prose-a:text-ink-900
      prose-strong:text-ink-900
      prose-code:font-mono prose-code:text-sm
      prose-blockquote:border-ink-300 prose-blockquote:text-ink-600 prose-blockquote:italic
      prose-img:rounded-sm prose-img:mx-auto
      prose-hr:border-paper-300
      prose-li:text-ink-700
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
