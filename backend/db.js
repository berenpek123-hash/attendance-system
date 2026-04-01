const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'attendance.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('✗ 数据库连接失败:', err.message);
    process.exit(1);
  }
});

// 启用外键约束
db.run('PRAGMA foreign_keys=ON');

// 初始化数据库
db.serialize(() => {
  // 创建店铺表
  db.run(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      address TEXT,
      check_in_time TEXT DEFAULT '09:00',
      check_out_time TEXT DEFAULT '18:00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建员工表
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      shop_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id)
    )
  `);

  // 创建打卡记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      attendance_date TEXT NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      is_late INTEGER DEFAULT 0,
      is_early_leave INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // 检查是否需要初始化示例数据
  db.get('SELECT COUNT(*) as count FROM shops', (err, row) => {
    if (err || (row && row.count > 0)) {
      console.log('✓ 数据库已初始化');
      return;
    }

    // 插入店铺
    db.run('INSERT INTO shops (name, address) VALUES (?, ?)', ['南京店', '南京市鼓楼区']);
    db.run('INSERT INTO shops (name, address) VALUES (?, ?)', ['北京店', '北京市朝阳区']);

    const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
                   '冯一', '陈二', '褚三', '卫四', '蒋五', '沈六', '韩七'];

    // 南京店 EMP001-EMP015
    for (let i = 1; i <= 15; i++) {
      db.run(
        'INSERT INTO employees (employee_number, name, phone, shop_id) VALUES (?, ?, ?, ?)',
        [`EMP${String(i).padStart(3, '0')}`, names[i - 1], `1380000${String(i).padStart(4, '0')}`, 1]
      );
    }

    // 北京店 EMP016-EMP030
    for (let i = 16; i <= 30; i++) {
      db.run(
        'INSERT INTO employees (employee_number, name, phone, shop_id) VALUES (?, ?, ?, ?)',
        [`EMP${String(i).padStart(3, '0')}`, names[i - 16], `1390000${String(i).padStart(4, '0')}`, 2]
      );
    }

    console.log('✓ 示例数据初始化完成（30名员工）');
  });
});

module.exports = db;
