// src/components/TagFilter.tsx
'use client'
import Link from 'next/link'

interface TagFilterProps {
  tags: { name: string; count: number }[]
  currentTag?: string
}

export function TagFilter({ tags, currentTag }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      <Link
        href="/"
        className={`tag-badge ${!currentTag ? 'bg-ink-800 text-paper-50 hover:bg-ink-800' : ''}`}
      >
        全部
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/?tag=${tag.name}`}
          className={`tag-badge ${currentTag === tag.name ? 'bg-ink-800 text-paper-50 hover:bg-ink-800' : ''}`}
        >
          {tag.name}
          <span className="ml-1 opacity-60 text-xs">({tag.count})</span>
        </Link>
      ))}
    </div>
  )
}
