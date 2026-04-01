# 登陆和密码管理功能说明

## ✅ 已实现

### 用户认证
- **登陆页面** - 输入用户名和密码登陆
- **JWT Token** - 登陆成功返回 30 天有效期的 token
- **路由守卫** - 未登陆用户自动重定向到登陆页
- **Token 过期** - 自动清除过期 token 并重定向登陆

### 密码管理
- **修改密码** - 输入旧密码和新密码（至少 6 位）
- **账户信息** - 查看用户名和角色
- **退出登陆** - 清除 token，返回登陆页

### 默认账户
- **用户名**: `admin`
- **密码**: `123456`

---

## 使用流程

### 第一次访问
1. 访问 http://localhost:5173
2. 自动重定向到登陆页（/login）
3. 输入用户名 `admin` 和密码 `123456`
4. 点击"登陆"，进入系统首页

### 修改密码
1. 点击菜单中的"⚙️ 设置"
2. 输入旧密码、新密码、确认新密码
3. 点击"修改密码"
4. 修改成功后自动退出，需要用新密码重新登陆

### 退出登陆
1. 点击菜单中的"🚪 退出"
2. 返回登陆页面

---

## 技术实现

### 后端 API

#### POST /api/auth/login
登陆接口，返回 JWT token
```json
请求:
{
  "username": "admin",
  "password": "123456"
}

响应:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### POST /api/auth/change-password
修改密码（需要 Authorization header）
```json
请求头:
Authorization: Bearer <token>

请求体:
{
  "oldPassword": "123456",
  "newPassword": "newpassword123"
}

响应:
{
  "success": true,
  "message": "密码已修改"
}
```

#### GET /api/auth/me
获取当前用户信息
```json
请求头:
Authorization: Bearer <token>

响应:
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 前端实现

**路由守卫** (`router.js`)
- 检查 localStorage 中的 token
- 需要认证的路由（requiresAuth: true）在未登陆时重定向到 /login
- 已登陆用户访问 /login 自动重定向到首页

**API 拦截** (`api.js`)
- 所有请求自动添加 Authorization header
- 401 响应自动清除 token 并重定向登陆页

---

## 安全考虑

### 当前实现
- ✅ 密码存储在数据库（生产环境应使用 bcrypt）
- ✅ JWT token 加密签名
- ✅ Token 有 30 天过期时间
- ✅ 密码至少 6 位
- ✅ 所有 API 检查 Authorization header

### 建议改进（生产环境）
- [ ] 使用 bcrypt 或 argon2 加密密码
- [ ] 实现刷新 token 机制（短期 access token + 长期 refresh token）
- [ ] 添加登陆日志和异常检测
- [ ] 实现 2FA 双因素认证
- [ ] 添加用户管理后台（创建、删除、重置密码）
- [ ] 添加登陆失败次数限制和账户锁定

---

## 初始化

### 首次启动
1. 删除旧的 `attendance.db` 文件
2. 启动后端：`node server.js`
3. 自动创建 users 表和默认用户（admin/123456）

### 添加新用户（手动）
```sql
INSERT INTO users (username, password, role) VALUES ('username', 'password', 'admin');
```

---

## 常见问题

**Q: 忘记密码怎么办？**  
A: 现在没有找回密码功能，需要直接修改数据库：
```sql
UPDATE users SET password = '123456' WHERE username = 'admin';
```

**Q: 怎么添加新的管理员账户？**  
A: 直接在 users 表插入新记录或通过后台添加（建议开发新功能）

**Q: Token 过期了怎么办？**  
A: 自动清除本地 token，重新登陆即可

---

## 文件清单

- `backend/routes/auth.js` - 认证 API 路由
- `frontend/src/pages/Login.vue` - 登陆页面
- `frontend/src/pages/Settings.vue` - 系统设置页面
- `frontend/src/router.js` - 路由守卫配置
- `frontend/src/api.js` - API 拦截器
- `backend/db.js` - users 表初始化

---

**最后更新**: 2026-04-01
