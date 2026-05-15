# Riven Blog

A modern personal blog with community forum features, built with Next.js 14.

## Features

- **Blog System**
  - Article publishing with Markdown editor
  - Tag-based categorization
  - Reading time estimation
  - Syntax highlighting for code blocks
  - Comment system with nested replies
  - Like functionality for comments

- **Community Forum**
  - Create and browse forum posts
  - Nested comment system
  - Like functionality

- **Authentication**
  - GitHub OAuth login
  - Email/password authentication
  - Email whitelist-based admin access

- **Admin Dashboard**
  - Article management (create, edit, publish, delete)
  - Draft/published status control

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Prisma ORM (SQLite dev / PostgreSQL prod) |
| Auth | NextAuth.js v4 |
| Storage | Vercel Blob |
| Markdown | react-markdown, remark-gfm, rehype-highlight |

## Project Structure

```
riven-blog/
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # API routes
│   │   ├── articles/      # Article list
│   │   ├── forum/         # Forum
│   │   ├── posts/         # Post details
│   │   └── login/         # Login page
│   ├── components/        # Reusable components
│   └── lib/               # Utilities (auth, prisma, permissions)
├── .env                    # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database (SQLite)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (create at https://github.com/settings/applications/new)
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"

# Access Control (comma-separated emails)
ALLOWED_EMAILS="your-email@example.com"

# Vercel Blob (optional, for production)
BLOB_READ_WRITE_TOKEN=""
```

## Deployment

This project is optimized for deployment on Vercel.

### Vercel Setup

1. Fork/import this repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Production Database

For production, use PostgreSQL (e.g., Neon, Supabase):

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Build Command

```bash
npm run build
```

## API Routes

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/*` | GET/POST | NextAuth handlers | - |
| `/api/posts` | GET | List published posts | Public |
| `/api/posts` | POST | Create post | Admin |
| `/api/admin/posts` | GET/POST | Manage posts | Admin |
| `/api/admin/posts/[id]` | PUT/DELETE | Update/delete post | Admin |
| `/api/comments` | GET/POST | Comments CRUD | - |
| `/api/comments/[id]/like` | POST | Like comment | User |
| `/api/forum/*` | GET/POST | Forum posts | Public |
| `/api/upload` | POST | Image upload | Admin |

## Database Models

- **User** - User accounts with OAuth/email auth
- **Post** - Blog articles with Markdown content
- **Tag** - Article categorization tags
- **Comment** - Nested comments on posts
- **ForumPost** - Community forum posts
- **ForumComment** - Nested forum comments

## License

MIT
