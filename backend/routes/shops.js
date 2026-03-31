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

module.exports = router;
