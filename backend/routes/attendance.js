const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const moment = require('moment');

// 打卡
router.post('/checkin', (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: '员工ID或员工号不能为空' });
    }

    // 支持员工号（如EMP001）或员工ID（如1）
    let query, params;
    if (isNaN(employeeId)) {
      // 员工号
      query = 'SELECT * FROM employees WHERE employee_number = ? AND status = "active"';
      params = [employeeId];
    } else {
      // 员工ID
      query = 'SELECT * FROM employees WHERE id = ? AND status = "active"';
      params = [parseInt(employeeId)];
    }

    db.get(query, params, (err, employee) => {
      if (err) {
        console.error('查询员工错误:', err);
        return res.status(500).json({ error: '查询失败', message: err.message });
      }

      if (!employee) {
        return res.status(404).json({ error: '员工未找到' });
      }

      const today = moment().format('YYYY-MM-DD');
      const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const currentTimeStr = moment().format('HH:mm:ss');

      // 检查今天是否已有打卡记录
      // 获取店铺的营业时间
      db.get(
        'SELECT check_in_time, check_out_time FROM shops WHERE id = ?',
        [employee.shop_id],
        (err, shop) => {
          if (err) {
            console.error('查询店铺信息错误:', err);
            return res.status(500).json({ error: '查询失败' });
          }

          const shopCheckInTime = shop ? shop.check_in_time : config.workHours.checkInTime;
          const shopCheckOutTime = shop ? shop.check_out_time : config.workHours.checkOutTime;

          db.get(
            'SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?',
            [employee.id, today],
            (err, record) => {
              if (err) {
                console.error('查询打卡记录错误:', err);
                return res.status(500).json({ error: '查询失败' });
              }

              let checkType = 'check_in';
              let isLate = false;

              if (!record) {
                // 第一次打卡 = 上班
                checkType = 'check_in';

                // 判断是否迟到（根据店铺的营业时间）
                const checkInTime = moment(currentTime, 'YYYY-MM-DD HH:mm:ss');
                const workStartTime = moment(today + ' ' + shopCheckInTime, 'YYYY-MM-DD HH:mm');

                if (checkInTime.isAfter(workStartTime)) {
                  isLate = true;
                }

                // 插入新记录
                db.run(
                  'INSERT INTO attendance_records (employee_id, attendance_date, check_in_time, is_late) VALUES (?, ?, ?, ?)',
                  [employee.id, today, currentTime, isLate ? 1 : 0],
                  (err) => {
                    if (err) {
                      console.error('插入打卡记录错误:', err);
                      return res.status(500).json({ error: '打卡失败' });
                    }

                    res.json({
                      success: true,
                      type: checkType,
                      employeeName: employee.name,
                      time: currentTimeStr,
                      isLate: isLate,
                      message: '上班打卡成功'
                    });
                  }
                );
              } else {
                // 已有上班记录，这次是下班
                checkType = 'check_out';

                // 检查是否早退（根据店铺的营业时间）
                const checkOutTime = moment(currentTime, 'YYYY-MM-DD HH:mm:ss');
                const workEndTime = moment(today + ' ' + shopCheckOutTime, 'YYYY-MM-DD HH:mm');
                const isEarlyLeave = checkOutTime.isBefore(workEndTime);

                // 更新记录
                db.run(
                  'UPDATE attendance_records SET check_out_time = ?, is_early_leave = ? WHERE employee_id = ? AND attendance_date = ?',
                  [currentTime, isEarlyLeave ? 1 : 0, employee.id, today],
                  (err) => {
                    if (err) {
                      console.error('更新打卡记录错误:', err);
                      return res.status(500).json({ error: '打卡失败' });
                    }

                    res.json({
                      success: true,
                      type: checkType,
                      employeeName: employee.name,
                      time: currentTimeStr,
                      message: '下班打卡成功'
                    });
                  }
                );
              }
            }
          );
        }
      );
    });

  } catch (error) {
    console.error('打卡错误:', error);
    res.status(500).json({ error: '打卡失败', message: error.message });
  }
});

// 获取员工当日打卡状态
router.get('/status/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = moment().format('YYYY-MM-DD');

    db.get(
      'SELECT check_in_time, check_out_time FROM attendance_records WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, today],
      (err, record) => {
        if (err) {
          console.error('获取状态错误:', err);
          return res.status(500).json({ error: '获取状态失败' });
        }

        const status = {
          checkedIn: false,
          checkedOut: false,
          checkInTime: null,
          checkOutTime: null
        };

        if (record) {
          status.checkedIn = !!record.check_in_time;
          status.checkedOut = !!record.check_out_time;
          status.checkInTime = record.check_in_time;
          status.checkOutTime = record.check_out_time;
        }

        res.json(status);
      }
    );

  } catch (error) {
    console.error('获取状态错误:', error);
    res.status(500).json({ error: '获取状态失败' });
  }
});

module.exports = router;
