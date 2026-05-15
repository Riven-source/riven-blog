#!/bin/bash
cd "$(dirname "$0")"

# 杀占用 3000 端口的进程
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# 启动开发服务器
echo "🚀 启动中..."
npm run dev
