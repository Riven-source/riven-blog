# 个人博客完整部署手册

> 基于 Next.js 14 + Neon PostgreSQL + Vercel + GitHub OAuth
> 预计完成时间：**45～60 分钟**（首次部署）

---

## 目录

1. [环境准备](#一环境准备本地开发工具)
2. [注册所需服务](#二注册所需服务)
3. [初始化项目](#三初始化本地项目)
4. [配置数据库（Neon）](#四配置数据库neon)
5. [配置 GitHub OAuth](#五配置-github-oauth)
6. [本地开发测试](#六本地开发测试)
7. [部署到 Vercel](#七部署到-vercel)
8. [配置 Vercel Blob 存储](#八配置-vercel-blob-存储)
9. [绑定自定义域名（可选）](#九绑定自定义域名可选)
10. [上线后验证清单](#十上线后验证清单)
11. [日常运维](#十一日常运维)
12. [常见问题排查](#十二常见问题排查)

---

## 一、环境准备（本地开发工具）

### 1.1 安装 Node.js

访问 https://nodejs.org 下载并安装 **Node.js 18.x 或 20.x LTS** 版本。

安装后验证：
```bash
node -v    # 应显示 v18.x.x 或 v20.x.x
npm -v     # 应显示 9.x.x 或 10.x.x
```

### 1.2 安装 Git

访问 https://git-scm.com/downloads 下载安装。

验证：
```bash
git --version  # 应显示 git version 2.x.x
```

### 1.3 准备代码编辑器（推荐）

推荐使用 **VS Code**：https://code.visualstudio.com

推荐安装的 VS Code 扩展：
- Prisma（数据库 schema 高亮）
- Tailwind CSS IntelliSense
- ESLint

---

## 二、注册所需服务

以下服务均**完全免费**，注册时选择 Free/Hobby 计划即可。

### 2.1 注册 GitHub

1. 访问 https://github.com → 点击 **Sign up**
2. 填写用户名、邮箱、密码，完成邮箱验证
3. 记下注册时使用的**邮箱地址**（后续配置 `ALLOWED_EMAILS` 时需要用到）

### 2.2 注册 Vercel

1. 访问 https://vercel.com → 点击 **Sign Up**
2. 选择 **Continue with GitHub**（推荐，可直接关联仓库）
3. 授权 Vercel 访问 GitHub 账号
4. 选择 **Hobby** 计划（免费）

### 2.3 注册 Neon（PostgreSQL 数据库）

1. 访问 https://neon.tech → 点击 **Sign Up**
2. 选择 **Continue with GitHub** 快速注册
3. 注册完成后进入控制台，暂不需要做其他操作

---

## 三、初始化本地项目

### 3.1 解压项目文件

将下载的项目压缩包解压到你希望存放代码的目录，例如：

```
Windows: C:\Users\你的用户名\Projects\riven-blog\
Mac/Linux: ~/Projects/riven-blog/
```

### 3.2 在终端中打开项目目录

**Windows**：在项目文件夹中右键 → "在终端中打开" 或 "Open Git Bash here"

**Mac/Linux**：
```bash
cd ~/Projects/riven-blog
```

### 3.3 安装项目依赖

```bash
npm install
```

> ⏱ 首次安装约需 2～5 分钟，请耐心等待。安装完成后会出现 `node_modules` 文件夹。

### 3.4 创建本地环境变量文件

```bash
# 复制模板文件
cp .env.example .env.local
```

用代码编辑器打开 `.env.local` 文件，接下来我们逐步填写其中的值。

---

## 四、配置数据库（Neon）

### 4.1 创建 Neon 数据库项目

1. 登录 https://console.neon.tech
2. 点击 **New Project**
3. 填写配置：
   - **Project name**：`riven-blog`（随意命名）
   - **Database name**：`neondb`（默认即可）
   - **Region**：选择 `US East (N. Virginia)` 或距你最近的区域
   - **Postgres version**：选最新版（如 16）
4. 点击 **Create project**

### 4.2 获取数据库连接字符串

1. 项目创建完成后，在 **Dashboard** 页面找到 **Connection string**
2. 点击右侧的复制按钮，复制类似以下格式的字符串：
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. 将该字符串粘贴到 `.env.local` 中：
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

> ⚠️ **重要**：连接字符串包含密码，请勿提交到 Git 仓库（`.env.local` 已在 `.gitignore` 中排除）

### 4.3 执行数据库迁移（创建表结构）

在项目目录中运行：

```bash
# 生成 Prisma Client
npx prisma generate

# 推送表结构到数据库（首次使用）
npx prisma db push
```

成功后会输出类似：
```
✓ Generated Prisma Client
✓ Your database is now in sync with your Prisma schema.
```

### 4.4 验证数据库连接

```bash
npx prisma studio
```

浏览器会自动打开 http://localhost:5555，可以看到数据库表结构，说明连接成功。

按 `Ctrl+C` 关闭 Prisma Studio。

---

## 五、配置 GitHub OAuth

### 5.1 创建 GitHub OAuth App

1. 登录 GitHub，点击右上角头像 → **Settings**
2. 左侧菜单最底部 → **Developer settings**
3. 左侧 → **OAuth Apps** → **New OAuth App**
4. 填写以下信息：

   | 字段 | 本地开发值 | 说明 |
   |------|-----------|------|
   | Application name | Riven Blog | 随意填写 |
   | Homepage URL | `http://localhost:3000` | 本地开发地址 |
   | Authorization callback URL | `http://localhost:3000/api/auth/callback/github` | 固定格式 |

5. 点击 **Register application**

### 5.2 获取 Client ID 和 Client Secret

1. 注册成功后，页面会显示 **Client ID**，直接复制
2. 点击 **Generate a new client secret** 生成密钥，**立即复制**（只显示一次！）

### 5.3 填写环境变量

将获取的值填入 `.env.local`：

```env
GITHUB_CLIENT_ID="你的_Client_ID"
GITHUB_CLIENT_SECRET="你的_Client_Secret"
```

### 5.4 生成 NextAuth Secret

在终端运行（需要 OpenSSL）：

```bash
# Mac/Linux
openssl rand -base64 32

# Windows（使用 PowerShell）
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

或者使用在线生成器：https://generate-secret.vercel.app/32

将生成的随机字符串填入：
```env
NEXTAUTH_SECRET="生成的随机字符串"
NEXTAUTH_URL="http://localhost:3000"
```

### 5.5 设置允许登录的邮箱

```env
ALLOWED_EMAILS="你注册GitHub时使用的邮箱"
```

多个邮箱用英文逗号分隔：`email1@example.com,email2@example.com`

---

## 六、本地开发测试

### 6.1 启动开发服务器

```bash
npm run dev
```

成功后会显示：
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

### 6.2 测试基本功能

打开浏览器访问 http://localhost:3000

**测试列表**：
- [ ] 首页正常显示（空文章列表）
- [ ] 点击导航栏"关于"，跳转到关于页面
- [ ] 点击"登录"，跳转到登录页面
- [ ] 点击"使用 GitHub 登录"，完成 OAuth 授权
- [ ] 登录成功后，导航栏出现"管理"选项
- [ ] 进入管理后台 http://localhost:3000/admin
- [ ] 创建一篇测试文章并发布
- [ ] 回到首页，确认文章出现

### 6.3 完整 `.env.local` 示例

> ⚠️ **重要**：不要提交真实凭证到 GitHub！使用 `.env.local` 并确保它在 `.gitignore` 中。

```env
# 数据库
DATABASE_URL="postgresql://user:pwd@pg.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"  # 生成：openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# 允许的邮箱
ALLOWED_EMAILS="your-github-email@example.com"

# Vercel Blob（本地开发可暂时留空，上传图片功能将不可用）
BLOB_READ_WRITE_TOKEN=""
```

---

## 七、部署到 Vercel

### 7.1 创建 GitHub 仓库

1. 登录 GitHub → 点击右上角 **+** → **New repository**
2. 填写仓库名称（如 `riven-blog`），选择 **Private**（私有，保护代码和 .env 等敏感文件）
3. **不要**勾选 Initialize repository
4. 点击 **Create repository**

### 7.2 推送代码到 GitHub

在本地项目终端中执行：

```bash
git init
git add .
git commit -m "🚀 Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/riven-blog.git
git push -u origin main
```

> 首次推送会弹出 GitHub 登录窗口，按提示完成身份验证。

### 7.3 在 Vercel 导入项目

1. 登录 https://vercel.com
2. 点击 **Add New...** → **Project**
3. 在 **Import Git Repository** 中找到你的 `riven-blog` 仓库，点击 **Import**
4. 配置页面保持默认（Framework Preset 会自动识别为 Next.js）
5. **暂时不要点击 Deploy**，先配置环境变量

### 7.4 配置 Vercel 环境变量

在部署配置页，展开 **Environment Variables** 部分，逐一添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 从 Neon 复制的连接字符串 | 数据库连接 |
| `NEXTAUTH_SECRET` | 之前生成的随机字符串 | 加密 Session |
| `NEXTAUTH_URL` | `https://你的项目名.vercel.app` | ⚠️ 改为生产地址 |
| `GITHUB_CLIENT_ID` | GitHub OAuth App 的 Client ID | GitHub 登录 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App 的 Client Secret | GitHub 登录 |
| `ALLOWED_EMAILS` | 你的邮箱 | 访问控制 |

> ⚠️ **`NEXTAUTH_URL` 必须改为生产域名**，不能是 localhost！
> 格式：`https://riven-blog-xxx.vercel.app`（Vercel 会在部署后提供这个地址）
> 如果不确定域名，可以先填写 `https://` 前缀 + 项目名，部署后再确认修改。

### 7.5 触发首次部署

点击 **Deploy** 按钮，等待约 2～3 分钟完成构建。

**部署过程中会自动执行**（已在 `package.json` 的 `vercel-build` 脚本中配置）：
```bash
prisma generate && prisma migrate deploy && next build
```

构建成功后会显示绿色 ✅，并提供访问链接。

### 7.6 更新 GitHub OAuth 回调地址

部署成功后，你会获得一个类似 `https://riven-blog-abc123.vercel.app` 的地址。

返回 GitHub，更新 OAuth App 的配置：

1. GitHub → Settings → Developer settings → OAuth Apps → 选择你的 App
2. 修改 **Homepage URL** 为：`https://riven-blog-abc123.vercel.app`
3. 修改 **Authorization callback URL** 为：`https://riven-blog-abc123.vercel.app/api/auth/callback/github`
4. 点击 **Update application** 保存

### 7.7 验证生产环境登录

访问你的 Vercel 域名，测试 GitHub 登录是否正常。

---

## 八、配置 Vercel Blob 存储

Vercel Blob 用于存储文章图片和封面图。

### 8.1 在 Vercel 创建 Blob Store

1. 进入你的 Vercel 项目 Dashboard
2. 点击顶部 **Storage** 标签
3. 点击 **Create Database** → 选择 **Blob**
4. 填写名称（如 `riven-blog-images`），点击 **Create**
5. 创建成功后，点击 **Connect to Project**，选择你的项目，点击 **Connect**

### 8.2 获取 Blob Token

1. 进入 Blob Store 设置页面
2. 找到 **BLOB_READ_WRITE_TOKEN**，点击复制

### 8.3 添加环境变量

1. 进入 Vercel 项目 → **Settings** → **Environment Variables**
2. 添加变量：
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: 刚才复制的 token
3. 点击 **Save**

### 8.4 重新部署

添加环境变量后需要重新部署才能生效：

1. 进入 **Deployments** 标签
2. 找到最新的部署，点击右侧 **...** → **Redeploy**

### 8.5 本地开发使用 Blob

如需在本地测试图片上传，在 `.env.local` 中也添加 `BLOB_READ_WRITE_TOKEN`。

---

## 九、绑定自定义域名（可选）

### 9.1 购买域名

推荐国内域名注册商：
- **阿里云万网**：https://wanwang.aliyun.com（`.cn` 首年约 ¥5，`.com` 约 ¥68）
- **腾讯云**：https://dnspod.cloud.tencent.com（价格相近）
- **Namesilo**（国际）：便宜的 `.com` 约 $9/年

> 💡 推荐购买 `.com` 或 `.cn` 域名，比较正式。个人博客用 `.top`、`.xyz` 也可以，首年约 ¥5～¥10。

### 9.2 在 Vercel 添加域名

1. Vercel 项目 → **Settings** → **Domains**
2. 输入你的域名（如 `blog.example.com`），点击 **Add**
3. Vercel 会显示需要在域名服务商添加的 DNS 记录

### 9.3 配置 DNS

登录你的域名服务商控制台，添加 Vercel 要求的 DNS 记录：

**方案 A（使用子域名，如 `blog.example.com`）**：
| 类型 | 名称 | 值 |
|------|------|----|
| CNAME | blog | `cname.vercel-dns.com` |

**方案 B（使用根域名，如 `example.com`）**：
| 类型 | 名称 | 值 |
|------|------|----|
| A | @ | `76.76.21.21` |

DNS 生效通常需要 5 分钟～24 小时，Vercel 会自动颁发 SSL 证书。

### 9.4 更新环境变量

域名生效后，更新以下设置：
1. Vercel 环境变量中的 `NEXTAUTH_URL` 改为新域名
2. GitHub OAuth App 的 Homepage URL 和 callback URL 也改为新域名
3. 重新部署 Vercel 项目

---

## 十、上线后验证清单

完成部署后，逐项检查以下功能：

### 基础功能
- [ ] 首页正常加载，没有报错
- [ ] 文章列表显示正常
- [ ] 点击文章进入详情页正常
- [ ] 关于页面正常
- [ ] 404 页面正常（访问一个不存在的 URL）

### 认证功能
- [ ] 点击"登录"跳转到 GitHub 授权页面
- [ ] GitHub 授权后成功跳转回网站
- [ ] 导航栏显示用户头像和"管理"入口
- [ ] 未登录时无法访问 `/admin` 路径（自动跳转登录）
- [ ] 点击退出登录成功

### 内容管理
- [ ] 能成功创建新文章
- [ ] Markdown 编辑器预览功能正常
- [ ] 发布文章后首页能看到
- [ ] 编辑文章保存成功
- [ ] 文章下线/上线功能正常
- [ ] 删除文章功能正常（有确认弹窗）

### 图片上传
- [ ] 上传封面图片正常（图片存储到 Vercel Blob）
- [ ] 文章内容中插入图片正常
- [ ] 图片在文章详情页正常显示

### SEO
- [ ] 访问 `https://你的域名/sitemap.xml` 能看到 sitemap
- [ ] 访问 `https://你的域名/robots.txt` 能看到 robots 规则

---

## 十一、日常运维

### 发布新文章

1. 浏览器访问 `https://你的域名/admin`
2. 点击"新建文章"
3. 填写标题（URL slug 会自动生成）、标签、摘要
4. 用 Markdown 编写内容
5. 点击"预览"确认排版
6. 点击"发布文章"（或"保存草稿"稍后发布）

### 修改代码后重新部署

```bash
# 修改代码后
git add .
git commit -m "描述你的改动"
git push origin main
# Vercel 会自动检测到 push 并重新部署，无需手动操作
```

### 数据库备份

Neon 免费版提供 **7 天自动备份**。如需手动备份：

1. 安装 PostgreSQL 工具（或使用 Neon 提供的下载功能）
2. 在 Neon Console → Branches → 点击 **...** → **Restore** 可恢复历史版本

### 查看错误日志

1. 登录 Vercel Dashboard
2. 进入项目 → **Functions** 标签
3. 点击具体的函数可查看调用日志和错误信息

### 监控使用量

定期检查以下指标是否接近免费限额：
- Vercel Dashboard → **Usage**：带宽（100GB/月）和函数执行时间（1000小时/月）
- Neon Console：数据库存储（0.5GB）和带宽（20GB/月）
- Vercel Storage → Blob：存储（1GB）和带宽（5GB/月）

---

## 十二、常见问题排查

### ❌ 登录后报错 "Access Denied"

**原因**：登录的 GitHub 账号邮箱不在 `ALLOWED_EMAILS` 列表中。

**解决**：
1. 检查你的 GitHub 账号邮箱（GitHub → Settings → Emails）
2. 确认 `ALLOWED_EMAILS` 中填写的是**主邮箱**
3. 更新 Vercel 环境变量后重新部署

---

### ❌ 部署时报错 "Environment variable not found: DATABASE_URL"

**原因**：Vercel 环境变量未正确配置。

**解决**：
1. Vercel 项目 → Settings → Environment Variables
2. 确认 `DATABASE_URL` 存在且值正确
3. 确认该变量适用的环境（Production/Preview/Development）都已勾选

---

### ❌ 图片上传报错 "Unauthorized"

**原因**：`BLOB_READ_WRITE_TOKEN` 未配置或已过期。

**解决**：
1. 重新从 Vercel Storage → Blob 获取 token
2. 更新环境变量后重新部署

---

### ❌ 本地运行报错 "Can't reach database server"

**原因**：Neon 连接字符串有误或网络问题。

**解决**：
1. 检查 `.env.local` 中 `DATABASE_URL` 格式是否正确（以 `postgresql://` 开头）
2. 确认 Neon 项目没有被暂停（免费版长时间不使用会暂停，进入控制台恢复即可）
3. 尝试在 Neon Console 重新获取连接字符串

---

### ❌ GitHub OAuth 回调报错 404 或 redirect_uri_mismatch

**原因**：GitHub OAuth App 中的回调 URL 与实际环境不匹配。

**解决**：
1. 确认 `NEXTAUTH_URL` 环境变量中的域名与实际访问域名一致
2. 确认 GitHub OAuth App 中的 Authorization callback URL 格式：
   - 本地：`http://localhost:3000/api/auth/callback/github`
   - 生产：`https://你的域名/api/auth/callback/github`

> 💡 **同时维护本地和生产**：你可以创建两个 GitHub OAuth App，一个用于本地开发，一个用于生产环境，分别使用不同的 Client ID/Secret。

---

### ❌ 文章详情页访问 404

**原因**：文章 slug 有特殊字符，或文章未发布。

**解决**：
1. 确认文章已发布（published = true）
2. 检查文章 slug 中是否有空格（应使用连字符 `-`）
3. 尝试触发 revalidation：在管理后台重新保存文章

---

### ❌ 部署后 `NEXTAUTH_URL` 忘记更新

**症状**：登录后一直跳转回 localhost 或报 NEXTAUTH_URL 相关错误。

**解决**：
1. Vercel 环境变量 → 修改 `NEXTAUTH_URL` 为生产域名
2. Redeploy 项目

---

## 附录：环境变量速查表

| 变量名 | 在哪里获取 | 示例值 |
|--------|-----------|--------|
| `DATABASE_URL` | Neon Console → Connection string | `postgresql://user:pwd@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | 自己生成（32位随机字符串） | `xK9mP2...` |
| `NEXTAUTH_URL` | 你的网站地址 | `https://riven-blog.vercel.app` |
| `GITHUB_CLIENT_ID` | GitHub → Developer settings → OAuth Apps | `Ov23liABCDEFGHIJKLMN` |
| `GITHUB_CLIENT_SECRET` | 同上（需要 Generate） | `abc123def456...` |
| `ALLOWED_EMAILS` | 你的 GitHub 主邮箱 | `you@gmail.com` |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob | `vercel_blob_rw_...` |

---

*如遇到本文档未覆盖的问题，可参考：*
- *Next.js 文档：https://nextjs.org/docs*
- *NextAuth.js 文档：https://next-auth.js.org*
- *Prisma 文档：https://www.prisma.io/docs*
- *Neon 文档：https://neon.tech/docs*
- *Vercel 文档：https://vercel.com/docs*
