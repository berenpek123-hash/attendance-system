const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');

// 日报
router.get('/daily', (req, res) => {
  try {
    const { date, shopId } = req.query;
    const targetDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

    let query = `
      SELECT 
        ar.id,
        ar.employee_id,
        e.name,
        e.employee_number,
        s.name as shop_name,
        ar.check_in_time,
        ar.check_out_time,
        ar.is_late,
        ar.is_early_leave
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      JOIN shops s ON e.shop_id = s.id
      WHERE ar.attendance_date = ?
    `;

    const params = [targetDate];

    if (shopId) {
      query += ' AND e.shop_id = ?';
      params.push(shopId);
    }

    query += ' ORDER BY e.shop_id, e.id';

    db.all(query, params, (err, records) => {
      if (err) {
        console.error('日报错误:', err);
        return res.status(500).json({ error: '获取日报失败' });
      }

      records = records || [];

      // 获取该日期应该出勤的所有员工
      let employeeQuery = 'SELECT id, name, employee_number, shop_id FROM employees WHERE status = "active"';
      const employeeParams = [];

      if (shopId) {
        employeeQuery += ' AND shop_id = ?';
        employeeParams.push(shopId);
      }

      db.all(employeeQuery, employeeParams, (err, allEmployees) => {
        if (err) {
          console.error('日报错误:', err);
          return res.status(500).json({ error: '获取日报失败' });
        }

        allEmployees = allEmployees || [];
        const attendedIds = new Set(records.map(r => r.employee_id));
        const absentees = allEmployees.filter(emp => !attendedIds.has(emp.id));

        res.json({
          date: targetDate,
          total: allEmployees.length,
          attended: records.length,
          absent: absentees.length,
          records,
          absentees
        });
      });
    });

  } catch (error) {
    console.error('日报错误:', error);
    res.status(500).json({ error: '获取日报失败' });
  }
});

// 月报
router.get('/monthly', (req, res) => {
  try {
    const { month, shopId } = req.query;
    const targetMonth = month ? moment(month).format('YYYY-MM') : moment().format('YYYY-MM');
    const monthStart = targetMonth + '-01';
    const monthEnd = moment(monthStart).endOf('month').format('YYYY-MM-DD');

    let query = `
      SELECT 
        e.id,
        e.name,
        e.employee_number,
        s.name as shop_name,
        COUNT(CASE WHEN ar.check_in_time IS NOT NULL THEN 1 END) as days_worked,
        COUNT(CASE WHEN ar.is_late THEN 1 END) as late_count,
        COUNT(CASE WHEN ar.is_early_leave THEN 1 END) as early_leave_count,
        COUNT(DISTINCT CASE WHEN ar.check_in_time IS NULL THEN ar.attendance_date END) as absent_count
      FROM employees e
      LEFT JOIN shops s ON e.shop_id = s.id
      LEFT JOIN attendance_records ar ON e.id = ar.employee_id 
        AND ar.attendance_date BETWEEN ? AND ?
      WHERE e.status = 'active'
    `;

    const params = [monthStart, monthEnd];

    if (shopId) {
      query += ' AND e.shop_id = ?';
      params.push(shopId);
    }

    query += ' GROUP BY e.id ORDER BY e.shop_id, e.id';

    db.all(query, params, (err, records) => {
      if (err) {
        console.error('月报错误:', err);
        return res.status(500).json({ error: '获取月报失败' });
      }

      records = records || [];

      // 计算工作天数（排除周末）
      let workDays = 0;
      const current = moment(monthStart);
      const end = moment(monthEnd);

      while (current.isSameOrBefore(end)) {
        if (current.day() !== 0 && current.day() !== 6) { // 排除周末
          workDays++;
        }
        current.add(1, 'day');
      }

      res.json({
        month: targetMonth,
        workDays,
        employeeStats: records.map(r => ({
          ...r,
          attendanceRate: workDays > 0 ? ((r.days_worked / workDays) * 100).toFixed(2) + '%' : '0%'
        }))
      });
    });

  } catch (error) {
    console.error('月报错误:', error);
    res.status(500).json({ error: '获取月报失败' });
  }
});

// 获取员工个人统计
router.get('/employee/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query;
    const targetMonth = month ? moment(month).format('YYYY-MM') : moment().format('YYYY-MM');
    const monthStart = targetMonth + '-01';
    const monthEnd = moment(monthStart).endOf('month').format('YYYY-MM-DD');

    db.all(
      'SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date BETWEEN ? AND ? ORDER BY attendance_date DESC',
      [employeeId, monthStart, monthEnd],
      (err, records) => {
        if (err) {
          console.error('员工统计错误:', err);
          return res.status(500).json({ error: '获取员工统计失败' });
        }

        records = records || [];
        const stats = {
          daysWorked: records.filter(r => r.check_in_time).length,
          lateCount: records.filter(r => r.is_late).length,
          earlyLeaveCount: records.filter(r => r.is_early_leave).length,
          absentCount: records.filter(r => !r.check_in_time).length
        };

        res.json({
          month: targetMonth,
          stats,
          records
        });
      }
    );

  } catch (error) {
    console.error('员工统计错误:', error);
    res.status(500).json({ error: '获取员工统计失败' });
  }
});

module.exports = router;
