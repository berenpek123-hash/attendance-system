# 系统架构

## 整体架构

```
┌─────────────────────────────┐
│    前端 (Vue 3 + Vite)      │  http://localhost:5173
│  - 打卡页面（扫码/摄像头）  │
│  - 日报、月报               │
│  - 员工管理                 │
└────────────┬────────────────┘
             │ HTTP/AXIOS
             ↓
┌─────────────────────────────┐
│  后端 (Node.js + Express)   │  http://localhost:3000
│  - 打卡逻辑                 │
│  - 统计计算                 │
│  - 员工管理                 │
└────────────┬────────────────┘
             │ SQL
             ↓
┌─────────────────────────────┐
│    MySQL 数据库             │
│  - shops（店铺）             │
│  - employees（员工）         │
│  - attendance_records（打卡）│
└─────────────────────────────┘
```

## 数据库设计

### shops 表
```sql
- id (PK)
- name (店铺名称)
- location (位置)
- created_at (创建时间)
```

### employees 表
```sql
- id (PK)
- name (员工姓名)
- employee_number (员工号，唯一)
- shop_id (FK -> shops)
- phone (手机号)
- status (active/inactive)
- created_at (创建时间)
```

### attendance_records 表
```sql
- id (PK)
- employee_id (FK -> employees)
- attendance_date (打卡日期)
- check_in_time (上班时间)
- check_out_time (下班时间)
- is_late (是否迟到)
- is_early_leave (是否早退)
- notes (备注)
- created_at / updated_at
```

关键设计：
- `UNIQUE(employee_id, attendance_date)` — 保证每个员工每天只有一条记录
- 索引优化查询性能

## 前端架构

### 目录结构
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.vue         (仪表盘)
│   │   ├── Checkin.vue            (打卡)
│   │   ├── DailyReport.vue        (日报)
│   │   ├── MonthlyReport.vue      (月报)
│   │   └── EmployeeManagement.vue (员工管理)
│   ├── App.vue                    (根组件)
│   ├── api.js                     (API 封装)
│   ├── router.js                  (路由)
│   └── main.js                    (入口)
├── index.html
├── package.json
└── vite.config.js
```

### 关键页面功能

**打卡页面 (Checkin.vue)**
- 文本输入：输入员工号或 ID
- 摄像头扫码：使用 jsQR 库识别二维码
- 自动判断：第一次打卡 = 上班，第二次 = 下班
- 实时反馈：显示打卡结果和员工当日状态

**日报 (DailyReport.vue)**
- 按日期和店铺筛选
- 展示当日所有员工打卡情况
- 统计：总数、已打卡、缺卡
- 标记：迟到、早退、缺卡
- 缺卡员工名单

**月报 (MonthlyReport.vue)**
- 按月份和店铺筛选
- 员工个人统计：出勤天数、出勤率、迟到/早退次数
- 汇总统计：平均出勤率、总迟到次数等
- 颜色标记：根据出勤率显示优秀/良好/一般/差

**员工管理 (EmployeeManagement.vue)**
- 显示所有员工列表
- 搜索功能（按姓名或员工号）
- 添加新员工
- 生成二维码（使用 qrserver API）
- 设置离职状态

## 后端架构

### 目录结构
```
backend/
├── routes/
│   ├── attendance.js   (打卡相关)
│   ├── employees.js    (员工管理)
│   ├── reports.js      (报表统计)
│   └── shops.js        (店铺管理)
├── db.js              (数据库连接池)
├── config.js          (配置)
├── server.js          (应用入口)
└── package.json
```

### 关键 API 逻辑

**打卡逻辑 (POST /api/attendance/checkin)**
```
1. 验证员工 ID
2. 获取当天打卡记录
3. 如果无记录：
   - 插入新记录，check_in_time = 当前时间
   - 判断是否迟到（晚于 10:30）
   - 返回 "上班打卡"
4. 如果已有记录：
   - 更新 check_out_time = 当前时间
   - 判断是否早退（早于 22:30）
   - 返回 "下班打卡"
```

**迟到判定**
```
工作时间: 10:30-22:30
- 打卡时间 > 10:30 → 迟到 ✓
- 下班时间 < 22:30 → 早退 ✓
```

**月报统计 (GET /api/reports/monthly)**
```
1. 计算该月工作天数（排除周末）
2. 对每个员工统计：
   - 出勤天数 = 有 check_in_time 的天数
   - 出勤率 = 出勤天数 / 工作天数 × 100%
   - 迟到次数 = is_late = 1 的记录数
   - 早退次数 = is_early_leave = 1 的记录数
   - 缺勤天数 = 无打卡记录的工作天数
```

## 核心特性实现

### 1. 二维码扫码
- **前端**：使用 jsQR 库从视频流中识别二维码
- **格式**：`ATTENDANCE_<EMPLOYEE_ID>`
- **摄像头**：使用 `navigator.mediaDevices.getUserMedia()` 调用摄像头
- **备用**：支持手动输入员工号

### 2. 迟到/早退判定
- 根据打卡时间与工作时间对比
- 自动在数据库中标记，无需手动操作

### 3. 日/月报生成
- 日报：聚合单日数据，显示缺卡员工
- 月报：计算月度统计，显示出勤率排名

### 4. 员工管理
- 支持批量查看（按店铺）
- 生成员工专属二维码
- 设置离职状态（软删除）

## 性能考虑

1. **数据库索引**
   - 员工编号（唯一查询）
   - 打卡日期（报表查询）
   - 店铺 ID（分店查询）

2. **API 优化**
   - 前端请求缓存状态（避免频繁查询）
   - 月报批量计算（一次 SQL 查询）

3. **前端优化**
   - Vue 3 reactive 响应式更新
   - 路由懒加载（后续可加）

## 扩展方向

### 短期（已实现）
✓ 扫码打卡
✓ 日/月报统计
✓ 员工管理

### 中期（可添加）
- [ ] 人脸识别打卡
- [ ] 地点验证（GPS）
- [ ] 请假管理
- [ ] 薪资计算集成
- [ ] 权限管理（店长/管理员区分）

### 长期
- [ ] 微信小程序适配
- [ ] 移动 APP（React Native）
- [ ] 大数据分析仪表板
- [ ] 考勤异常告警

## 安全性

当前版本（MVP）特点：
- ✓ 无认证机制（内网使用）
- ✓ 员工 ID 作为唯一标识

生产版本建议：
- [ ] 添加用户认证（JWT）
- [ ] 权限控制（RBAC）
- [ ] API 速率限制
- [ ] 数据加密传输（HTTPS）
- [ ] 审计日志
