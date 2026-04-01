const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'attendance-system-secret-key-2026';

// 登陆
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('查询用户错误:', err);
        return res.status(500).json({ error: '登陆失败' });
      }

      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 简单的密码验证（生产环境应该用 bcrypt）
      if (user.password !== password) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('登陆错误:', error);
    res.status(500).json({ error: '登陆失败' });
  }
});

// 验证 token 有效性
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token 不存在' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token 无效或已过期' });
      }

      res.json({
        success: true,
        user: decoded
      });
    });
  } catch (error) {
    console.error('验证 token 错误:', error);
    res.status(500).json({ error: '验证失败' });
  }
});

// 修改密码
router.post('/change-password', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { oldPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({ error: '未登陆' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少 6 位' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token 无效' });
      }

      // 查询用户，验证旧密码
      db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err || !user) {
          return res.status(500).json({ error: '用户不存在' });
        }

        if (user.password !== oldPassword) {
          return res.status(401).json({ error: '旧密码错误' });
        }

        // 更新密码
        db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, user.id], function (err) {
          if (err) {
            console.error('更新密码错误:', err);
            return res.status(500).json({ error: '修改密码失败' });
          }

          res.json({
            success: true,
            message: '密码已修改'
          });
        });
      });
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '未登陆' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token 无效' });
      }

      res.json({
        success: true,
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        }
      });
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 忘记密码
router.post('/forgot-password', (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: '请输入用户名' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('查询用户错误:', err);
        return res.status(500).json({ error: '操作失败' });
      }

      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 生成随机临时密码（8位）
      const tempPassword = Math.random().toString(36).substring(2, 10);

      // 更新数据库中的密码
      db.run(
        'UPDATE users SET password = ? WHERE username = ?',
        [tempPassword, username],
        function(err) {
          if (err) {
            console.error('更新密码错误:', err);
            return res.status(500).json({ error: '重置失败' });
          }

          res.json({
            success: true,
            message: '密码已重置，请使用临时密码登陆',
            tempPassword: tempPassword,
            tip: '登陆后请立即修改密码'
          });
        }
      );
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

module.exports = router;
