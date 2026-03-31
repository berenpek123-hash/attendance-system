<template>
  <div class="report-container">
    <div class="report-card">
      <h2>📈 月报</h2>
      
      <div class="filter-bar">
        <div class="filter-group">
          <label>选择月份：</label>
          <input 
            v-model="selectedMonth" 
            type="month"
            @change="loadReport"
          >
        </div>
        
        <div class="filter-group">
          <label>选择店铺：</label>
          <select v-model="selectedShopId" @change="loadReport">
            <option value="">全部店铺</option>
            <option v-for="shop in shops" :key="shop.id" :value="shop.id">
              {{ shop.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 月份信息 -->
      <div class="month-info" v-if="report">
        <div class="info-item">
          <span class="label">统计月份：</span>
          <span class="value">{{ report.month }}</span>
        </div>
        <div class="info-item">
          <span class="label">工作天数：</span>
          <span class="value">{{ report.workDays }}</span>
        </div>
      </div>

      <!-- 员工统计表 -->
      <div class="section" v-if="report">
        <h3>员工出勤统计</h3>
        <table class="table">
          <thead>
            <tr>
              <th>员工名称</th>
              <th>员工号</th>
              <th>店铺</th>
              <th>出勤天数</th>
              <th>出勤率</th>
              <th>迟到次数</th>
              <th>早退次数</th>
              <th>缺勤天数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in report.employeeStats" :key="stat.id">
              <td>{{ stat.name }}</td>
              <td>{{ stat.employee_number }}</td>
              <td>{{ stat.shop_name }}</td>
              <td class="text-center">{{ stat.days_worked }}</td>
              <td class="text-center">
                <span :class="getAttendanceClass(stat.attendanceRate)">
                  {{ stat.attendanceRate }}
                </span>
              </td>
              <td class="text-center">
                <span v-if="stat.late_count > 0" class="badge warning">
                  {{ stat.late_count }}
                </span>
                <span v-else class="text-muted">0</span>
              </td>
              <td class="text-center">
                <span v-if="stat.early_leave_count > 0" class="badge warning">
                  {{ stat.early_leave_count }}
                </span>
                <span v-else class="text-muted">0</span>
              </td>
              <td class="text-center">
                <span v-if="stat.absent_count > 0" class="badge danger">
                  {{ stat.absent_count }}
                </span>
                <span v-else class="text-muted">0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 统计总结 -->
      <div class="summary" v-if="report">
        <div class="summary-item">
          <div class="summary-label">平均出勤率</div>
          <div class="summary-value">{{ getAverageAttendance() }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">迟到总数</div>
          <div class="summary-value">{{ getTotalLate() }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">早退总数</div>
          <div class="summary-value">{{ getTotalEarlyLeave() }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">缺勤总数</div>
          <div class="summary-value">{{ getTotalAbsent() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { getMonthlyReport, getShops } from '../api'
import moment from 'moment'

export default {
  name: 'MonthlyReport',
  setup() {
    const selectedMonth = ref(moment().format('YYYY-MM'))
    const selectedShopId = ref('')
    const report = ref(null)
    const shops = ref([])

    const loadReport = async () => {
      try {
        const res = await getMonthlyReport(selectedMonth.value, selectedShopId.value)
        report.value = res.data
      } catch (error) {
        console.error('加载月报失败:', error)
      }
    }

    const loadShops = async () => {
      try {
        const res = await getShops()
        shops.value = res.data
      } catch (error) {
        console.error('加载店铺失败:', error)
      }
    }

    const getAttendanceClass = (rate) => {
      const num = parseFloat(rate)
      if (num >= 95) return 'attendance-excellent'
      if (num >= 90) return 'attendance-good'
      if (num >= 80) return 'attendance-fair'
      return 'attendance-poor'
    }

    const getAverageAttendance = () => {
      if (!report.value || !report.value.employeeStats.length) return '0%'
      const sum = report.value.employeeStats.reduce((acc, stat) => {
        return acc + parseFloat(stat.attendanceRate)
      }, 0)
      const avg = sum / report.value.employeeStats.length
      return avg.toFixed(2) + '%'
    }

    const getTotalLate = () => {
      if (!report.value) return 0
      return report.value.employeeStats.reduce((sum, stat) => sum + stat.late_count, 0)
    }

    const getTotalEarlyLeave = () => {
      if (!report.value) return 0
      return report.value.employeeStats.reduce((sum, stat) => sum + stat.early_leave_count, 0)
    }

    const getTotalAbsent = () => {
      if (!report.value) return 0
      return report.value.employeeStats.reduce((sum, stat) => sum + stat.absent_count, 0)
    }

    onMounted(() => {
      loadShops()
      loadReport()
    })

    return {
      selectedMonth,
      selectedShopId,
      report,
      shops,
      loadReport,
      getAttendanceClass,
      getAverageAttendance,
      getTotalLate,
      getTotalEarlyLeave,
      getTotalAbsent
    }
  }
}
</script>

<style scoped>
.report-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.filter-bar {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-group label {
  font-weight: 500;
  color: #666;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.month-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.info-item .label {
  font-weight: 600;
  color: #666;
}

.info-item .value {
  color: #333;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f5f5f5;
  padding: 0.8rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  font-weight: bold;
  font-size: 0.9rem;
}

.table td {
  padding: 0.8rem;
  border-bottom: 1px solid #ddd;
  font-size: 0.9rem;
}

.table tbody tr:hover {
  background: #fafafa;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #999;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.warning {
  background: #fff3cd;
  color: #856404;
}

.badge.danger {
  background: #f8d7da;
  color: #721c24;
}

.attendance-excellent {
  color: #28a745;
  font-weight: 600;
}

.attendance-good {
  color: #17a2b8;
  font-weight: 600;
}

.attendance-fair {
  color: #ffc107;
  font-weight: 600;
}

.attendance-poor {
  color: #dc3545;
  font-weight: 600;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.summary-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.summary-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.8rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .month-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .table {
    font-size: 0.85rem;
  }
  
  .table th,
  .table td {
    padding: 0.5rem;
  }
}
</style>
