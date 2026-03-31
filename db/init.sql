-- 员工打卡系统数据库初始化脚本

CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- 店铺表
CREATE TABLE shops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 员工表
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  employee_number VARCHAR(50) NOT NULL UNIQUE,
  shop_id INT NOT NULL,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_shop_id (shop_id),
  INDEX idx_employee_number (employee_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 打卡记录表
CREATE TABLE attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  check_in_time DATETIME,
  check_out_time DATETIME,
  attendance_date DATE NOT NULL,
  is_late BOOLEAN DEFAULT FALSE,
  is_early_leave BOOLEAN DEFAULT FALSE,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_attendance_date (attendance_date),
  UNIQUE KEY unique_checkin (employee_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化测试数据
INSERT INTO shops (name, location) VALUES
('南京店', '南京市鼓楼区'),
('北京店', '北京市朝阳区');

-- 为30个员工生成初始数据
INSERT INTO employees (name, employee_number, shop_id, phone) VALUES
-- 南京店 15人
('张三', 'EMP001', 1, '13800000001'),
('李四', 'EMP002', 1, '13800000002'),
('王五', 'EMP003', 1, '13800000003'),
('赵六', 'EMP004', 1, '13800000004'),
('孙七', 'EMP005', 1, '13800000005'),
('周八', 'EMP006', 1, '13800000006'),
('吴九', 'EMP007', 1, '13800000007'),
('郑十', 'EMP008', 1, '13800000008'),
('王十一', 'EMP009', 1, '13800000009'),
('冯十二', 'EMP010', 1, '13800000010'),
('陈十三', 'EMP011', 1, '13800000011'),
('褚十四', 'EMP012', 1, '13800000012'),
('卫十五', 'EMP013', 1, '13800000013'),
('蒋十六', 'EMP014', 1, '13800000014'),
('沈十七', 'EMP015', 1, '13800000015'),

-- 北京店 15人
('韦十八', 'EMP016', 2, '13800000016'),
('江十九', 'EMP017', 2, '13800000017'),
('何二十', 'EMP018', 2, '13800000018'),
('吕二十一', 'EMP019', 2, '13800000019'),
('苏二十二', 'EMP020', 2, '13800000020'),
('陆二十三', 'EMP021', 2, '13800000021'),
('朱二十四', 'EMP022', 2, '13800000022'),
('余二十五', 'EMP023', 2, '13800000023'),
('徐二十六', 'EMP024', 2, '13800000024'),
('常二十七', 'EMP025', 2, '13800000025'),
('武二十八', 'EMP026', 2, '13800000026'),
('乔二十九', 'EMP027', 2, '13800000027'),
('贺三十', 'EMP028', 2, '13800000028'),
('赖三十一', 'EMP029', 2, '13800000029'),
('龚三十二', 'EMP030', 2, '13800000030');
