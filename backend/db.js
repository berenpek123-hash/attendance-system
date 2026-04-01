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
  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  // 给已有的 shops 表添加营业时间字段（如果还没有）
  db.all("PRAGMA table_info(shops)", (err, columns) => {
    if (err) return;
    const columnNames = (columns || []).map(c => c.name);
    if (!columnNames.includes('check_in_time')) {
      db.run("ALTER TABLE shops ADD COLUMN check_in_time TEXT DEFAULT '09:00'");
    }
    if (!columnNames.includes('check_out_time')) {
      db.run("ALTER TABLE shops ADD COLUMN check_out_time TEXT DEFAULT '18:00'");
    }
  });

  // 检查是否需要初始化示例数据
  db.get('SELECT COUNT(*) as count FROM shops', (err, row) => {
    if (err || (row && row.count > 0)) {
      console.log('✓ 数据库已初始化');
      return;
    }

    // 先初始化默认用户
    db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', '123456', 'admin']);

    // 用 serialize 确保店铺先插入完成再插入员工
    db.serialize(() => {
      // 先插入店铺
      db.run('INSERT INTO shops (name, address, check_in_time, check_out_time) VALUES (?, ?, ?, ?)', 
        ['店铺1', '', '09:00', '18:00']);
      db.run('INSERT INTO shops (name, address, check_in_time, check_out_time) VALUES (?, ?, ?, ?)', 
        ['店铺2', '', '09:00', '18:00']);

      // 再插入员工（此时店铺已存在，外键不会报错）
      const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
                     '冯一', '陈二', '褚三', '卫四', '蒋五', '沈六', '韩七'];

      // 店铺1 EMP001-EMP015
      for (let i = 1; i <= 15; i++) {
        db.run(
          'INSERT INTO employees (employee_number, name, phone, shop_id) VALUES (?, ?, ?, ?)',
          [`EMP${String(i).padStart(3, '0')}`, names[i - 1], `1380000${String(i).padStart(4, '0')}`, 1]
        );
      }

      // 店铺2 EMP016-EMP030
      for (let i = 16; i <= 30; i++) {
        db.run(
          'INSERT INTO employees (employee_number, name, phone, shop_id) VALUES (?, ?, ?, ?)',
          [`EMP${String(i).padStart(3, '0')}`, names[i - 16], `1390000${String(i).padStart(4, '0')}`, 2]
        );
      }

      console.log('✓ 示例数据初始化完成（30名员工）');
    });
  });
});

module.exports = db;
