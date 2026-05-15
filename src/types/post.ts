// src/types/post.ts
export interface PostWithAuthor {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
  tags: { id: string; name: string }[]
}

export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  createdAt: Date
  author: {
    name: string | null
    image: string | null
  }
  tags: { id: string; name: string }[]
}

export interface CreatePostInput {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  tags: string[]
}
