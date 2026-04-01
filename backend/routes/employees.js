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

// 删除员工
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // 先删除该员工的打卡记录
    db.run('DELETE FROM attendance_records WHERE employee_id = ?', [id], (err) => {
      if (err) {
        console.error('删除打卡记录错误:', err);
        return res.status(500).json({ error: '删除失败' });
      }

      db.run('DELETE FROM employees WHERE id = ?', [id], function (err2) {
        if (err2) {
          console.error('删除员工错误:', err2);
          return res.status(500).json({ error: '删除失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '员工不存在' });
        }
        res.json({ success: true, message: '员工已删除' });
      });
    });
  } catch (error) {
    console.error('删除员工错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 批量添加员工
router.post('/batch/add', (req, res) => {
  try {
    const { employees } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: '员工列表不能为空' });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    const insertNext = (index) => {
      if (index >= employees.length) {
        // 全部完成
        return res.json({
          success: true,
          successCount,
          errorCount,
          errors: errors.length > 0 ? errors : undefined,
          message: `成功添加 ${successCount} 名员工${errorCount > 0 ? `，失败 ${errorCount} 名` : ''}`
        });
      }

      const emp = employees[index];

      // 验证必填字段
      if (!emp.name || !emp.employee_number || !emp.shop_id) {
        errorCount++;
        errors.push({
          rowIndex: index + 1,
          name: emp.name || '未填',
          error: '缺少必填信息（姓名、员工号、店铺）'
        });
        return insertNext(index + 1);
      }

      db.run(
        'INSERT INTO employees (name, employee_number, shop_id, phone) VALUES (?, ?, ?, ?)',
        [emp.name, emp.employee_number, emp.shop_id, emp.phone || ''],
        function (err) {
          if (err) {
            errorCount++;
            if (err.message.includes('UNIQUE')) {
              errors.push({
                rowIndex: index + 1,
                name: emp.name,
                error: `员工号 ${emp.employee_number} 已存在`
              });
            } else {
              errors.push({
                rowIndex: index + 1,
                name: emp.name,
                error: err.message
              });
            }
          } else {
            successCount++;
          }

          insertNext(index + 1);
        }
      );
    };

    insertNext(0);
  } catch (error) {
    console.error('批量添加员工错误:', error);
    res.status(500).json({ error: '批量添加失败', message: error.message });
  }
});

// 批量删除员工
router.post('/batch/delete', (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '需要选择至少一名员工' });
    }

    let successCount = 0;
    let errorCount = 0;

    const deleteNext = (index) => {
      if (index >= ids.length) {
        return res.json({
          success: true,
          successCount,
          errorCount,
          message: `成功删除 ${successCount} 名员工${errorCount > 0 ? `，失败 ${errorCount} 名` : ''}`
        });
      }

      const empId = ids[index];

      // 先删除打卡记录
      db.run('DELETE FROM attendance_records WHERE employee_id = ?', [empId], (err) => {
        if (err) {
          errorCount++;
          return deleteNext(index + 1);
        }

        // 再删除员工
        db.run('DELETE FROM employees WHERE id = ?', [empId], function (err2) {
          if (err2 || this.changes === 0) {
            errorCount++;
          } else {
            successCount++;
          }
          deleteNext(index + 1);
        });
      });
    };

    deleteNext(0);
  } catch (error) {
    console.error('批量删除员工错误:', error);
    res.status(500).json({ error: '批量删除失败', message: error.message });
  }
});

module.exports = router;
