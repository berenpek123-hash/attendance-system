<template>
  <div class="work-hours-container">
    <h2>员工工作时长统计</h2>

    <div class="controls">
      <div class="control-group">
        <label>选择店铺：</label>
        <select v-model="selectedShop">
          <option value="">全部店铺</option>
          <option value="1">南京店</option>
          <option value="2">北京店</option>
        </select>
      </div>

      <div class="control-group">
        <label>选择月份：</label>
        <input type="month" v-model="selectedMonth" @change="fetchData">
      </div>

      <button @click="fetchData" class="btn-primary">查询</button>
      <button @click="exportExcel" class="btn-secondary">导出 Excel</button>
    </div>

    <!-- 今日工作时长 -->
    <div class="section">
      <h3>今日工作时长</h3>
      <div v-if="todayStats.length > 0" class="table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>员工号</th>
              <th>姓名</th>
              <th>店铺</th>
              <th>上班时间</th>
              <th>下班时间</th>
              <th>工作时长</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in todayStats" :key="item.employeeId" :class="item.status">
              <td>{{ item.employeeNumber }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.shopName }}</td>
              <td>{{ item.checkInTime }}</td>
              <td>{{ item.checkOutTime }}</td>
              <td class="work-hours">{{ item.workHours }}</td>
              <td>
                <span class="status-badge" :class="item.status">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="no-data">暂无数据</p>
    </div>

    <!-- 月度工作时长统计 -->
    <div class="section">
      <h3>{{ selectedMonth }} 工作时长统计</h3>
      <div v-if="monthlyStats.length > 0" class="table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>员工号</th>
              <th>姓名</th>
              <th>店铺</th>
              <th>工作天数</th>
              <th>总工作时长</th>
              <th>日均工作时长</th>
              <th>迟到次数</th>
              <th>早退次数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in monthlyStats" :key="item.employeeId">
              <td>{{ item.employeeNumber }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.shopName }}</td>
              <td class="number">{{ item.totalDays }}</td>
              <td class="highlight">{{ item.totalHoursDisplay }}</td>
              <td class="highlight">{{ item.avgDailyHours }}</td>
              <td class="warning" v-if="item.lateDays > 0">{{ item.lateDays }}</td>
              <td v-else class="number">0</td>
              <td class="warning" v-if="item.earlyLeaveDays > 0">{{ item.earlyLeaveDays }}</td>
              <td v-else class="number">0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="no-data">暂无数据</p>
    </div>

    <!-- 员工详细记录 -->
    <div class="section" v-if="selectedEmployee">
      <h3>{{ selectedEmployee.name }} 详细记录</h3>
      <button @click="selectedEmployee = null" class="btn-close">关闭详情</button>
      <div v-if="selectedEmployee.details.length > 0" class="table-wrapper">
        <table class="detail-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>上班时间</th>
              <th>下班时间</th>
              <th>工作时长</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, idx) in selectedEmployee.details" :key="idx">
              <td>{{ detail.date }}</td>
              <td>{{ detail.checkInTime }}</td>
              <td>{{ detail.checkOutTime }}</td>
              <td class="highlight">{{ detail.workHours }}</td>
              <td>
                <span v-if="detail.isLate" class="tag-late">迟到</span>
                <span v-if="detail.isEarlyLeave" class="tag-early">早退</span>
                <span v-if="!detail.isLate && !detail.isEarlyLeave" class="tag-normal">正常</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getTodayWorkHours, getMonthlyWorkHours } from '../api';
import moment from 'moment';

export default {
  name: 'WorkHoursReport',
  setup() {
    const selectedShop = ref('');
    const selectedMonth = ref(moment().format('YYYY-MM'));
    const todayStats = ref([]);
    const monthlyStats = ref([]);
    const selectedEmployee = ref(null);
    const loading = ref(false);

    const fetchData = async () => {
      loading.value = true;
      try {
        // 获取今日数据
        const todayRes = await getTodayWorkHours({
          shopId: selectedShop.value || undefined
        });
        todayStats.value = todayRes.data.stats || [];

        // 获取月度数据
        const monthRes = await getMonthlyWorkHours({
          shopId: selectedShop.value || undefined,
          month: selectedMonth.value
        });
        monthlyStats.value = monthRes.data.stats || [];
      } catch (error) {
        console.error('获取数据失败:', error);
        alert('获取数据失败，请重试');
      } finally {
        loading.value = false;
      }
    };

    const exportExcel = () => {
      // 简单的导出逻辑
      let csv = '员工号,姓名,店铺,工作天数,总工作时长,日均工作时长,迟到次数,早退次数\n';
      
      monthlyStats.value.forEach(item => {
        csv += `${item.employeeNumber},${item.name},${item.shopName},${item.totalDays},${item.totalHoursDisplay},${item.avgDailyHours},${item.lateDays},${item.earlyLeaveDays}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `工作时长统计-${selectedMonth.value}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    onMounted(() => {
      fetchData();
    });

    return {
      selectedShop,
      selectedMonth,
      todayStats,
      monthlyStats,
      selectedEmployee,
      loading,
      fetchData,
      exportExcel
    };
  }
};
</script>

<style scoped>
.work-hours-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 10px;
}

h3 {
  color: #0066cc;
  margin: 20px 0 15px 0;
  font-size: 16px;
}

.controls {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: bold;
  color: #333;
}

.control-group select,
.control-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary,
.btn-secondary,
.btn-close {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-secondary {
  background: #666;
  color: white;
}

.btn-secondary:hover {
  background: #555;
}

.btn-close {
  background: #999;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
}

.btn-close:hover {
  background: #888;
}

.section {
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
}

.table-wrapper {
  overflow-x: auto;
}

.report-table,
.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 14px;
}

.report-table thead,
.detail-table thead {
  background: #f0f0f0;
}

.report-table th,
.detail-table th {
  padding: 12px;
  text-align: left;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.report-table td,
.detail-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

.report-table tbody tr:hover,
.detail-table tbody tr:hover {
  background: #f9f9f9;
}

.report-table tr.未打卡 {
  background: #fff0f0;
}

.report-table tr.已上班 {
  background: #f0f8ff;
}

.report-table tr.已完成 {
  background: #f0fff0;
}

.work-hours {
  color: #0066cc;
  font-weight: bold;
}

.highlight {
  color: #d9534f;
  font-weight: bold;
}

.number {
  text-align: center;
}

.warning {
  color: #ff6b6b;
  font-weight: bold;
  text-align: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.未打卡 {
  background: #ffebee;
  color: #c62828;
}

.status-badge.已上班 {
  background: #e3f2fd;
  color: #1565c0;
}

.status-badge.已完成 {
  background: #e8f5e9;
  color: #2e7d32;
}

.tag-late {
  background: #ffebee;
  color: #c62828;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  margin-right: 4px;
}

.tag-early {
  background: #fff3e0;
  color: #e65100;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  margin-right: 4px;
}

.tag-normal {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}
</style>
