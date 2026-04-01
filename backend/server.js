const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const attendanceRoutes = require('./routes/attendance');
const employeeRoutes = require('./routes/employees');
const reportsRoutes = require('./routes/reports');
const shopsRoutes = require('./routes/shops');
const authRoutes = require('./routes/auth');

const app = express();

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/shops', shopsRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: '服务器错误',
    message: err.message 
  });
});

// 启动服务器
const PORT = config.server.port;
app.listen(PORT, config.server.host, () => {
  console.log(`✓ 服务器运行在 http://localhost:${PORT}`);
});
