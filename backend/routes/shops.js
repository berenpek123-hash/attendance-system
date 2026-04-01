const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有店铺
router.get('/', (req, res) => {
  try {
    db.all('SELECT * FROM shops ORDER BY id', (err, shops) => {
      if (err) {
        console.error('获取店铺列表错误:', err);
        return res.status(500).json({ error: '获取店铺列表失败' });
      }

      shops = shops || [];
      let completed = 0;

      // 获取每个店铺的员工数
      const shopsWithCount = shops.map(shop => ({ ...shop, employeeCount: 0 }));

      if (shops.length === 0) {
        return res.json(shopsWithCount);
      }

      shops.forEach((shop, index) => {
        db.get(
          'SELECT COUNT(*) as count FROM employees WHERE shop_id = ? AND status = "active"',
          [shop.id],
          (err, result) => {
            if (!err && result) {
              shopsWithCount[index].employeeCount = result.count;
            }
            completed++;

            if (completed === shops.length) {
              res.json(shopsWithCount);
            }
          }
        );
      });
    });

  } catch (error) {
    console.error('获取店铺列表错误:', error);
    res.status(500).json({ error: '获取店铺列表失败' });
  }
});

// 添加店铺
router.post('/', (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: '店铺名称不能为空' });
    }

    db.run(
      'INSERT INTO shops (name, address) VALUES (?, ?)',
      [name, address || ''],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '店铺名称已存在' });
          }
          console.error('添加店铺错误:', err);
          return res.status(500).json({ error: '添加店铺失败' });
        }
        res.json({ success: true, id: this.lastID, message: '添加成功' });
      }
    );
  } catch (error) {
    console.error('添加店铺错误:', error);
    res.status(500).json({ error: '添加店铺失败' });
  }
});

// 修改店铺
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, check_in_time, check_out_time } = req.body;

    if (!name) {
      return res.status(400).json({ error: '店铺名称不能为空' });
    }

    db.run(
      'UPDATE shops SET name = ?, address = ?, check_in_time = ?, check_out_time = ? WHERE id = ?',
      [name, address || '', check_in_time || '09:00', check_out_time || '18:00', id],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '店铺名称已存在' });
          }
          console.error('修改店铺错误:', err);
          return res.status(500).json({ error: '修改店铺失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '店铺不存在' });
        }
        res.json({ success: true, message: '修改成功' });
      }
    );
  } catch (error) {
    console.error('修改店铺错误:', error);
    res.status(500).json({ error: '修改店铺失败' });
  }
});

// 删除店铺
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有员工关联
    db.get('SELECT COUNT(*) as count FROM employees WHERE shop_id = ?', [id], (err, result) => {
      if (err) {
        console.error('检查店铺关联错误:', err);
        return res.status(500).json({ error: '删除失败' });
      }

      if (result.count > 0) {
        return res.status(400).json({ error: `该店铺下还有 ${result.count} 名员工，请先转移或删除员工` });
      }

      db.run('DELETE FROM shops WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('删除店铺错误:', err);
          return res.status(500).json({ error: '删除失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '店铺不存在' });
        }
        res.json({ success: true, message: '删除成功' });
      });
    });
  } catch (error) {
    console.error('删除店铺错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
