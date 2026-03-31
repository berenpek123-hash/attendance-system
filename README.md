# 员工打卡系统

30员工、2店铺的员工上下班打卡记录系统。

## 快速开始

### 前置要求
- Node.js 16+
- MySQL 5.7+

### 后端部署

```bash
cd backend
npm install
```

修改 `config.js` 中的数据库配置（用户名、密码、数据库名）

初始化数据库：
```bash
mysql -u root -p < db/init.sql
```

启动服务器：
```bash
npm start
```

默认运行在 http://localhost:3000

### 前端部署

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

## 使用流程

### 1. 初始化员工
1. 登陆后台（暂时无认证，直接进入）
2. 进入"员工管理"，添加30个员工信息
3. 为每位员工生成二维码（系统自动生成，包含员工ID）

### 2. 员工打卡
1. 员工打开打卡页面
2. 扫描自己的二维码
3. 系统自动判断是上班还是下班（当天有无打卡记录）

### 3. 查看统计
- **日报** — 查看当日所有员工的出勤情况
- **月报** — 查看月度统计、出勤率、迟到早退统计
- **店铺比对** — 按店铺分别查看

## 数据库结构

### shops
店铺表

### employees
员工表，关联店铺

### attendance_records
打卡记录表，记录每次打卡时间、类型（上班/下班）、迟到标记

## API 文档

### POST /api/attendance/checkin
扫码打卡

```json
{
  "employeeId": 1
}
```

返回：
```json
{
  "success": true,
  "type": "check_in",
  "employeeName": "张三",
  "time": "2026-03-31 10:35:00",
  "isLate": false
}
```

### GET /api/reports/daily?date=2026-03-31&shopId=1
获取日报

### GET /api/reports/monthly?month=2026-03&shopId=1
获取月报

## 二维码生成

员工二维码包含员工ID，格式：
```
ATTENDANCE_<EMPLOYEE_ID>
```

前端会自动解析并提交打卡。

## 扩展功能（后期可加）

- 人脸识别打卡
- 地点验证（GPS）
- 请假管理
- 薪资计算集成
- 微信小程序适配
