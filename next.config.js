/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 无服务器环境配置
  // 解决大文件上传时的请求体大小限制
  serverExternalPackages: ['@prisma/client', '@prisma/extension-client', '@vercel/blob'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  // 请求体大小限制（Vercel Serverless 4.5MB 软限制）
  // 实际可上传 10MB，但需要考虑 Base64/Multipart 开销
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
    responseLimit: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig
