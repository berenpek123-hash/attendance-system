<template>
  <div class="employee-container">
    <div class="employee-card">
      <h2>👥 员工管理</h2>
      
      <div class="management-toolbar">
        <div class="filter-group">
          <label>选择店铺：</label>
          <select v-model="selectedShopId" @change="loadEmployees">
            <option value="">全部店铺</option>
            <option v-for="shop in shops" :key="shop.id" :value="shop.id">
              {{ shop.name }}
            </option>
          </select>
        </div>
        
        <button @click="showAddForm = !showAddForm" class="btn btn-secondary">
          {{ showAddForm ? '关闭' : '+ 添加员工' }}
        </button>
      </div>

      <!-- 添加员工表单 -->
      <div v-if="showAddForm" class="add-form">
        <h3>添加新员工</h3>
        <div class="form-group">
          <label>员工姓名：</label>
          <input v-model="newEmployee.name" type="text" placeholder="输入员工姓名">
        </div>
        
        <div class="form-group">
          <label>员工号：</label>
          <input v-model="newEmployee.employee_number" type="text" placeholder="如: EMP031">
        </div>
        
        <div class="form-group">
          <label>店铺：</label>
          <select v-model="newEmployee.shop_id">
            <option value="">选择店铺</option>
            <option v-for="shop in shops" :key="shop.id" :value="shop.id">
              {{ shop.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>电话：</label>
          <input v-model="newEmployee.phone" type="tel" placeholder="输入手机号">
        </div>
        
        <button @click="addEmployee" class="btn btn-primary">添加</button>
      </div>

      <!-- 员工列表 -->
      <div class="section">
        <h3>员工列表 ({{ employees.length }})</h3>
        
        <div class="search-bar">
          <input 
            v-model="searchText" 
            type="text"
            placeholder="搜索员工名称或员工号..."
            @input="filterEmployees"
          >
        </div>

        <table class="table" v-if="filteredEmployees.length > 0">
          <thead>
            <tr>
              <th>序号</th>
              <th>员工姓名</th>
              <th>员工号</th>
              <th>店铺</th>
              <th>电话</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(emp, index) in filteredEmployees" :key="emp.id">
              <td>{{ index + 1 }}</td>
              <td>{{ emp.name }}</td>
              <td>{{ emp.employee_number }}</td>
              <td>{{ emp.shop_name }}</td>
              <td>{{ emp.phone || '-' }}</td>
              <td>
                <span :class="['status-badge', emp.status]">
                  {{ emp.status === 'active' ? '在职' : '离职' }}
                </span>
              </td>
              <td>
                <button @click="generateQRCode(emp)" class="btn-sm btn-primary">二维码</button>
                <button v-if="emp.status === 'active'" @click="deactivateEmployee(emp.id)" class="btn-sm btn-danger">离职</button>
                <button @click="deleteEmployee(emp.id)" class="btn-sm btn-delete">删除</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <p>没有找到员工数据</p>
        </div>
      </div>

      <!-- 二维码弹窗 -->
      <div v-if="qrModalEmployee" class="modal-overlay" @click="qrModalEmployee = null">
        <div class="modal" @click.stop>
          <h3>员工二维码</h3>
          <p class="qr-employee-info">{{ qrModalEmployee.name }} ({{ qrModalEmployee.employee_number }})</p>
          <div id="qr-code-container"></div>
          <button @click="qrModalEmployee = null" class="btn btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getEmployees, addEmployee as apiAddEmployee, updateEmployee as apiUpdateEmployee, deleteEmployee as apiDeleteEmployee, getShops } from '../api'

export default {
  name: 'EmployeeManagement',
  setup() {
    const employees = ref([])
    const filteredEmployees = ref([])
    const shops = ref([])
    const selectedShopId = ref('')
    const showAddForm = ref(false)
    const searchText = ref('')
    const qrModalEmployee = ref(null)
    
    const newEmployee = ref({
      name: '',
      employee_number: '',
      shop_id: '',
      phone: ''
    })

    const loadEmployees = async () => {
      try {
        const res = await getEmployees(selectedShopId.value)
        employees.value = res.data
        filteredEmployees.value = res.data
      } catch (error) {
        console.error('加载员工列表失败:', error)
      }
    }

    const loadShops = async () => {
      try {
        const res = await getShops()
        shops.value = res.data
      } catch (error) {
        console.error('加载店铺列表失败:', error)
      }
    }

    const filterEmployees = () => {
      if (!searchText.value.trim()) {
        filteredEmployees.value = employees.value
      } else {
        const query = searchText.value.toLowerCase()
        filteredEmployees.value = employees.value.filter(emp =>
          emp.name.toLowerCase().includes(query) ||
          emp.employee_number.toLowerCase().includes(query)
        )
      }
    }

    const addEmployee = async () => {
      if (!newEmployee.value.name || !newEmployee.value.employee_number || !newEmployee.value.shop_id) {
        alert('请填写必填字段')
        return
      }

      try {
        await apiAddEmployee({
          name: newEmployee.value.name,
          employee_number: newEmployee.value.employee_number,
          shop_id: parseInt(newEmployee.value.shop_id),
          phone: newEmployee.value.phone
        })

        alert('员工添加成功！')
        
        // 重置表单
        newEmployee.value = {
          name: '',
          employee_number: '',
          shop_id: '',
          phone: ''
        }
        showAddForm.value = false
        
        // 重新加载列表
        loadEmployees()
      } catch (error) {
        alert('添加失败: ' + (error.response?.data?.error || error.message))
      }
    }

    const deactivateEmployee = async (id) => {
      if (confirm('确定要将该员工设为离职状态吗？')) {
        try {
          // 获取员工信息后更新
          const emp = employees.value.find(e => e.id === id)
          if (emp) {
            await apiUpdateEmployee(id, { 
              name: emp.name,
              phone: emp.phone,
              status: 'inactive' 
            })
            alert('员工已设为离职')
            loadEmployees()
          }
        } catch (error) {
          alert('操作失败: ' + error.message)
        }
      }
    }

    const deleteEmployee = async (id) => {
      const emp = employees.value.find(e => e.id === id)
      if (!emp) return

      if (confirm(`确定要永久删除员工 "${emp.name}" 吗？\n该员工的所有打卡记录也将被删除，此操作无法恢复！`)) {
        try {
          await apiDeleteEmployee(id)
          alert('员工已删除')
          loadEmployees()
        } catch (error) {
          alert('删除失败: ' + (error.response?.data?.error || error.message))
        }
      }
    }

    const generateQRCode = async (emp) => {
      qrModalEmployee.value = emp
      
      // 等待DOM更新后生成二维码
      setTimeout(() => {
        const container = document.getElementById('qr-code-container')
        if (container) {
          container.innerHTML = ''
          
          // 简单的二维码生成（使用第三方API）
          const qrData = `ATTENDANCE_${emp.id}`
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
          
          const img = document.createElement('img')
          img.src = qrUrl
          img.style.maxWidth = '100%'
          img.style.border = '2px solid #ddd'
          img.style.padding = '10px'
          img.style.borderRadius = '4px'
          
          container.appendChild(img)
        }
      }, 100)
    }

    onMounted(() => {
      loadShops()
      loadEmployees()
    })

    return {
      employees,
      filteredEmployees,
      shops,
      selectedShopId,
      showAddForm,
      searchText,
      qrModalEmployee,
      newEmployee,
      loadEmployees,
      filterEmployees,
      addEmployee,
      deactivateEmployee,
      deleteEmployee,
      generateQRCode
    }
  }
}
</script>

<style scoped>
.employee-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.management-toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
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

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  margin-right: 0.3rem;
}

.add-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.add-form h3 {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  max-width: 400px;
}

.section {
  margin-top: 2rem;
}

.section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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
}

.table tbody tr:hover {
  background: #fafafa;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #e2e3e5;
  color: #383d41;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.modal h3 {
  margin-bottom: 0.5rem;
}

.qr-employee-info {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

#qr-code-container {
  text-align: center;
  margin: 1.5rem 0;
}

@media (max-width: 768px) {
  .management-toolbar {
    flex-direction: column;
    align-items: flex-start;
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
