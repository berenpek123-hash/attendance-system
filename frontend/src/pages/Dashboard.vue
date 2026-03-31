<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">总员工数</div>
        <div class="stat-value">{{ totalEmployees }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">店铺数</div>
        <div class="stat-value">{{ shops.length }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">今日上班</div>
        <div class="stat-value">{{ todayCheckinCount }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">今日缺卡</div>
        <div class="stat-value">{{ todayAbsentCount }}</div>
      </div>
    </div>

    <div class="section">
      <h3>店铺概览</h3>
      <table class="table">
        <thead>
          <tr>
            <th>店铺名称</th>
            <th>位置</th>
            <th>员工数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shop in shops" :key="shop.id">
            <td>{{ shop.name }}</td>
            <td>{{ shop.location }}</td>
            <td>{{ shop.employeeCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getShops, getDailyReport, getEmployees } from '../api'
import moment from 'moment'

export default {
  name: 'Dashboard',
  setup() {
    const shops = ref([])
    const totalEmployees = ref(0)
    const todayCheckinCount = ref(0)
    const todayAbsentCount = ref(0)

    const loadData = async () => {
      try {
        // 加载店铺
        const shopsRes = await getShops()
        shops.value = shopsRes.data
        
        // 计算总员工数
        totalEmployees.value = shops.value.reduce((sum, shop) => sum + shop.employeeCount, 0)
        
        // 加载今日报表
        const today = moment().format('YYYY-MM-DD')
        const reportRes = await getDailyReport(today)
        todayCheckinCount.value = reportRes.data.attended
        todayAbsentCount.value = reportRes.data.absent
      } catch (error) {
        console.error('加载仪表盘数据失败:', error)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      shops,
      totalEmployees,
      todayCheckinCount,
      todayAbsentCount
    }
  }
}
</script>

<style scoped>
.dashboard {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 2rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.section {
  margin-top: 2rem;
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
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  font-weight: bold;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.table tbody tr:hover {
  background: #fafafa;
}
</style>
