const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有员工
router.get('/', (req, res) => {
  try {
    const { shopId } = req.query;

    let query = 'SELECT e.*, s.name as shop_name FROM employees e JOIN shops s ON e.shop_id = s.id WHERE 1=1';
    const params = [];

    if (shopId) {
      query += ' AND e.shop_id = ?';
      params.push(shopId);
    }

    query += ' ORDER BY e.id';

    db.all(query, params, (err, employees) => {
      if (err) {
        console.error('获取员工列表错误:', err);
        return res.status(500).json({ error: '获取员工列表失败' });
      }
      res.json(employees || []);
    });

  } catch (error) {
    console.error('获取员工列表错误:', error);
    res.status(500).json({ error: '获取员工列表失败' });
  }
});

// 获取单个员工
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get(
      'SELECT e.*, s.name as shop_name FROM employees e JOIN shops s ON e.shop_id = s.id WHERE e.id = ?',
      [id],
      (err, employee) => {
        if (err) {
          console.error('获取员工错误:', err);
          return res.status(500).json({ error: '获取员工失败' });
        }

        if (!employee) {
          return res.status(404).json({ error: '员工不存在' });
        }

        res.json(employee);
      }
    );

  } catch (error) {
    console.error('获取员工错误:', error);
    res.status(500).json({ error: '获取员工失败' });
  }
});

// 添加员工
router.post('/', (req, res) => {
  try {
    const { name, employee_number, shop_id, phone } = req.body;

    if (!name || !employee_number || !shop_id) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    db.run(
      'INSERT INTO employees (name, employee_number, shop_id, phone) VALUES (?, ?, ?, ?)',
      [name, employee_number, shop_id, phone || ''],
      function(err) {
        if (err) {
          console.error('添加员工错误:', err);
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '员工号已存在' });
          }
          return res.status(500).json({ error: '添加员工失败' });
        }

        res.json({
          success: true,
          id: this.lastID,
          message: '员工添加成功'
        });
      }
    );

  } catch (error) {
    console.error('添加员工错误:', error);
    res.status(500).json({ error: '添加员工失败' });
  }
});

// 更新员工（支持部分更新）
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;

    // 先查询当前员工数据，然后合并更新
    db.get('SELECT * FROM employees WHERE id = ?', [id], (err, employee) => {
      if (err) {
        console.error('查询员工错误:', err);
        return res.status(500).json({ error: '更新员工失败' });
      }
      if (!employee) {
        return res.status(404).json({ error: '员工不存在' });
      }

      const updatedName = name !== undefined ? name : employee.name;
      const updatedPhone = phone !== undefined ? phone : employee.phone;
      const updatedStatus = status !== undefined ? status : employee.status;

      db.run(
        'UPDATE employees SET name = ?, phone = ?, status = ? WHERE id = ?',
        [updatedName, updatedPhone, updatedStatus, id],
        (err2) => {
          if (err2) {
            console.error('更新员工错误:', err2);
            return res.status(500).json({ error: '更新员工失败' });
          }

          res.json({
            success: true,
            message: '员工更新成功'
          });
        }
      );
    });

  } catch (error) {
    console.error('更新员工错误:', error);
    res.status(500).json({ error: '更新员工失败' });
  }
});

module.exports = router;
