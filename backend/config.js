// 数据库配置
module.exports = {
  database: {
    host: 'localhost',
    user: 'root',
    password: '', // 改为你的MySQL密码
    database: 'attendance_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  // 工作时间配置
  workHours: {
    checkInTime: '10:30',  // 上班时间
    checkOutTime: '22:30'  // 下班时间
  },
  // 迟到判定时间（分钟）
  lateThreshold: 0  // 10:30之后打卡算迟到
};
