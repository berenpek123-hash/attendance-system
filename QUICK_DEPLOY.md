# 快速部署到 Render

点击下面的链接，Render 会自动启动部署：

## 部署后端

https://render.com/deploy?repo=https://github.com/berenpek123-hash/attendance-system

然后填写：
- **Service Name**: `attendance-system-backend`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && node server.js`
- 点 "Deploy"

## 部署前端

再次访问上面的链接，这次选择 "Static Site"：
- **Service Name**: `attendance-system-frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/dist`
- 点 "Deploy"

---

完成后，你会获得两个 URL：
- 前端：`https://attendance-system-frontend.onrender.com`
- 后端：`https://attendance-system-backend.onrender.com`

---

## 手动部署（如果一键部署失败）

1. 登录 Render：https://dashboard.render.com
2. 点 "New" → "Web Service"
3. 选择 "Connect a repository"
4. 找到 `attendance-system` 仓库
5. 按照上面的命令配置
