<template>
  <div class="report-container">
    <div class="report-card">
      <h2>📊 日报</h2>
      
      <div class="filter-bar">
        <div class="filter-group">
          <label>选择日期：</label>
          <input 
            v-model="selectedDate" 
            type="date"
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

      <!-- 统计概览 -->
      <div class="summary" v-if="report">
        <div class="summary-item">
          <div class="summary-label">总员工</div>
          <div class="summary-value">{{ report.total }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">已打卡</div>
          <div class="summary-value success">{{ report.attended }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">缺卡</div>
          <div class="summary-value danger">{{ report.absent }}</div>
        </div>
      </div>

      <!-- 打卡记录表 -->
      <div class="section" v-if="report">
        <h3>打卡记录</h3>
        <table class="table">
          <thead>
            <tr>
              <th>员工ID</th>
              <th>员工名称</th>
              <th>员工号</th>
              <th>店铺</th>
              <th>上班时间</th>
              <th>下班时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in report.records" :key="record.id">
              <td>{{ record.employee_id }}</td>
              <td>{{ record.name }}</td>
              <td>{{ record.employee_number }}</td>
              <td>{{ record.shop_name }}</td>
              <td>
                <span v-if="record.check_in_time">
                  {{ formatTime(record.check_in_time) }}
                  <span v-if="record.is_late" class="badge danger">迟到</span>
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="record.check_out_time">
                  {{ formatTime(record.check_out_time) }}
                  <span v-if="record.is_early_leave" class="badge warning">早退</span>
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span v-if="record.check_in_time && record.check_out_time" class="badge success">✓ 完成</span>
                <span v-else-if="record.check_in_time" class="badge info">⏱ 进行中</span>
                <span v-else class="badge danger">✗ 缺卡</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 缺卡员工 -->
      <div class="section" v-if="report && report.absentees.length > 0">
        <h3>缺卡员工 ({{ report.absentees.length }})</h3>
        <ul class="absent-list">
          <li v-for="emp in report.absentees" :key="emp.id">
            {{ emp.name }} ({{ emp.employee_number }})
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getDailyReport, getShops } from '../api'
import moment from 'moment'

export default {
  name: 'DailyReport',
  setup() {
    const selectedDate = ref(moment().format('YYYY-MM-DD'))
    const selectedShopId = ref('')
    const report = ref(null)
    const shops = ref([])

    const loadReport = async () => {
      try {
        const res = await getDailyReport(selectedDate.value, selectedShopId.value)
        report.value = res.data
      } catch (error) {
        console.error('加载日报失败:', error)
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

    const formatTime = (datetime) => {
      if (!datetime) return '-'
      return moment(datetime).format('HH:mm:ss')
    }

    onMounted(() => {
      loadShops()
      loadReport()
    })

    return {
      selectedDate,
      selectedShopId,
      report,
      shops,
      loadReport,
      formatTime
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

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-item {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  border-left: 4px solid #667eea;
}

.summary-label {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.summary-value.success {
  color: #28a745;
}

.summary-value.danger {
  color: #dc3545;
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
  overflow-x: auto;
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

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.3rem;
}

.badge.success {
  background: #d4edda;
  color: #155724;
}

.badge.danger {
  background: #f8d7da;
  color: #721c24;
}

.badge.warning {
  background: #fff3cd;
  color: #856404;
}

.badge.info {
  background: #d1ecf1;
  color: #0c5460;
}

.text-muted {
  color: #999;
}

.absent-list {
  list-style: none;
  padding: 0;
}

.absent-list li {
  padding: 0.8rem;
  border-left: 3px solid #dc3545;
  background: #f9f9f9;
  margin-bottom: 0.5rem;
  border-radius: 2px;
  color: #333;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 1rem;
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
