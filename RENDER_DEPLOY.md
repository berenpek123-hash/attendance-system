# Render 云部署指南（免费方案）

## ⏱️ 预计时间：15分钟

## 📋 前置条件

1. **GitHub 账户**（免费注册）
   - 网址：https://github.com/signup

2. **Render 账户**（免费）
   - 网址：https://render.com
   - 用 GitHub 账号登录最快

---

## 🚀 部署步骤

### 步骤 1：创建 GitHub 仓库

1. 打开 GitHub：https://github.com/new
2. 填写仓库名：`attendance-system`
3. 选择 "Public"（公开）
4. 点击 "Create repository"

### 步骤 2：推送代码

代码已经在本地 Git 中了，现在推送到 GitHub：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
cd /Users/mac/.openclaw/workspace/attendance-system

git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git
git branch -M main
git push -u origin main
```

**或者更简单的方法：**
1. 在 GitHub 页面里，点击 "…or push an existing repository from the command line"
2. 复制命令，粘贴到终端运行

### 步骤 3：部署到 Render

1. 打开 Render 仪表盘：https://dashboard.render.com

2. 点击 "New+" → "Web Service"

3. 选择 "Deploy an existing repository" 或 "Connect GitHub account"

4. 找到 `attendance-system` 仓库，点击 "Connect"

5. 填写配置：
   - **Name**: `attendance-system-backend`
   - **Environment**: `Node`
   - **Region**: `Singapore` (离亚洲最近)
   - **Build Command**: 
     ```
     cd backend && npm install
     ```
   - **Start Command**: 
     ```
     cd backend && node server.js
     ```
   - **Branch**: `main`

6. 点击 "Create Web Service"

7. **等待部署**（约3-5分钟）

8. 看到 "Your service is live" 就成功了！✅

9. 记下 URL，例如：
   ```
   https://attendance-system-backend.onrender.com
   ```

### 步骤 4：修改前端 API 地址

前端现在需要指向你的后端 URL。修改前端代码：

打开 `frontend/src/api.js`，修改为：

```javascript
const API_BASE = 'https://attendance-system-backend.onrender.com/api'
```

然后提交：

```bash
cd /Users/mac/.openclaw/workspace/attendance-system
git add frontend/src/api.js
git commit -m "配置前端 API 指向 Render 后端"
git push origin main
```

### 步骤 5：部署前端（静态网站）

1. Render 仪表盘，点击 "New+" → "Static Site"

2. 选择连接你的 GitHub 仓库

3. 填写配置：
   - **Name**: `attendance-system-frontend`
   - **Branch**: `main`
   - **Build Command**: 
     ```
     cd frontend && npm install && npm run build
     ```
   - **Publish directory**: 
     ```
     frontend/dist
     ```

4. 点击 "Create Static Site"

5. **等待部署**（约2-3分钟）

6. 部署完成后，你会获得一个 URL，例如：
   ```
   https://attendance-system-frontend.onrender.com
   ```

---

## ✅ 验证部署

访问前端 URL：
```
https://attendance-system-frontend.onrender.com
```

应该能看到打卡系统的界面，并且可以正常打卡！

---

## ⚠️ 注意事项

### 1️⃣ 睡眠问题
- Render 免费计划：**15分钟无访问就会睡眠**
- 再访问时需要等 **5-10 秒启动**
- 解决方案：每 10 分钟访问一次（或升级到付费）

### 2️⃣ 数据库
- 现在用的是 SQLite（存储在应用内存中）
- 重启后数据会丢失
- 如果要永久保存数据，需要连接云数据库（如 MongoDB Atlas）

### 3️⃣ 免费额度限制
- 每月 750 小时运行时间
- 一个月就是 30 天 × 24 小时 = 720 小时
- 一个后端服务基本用不完

---

## 🔄 更新部署

修改代码后，只需 push 到 GitHub：

```bash
git add .
git commit -m "修改内容"
git push origin main
```

Render 会自动检测更新，重新部署（约1-3分钟）。

---

## 升级方案（如需永久数据存储）

如果需要数据不丢失，可以连接免费的 MongoDB：

1. 注册 MongoDB Atlas：https://www.mongodb.com/cloud/atlas
2. 创建免费数据库
3. 修改后端 db.js，改用 MongoDB（而不是 SQLite）

---

## 🆘 遇到问题？

- **部署失败**：检查 Render 的 Build Log
- **前端访问很慢**：正常，Render 免费计划会睡眠
- **数据丢失**：重启后数据会清空（升级后端或用云数据库）

---

## 总结

| 步骤 | 时间 | 成本 |
|------|------|------|
| GitHub 注册 | 5分钟 | 免费 |
| 推送代码 | 2分钟 | 免费 |
| Render 部署 | 5分钟 | 免费 |
| **总计** | **15分钟** | **完全免费** |

🎉 **完成！你的打卡系统已上线！**

---

## 获取你的链接

部署完成后，你会有：
- 前端：`https://attendance-system-frontend.onrender.com`
- 后端：`https://attendance-system-backend.onrender.com`

分享给同事，他们可以直接访问，无需任何安装！
