# 快速启动指南

## 第一步：数据库初始化

### 1. 确保安装了 MySQL
如果没有，请按照你的系统安装：
- **macOS**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`
- **Windows**: 下载 MySQL Community Server

### 2. 启动 MySQL 服务
```bash
# macOS
mysql.server start

# Linux
sudo systemctl start mysql

# Windows
# 在服务中启动 MySQL
```

### 3. 创建数据库
```bash
mysql -u root -p < db/init.sql
```

当提示输入密码时，输入你的 MySQL root 密码（如果没设密码就直接按Enter）。

## 第二步：启动后端

```bash
cd backend
npm install
npm start
```

你应该看到：
```
✓ 数据库连接成功
✓ 服务器运行在 http://localhost:3000
```

## 第三步：启动前端

打开新的终端窗口：
```bash
cd frontend
npm install
npm run dev
```

你应该看到：
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

## 访问系统

打开浏览器，访问 http://localhost:5173

## 初始数据

系统已经内置了：
- **2个店铺**：南京店、北京店
- **30个员工**：15人在南京店，15人在北京店

## 常见问题

### 数据库连接失败
1. 确保 MySQL 正在运行
2. 检查 `backend/config.js` 中的数据库配置
3. 确保 MySQL 中已创建 `attendance_system` 数据库

```bash
# 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES;"
```

### 端口被占用
如果 3000 或 5173 被占用，可以修改：
- **后端端口**：修改 `backend/config.js` 中的 `port`
- **前端端口**：修改 `frontend/vite.config.js` 中的 `port`

### 前端无法访问后端
确保 `frontend/src/api.js` 中的 API 地址与后端运行地址一致（默认 `http://localhost:3000`）。

## 部署到生产

### 构建前端
```bash
cd frontend
npm run build
```

生成的 `dist` 文件夹可以部署到任何静态服务器（Nginx、Apache 等）。

### 后端部署
1. 安装 PM2（推荐用于生产）
```bash
npm install -g pm2
```

2. 启动应用
```bash
cd backend
pm2 start server.js --name "attendance-system"
```

3. 配置反向代理（Nginx 示例）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 系统核心特性

✓ 员工扫码打卡  
✓ 自动判断迟到/早退  
✓ 日报和月报统计  
✓ 员工管理（添加、删除、生成二维码）  
✓ 店铺独立管理  
✓ 摄像头二维码扫描  

## API 接口汇总

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/attendance/checkin` | 打卡 |
| GET | `/api/attendance/status/:id` | 获取打卡状态 |
| GET | `/api/employees` | 获取员工列表 |
| POST | `/api/employees` | 添加员工 |
| GET | `/api/reports/daily` | 日报 |
| GET | `/api/reports/monthly` | 月报 |
| GET | `/api/shops` | 获取店铺 |

## 工作时间设置

编辑 `backend/config.js`：
```javascript
workHours: {
  checkInTime: '10:30',   // 上班时间
  checkOutTime: '22:30'   // 下班时间
}
```

当前设置为 10:30-22:30，超过 10:30 上班会被标记为迟到。
