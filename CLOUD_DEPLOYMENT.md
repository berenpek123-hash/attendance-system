# 员工打卡系统 - 云部署指南

## 云平台选择

### 推荐方案（按成本排序）

| 平台 | 成本 | 特点 | 推荐度 |
|------|------|------|--------|
| **Railway** | $5-20/月 | 最简单，自动部署，新手友好 | ⭐⭐⭐⭐⭐ |
| **Render** | 免费-$15/月 | 有免费计划，但会睡眠 | ⭐⭐⭐⭐ |
| **Heroku** | $7-50/月 | 曾经最流行，现在贵了 | ⭐⭐⭐ |
| **阿里云/腾讯云** | ¥40+/月 | 国内快速，复杂配置 | ⭐⭐⭐ (国内用户) |
| **AWS/Google Cloud** | $10+/月 | 功能全，学习曲线陡 | ⭐⭐⭐ (企业级) |

---

## 最快启动方案：Railway

### 步骤 1：准备工作

1. 注册 Railway 账户
   - 网址：https://railway.app
   - 用 GitHub/Google 账号登录最快

2. 连接 GitHub
   - Railway 需要访问你的代码仓库
   - 先把代码推到 GitHub

### 步骤 2：上传代码到 GitHub

```bash
# 初始化 Git（如果还没有）
cd /Users/mac/.openclaw/workspace/attendance-system
git init
git add .
git commit -m "初始提交：员工打卡系统"

# 添加远程仓库（用你自己的 GitHub URL）
git remote add origin https://github.com/你的用户名/attendance-system.git
git branch -M main
git push -u origin main
```

### 步骤 3：在 Railway 上部署

1. 打开 Railway：https://railway.app/dashboard
2. 点击 "New Project" → "Deploy from GitHub"
3. 选择你的 `attendance-system` 仓库
4. Railway 会自动检测，按照提示完成

### 步骤 4：配置环境变量

在 Railway 的项目设置中，添加：

```
NODE_ENV=production
PORT=3000
```

---

## 阿里云 / 腾讯云（国内用户）

### 推荐：轻量服务器（按时计费，5元/天）

1. 买服务器（Ubuntu 20.04）
2. SSH 连接进去
3. 运行部署脚本

### 部署脚本

```bash
#!/bin/bash
# 登录服务器后，运行此脚本

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 克隆代码
cd /opt
sudo git clone https://github.com/你的用户名/attendance-system.git
cd attendance-system

# 安装依赖
cd backend && npm install
cd ../frontend && npm install && npm run build
cd ..

# 用 PM2 保持后台运行
sudo npm install -g pm2
pm2 start backend/server.js --name "attendance-backend"
pm2 startup
pm2 save

# 配置 Nginx 反向代理（可选，让前端通过 80 端口访问）
sudo apt install -y nginx
# 编辑 /etc/nginx/sites-available/default，配置代理...
```

---

## Docker 部署（所有平台通用）

### Dockerfile 后端

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .

EXPOSE 3000
CMD ["node", "server.js"]
```

### Dockerfile 前端

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    volumes:
      - ./attendance.db:/app/attendance.db
    restart: always

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

---

## 最终成本估算

| 方案 | 月成本 | 优缺点 |
|------|--------|--------|
| Railway | $5-20 | ✅ 最简单，自动扩展 ❌ 较贵 |
| Render | 免费 | ✅ 免费 ❌ 会睡眠，冷启动慢 |
| 阿里云轻量 | ¥150 | ✅ 便宜，快速 ❌ 要自己维护 |
| 家里电脑 | ¥0 | ✅ 免费 ❌ 停电/断网会掉线 |

---

## 我们的建议

**新手 + 不想麻烦** → **Railway**（5分钟搞定）

**国内用户 + 追求便宜** → **阿里云轻量**（稍复杂，但性价比最高）

**不想花钱** → **Render 免费计划**（有睡眠时间，但可以用）

---

## 下一步

告诉我你选哪个方案，我帮你：
1. 生成必要的配置文件（Dockerfile、nginx.conf 等）
2. 给出详细的部署步骤
3. 可以直接帮你推送到 GitHub 并启动云部署

哪个方案你倾向于选？
