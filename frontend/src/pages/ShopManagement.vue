<template>
  <div class="shop-management-container">
    <h2>店铺管理</h2>

    <div class="controls">
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        {{ showAddForm ? '取消' : '+ 添加店铺' }}
      </button>
    </div>

    <!-- 添加店铺表单 -->
    <div v-if="showAddForm" class="form-card">
      <h3>添加新店铺</h3>
      <form @submit.prevent="addShop">
        <div class="form-group">
          <label>店铺名称 *</label>
          <input 
            v-model="newShop.name" 
            type="text" 
            placeholder="请输入店铺名称"
            required
          >
        </div>
        <div class="form-group">
          <label>店铺地址</label>
          <input 
            v-model="newShop.address" 
            type="text" 
            placeholder="请输入店铺地址"
          >
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-success">保存</button>
          <button type="button" @click="showAddForm = false" class="btn-cancel">取消</button>
        </div>
        <p v-if="formError" class="error-message">{{ formError }}</p>
      </form>
    </div>

    <!-- 店铺列表 -->
    <div class="section">
      <h3>店铺列表</h3>
      <div v-if="shops.length > 0" class="shops-grid">
        <div v-for="shop in shops" :key="shop.id" class="shop-card">
          <div class="shop-header">
            <h4>{{ shop.name }}</h4>
            <div class="shop-actions">
              <button @click="editShop(shop)" class="btn-edit" title="编辑">✏️</button>
              <button @click="deleteShop(shop.id)" class="btn-delete" title="删除">🗑️</button>
            </div>
          </div>
          <div class="shop-info">
            <p><strong>地址：</strong>{{ shop.address || '-' }}</p>
            <p><strong>营业时间：</strong>{{ shop.check_in_time || '09:00' }} ~ {{ shop.check_out_time || '18:00' }}</p>
            <p><strong>员工数：</strong><span class="employee-count">{{ shop.employeeCount || 0 }}</span></p>
          </div>
        </div>
      </div>
      <p v-else class="no-data">暂无店铺数据</p>
    </div>

    <!-- 提示消息 -->
    <div v-if="toast" class="toast" :class="toast.type">{{ toast.message }}</div>

    <!-- 编辑店铺模态框 -->
    <div v-if="editingShop" class="modal-overlay">
      <div class="modal-content">
        <h3>编辑店铺</h3>
        <form @submit.prevent="updateShop">
          <div class="form-group">
            <label>店铺名称 *</label>
            <input 
              v-model="editingShop.name" 
              type="text" 
              placeholder="请输入店铺名称"
              required
            >
          </div>
          <div class="form-group">
            <label>店铺地址</label>
            <input 
              v-model="editingShop.address" 
              type="text" 
              placeholder="请输入店铺地址"
            >
          </div>
          <div class="form-group">
            <label>上班时间</label>
            <input 
              v-model="editingShop.check_in_time" 
              type="time" 
              placeholder="09:00"
            >
          </div>
          <div class="form-group">
            <label>下班时间</label>
            <input 
              v-model="editingShop.check_out_time" 
              type="time" 
              placeholder="18:00"
            >
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-success" :disabled="saving">{{ saving ? '保存中...' : '保存修改' }}</button>
            <button type="button" @click="editingShop = null" class="btn-cancel">取消</button>
          </div>
          <p v-if="editError" class="error-message">{{ editError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../api';

export default {
  name: 'ShopManagement',
  setup() {
    const shops = ref([]);
    const showAddForm = ref(false);
    const editingShop = ref(null);
    const loading = ref(false);
    const saving = ref(false);
    const formError = ref('');
    const editError = ref('');
    const toast = ref(null);

    const newShop = ref({
      name: '',
      address: ''
    });

    const fetchShops = async () => {
      loading.value = true;
      try {
        const response = await api.get('/shops');
        shops.value = response.data || [];
      } catch (error) {
        console.error('获取店铺列表失败:', error);
        alert('获取店铺列表失败');
      } finally {
        loading.value = false;
      }
    };

    const showToast = (message, type = 'success') => {
      toast.value = { message, type };
      setTimeout(() => {
        toast.value = null;
      }, 3000);
    };

    const addShop = async () => {
      if (!newShop.value.name.trim()) {
        formError.value = '店铺名称不能为空';
        return;
      }

      try {
        formError.value = '';
        const response = await api.post('/shops', {
          name: newShop.value.name,
          address: newShop.value.address
        });

        if (response.data.success) {
          showToast('店铺添加成功');
          newShop.value = { name: '', address: '' };
          showAddForm.value = false;
          await fetchShops();
        }
      } catch (error) {
        formError.value = error.response?.data?.error || '添加失败';
      }
    };

    const editShop = (shop) => {
      editingShop.value = { ...shop };
      editError.value = '';
    };

    const updateShop = async () => {
      if (!editingShop.value.name.trim()) {
        editError.value = '店铺名称不能为空';
        return;
      }

      saving.value = true;
      try {
        editError.value = '';
        const response = await api.put(`/shops/${editingShop.value.id}`, {
          name: editingShop.value.name,
          address: editingShop.value.address,
          check_in_time: editingShop.value.check_in_time || '09:00',
          check_out_time: editingShop.value.check_out_time || '18:00'
        });

        if (response.data.success) {
          showToast('店铺信息已更新');
          editingShop.value = null;
          await fetchShops();
        }
      } catch (error) {
        editError.value = error.response?.data?.error || '更新失败';
      } finally {
        saving.value = false;
      }
    };

    const deleteShop = async (shopId) => {
      if (!confirm('确定要删除这个店铺吗？')) {
        return;
      }

      try {
        const response = await api.delete(`/shops/${shopId}`);
        if (response.data.success) {
          showToast('店铺已删除');
          await fetchShops();
        }
      } catch (error) {
        showToast(error.response?.data?.error || '删除失败', 'error');
      }
    };

    onMounted(() => {
      fetchShops();
    });

    return {
      shops,
      showAddForm,
      editingShop,
      loading,
      saving,
      formError,
      editError,
      toast,
      newShop,
      addShop,
      editShop,
      updateShop,
      deleteShop,
      fetchShops,
      showToast
    };
  }
};
</script>

<style scoped>
.shop-management-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
}

h4 {
  margin: 0;
  color: #333;
}

.controls {
  margin-bottom: 20px;
}

.btn-primary,
.btn-success,
.btn-cancel,
.btn-edit,
.btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-edit {
  background: #ffc107;
  padding: 4px 8px;
  font-size: 12px;
  margin-right: 4px;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-delete {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
}

.btn-delete:hover {
  background: #c82333;
}

.form-card {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 5px rgba(0, 102, 204, 0.3);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.section {
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

.shops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.shop-card {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 15px;
  background: white;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shop-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.shop-actions {
  display: flex;
  gap: 5px;
}

.shop-info {
  color: #666;
  font-size: 14px;
}

.shop-info p {
  margin: 8px 0;
}

.employee-count {
  background: #e3f2fd;
  color: #0066cc;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 5px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .shops-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
