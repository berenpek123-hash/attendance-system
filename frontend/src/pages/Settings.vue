<template>
  <div class="settings-container">
    <h2>⚙️ 系统设置</h2>

    <div class="settings-card">
      <h3>修改密码</h3>
      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label>旧密码</label>
          <input 
            v-model="oldPassword" 
            type="password" 
            placeholder="输入当前密码"
          >
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input 
            v-model="newPassword" 
            type="password" 
            placeholder="输入新密码（至少6位）"
          >
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="再次输入新密码"
          >
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '修改中...' : '修改密码' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </div>

    <div class="settings-card">
      <h3>账户信息</h3>
      <div class="user-info">
        <p><strong>用户名：</strong> {{ user?.username }}</p>
        <p><strong>角色：</strong> {{ user?.role }}</p>
      </div>
      <button @click="handleLogout" class="btn-danger">退出登陆</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

export default {
  name: 'Settings',
  setup() {
    const router = useRouter();
    const oldPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const error = ref('');
    const success = ref('');
    const loading = ref(false);
    const user = ref(null);

    onMounted(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
        user.value = JSON.parse(userData);
      }
    });

    const handleChangePassword = async () => {
      error.value = '';
      success.value = '';

      if (!oldPassword.value) {
        error.value = '请输入旧密码';
        return;
      }

      if (!newPassword.value) {
        error.value = '请输入新密码';
        return;
      }

      if (newPassword.value.length < 6) {
        error.value = '新密码至少 6 位';
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        error.value = '新密码输入不一致';
        return;
      }

      if (oldPassword.value === newPassword.value) {
        error.value = '新密码不能与旧密码相同';
        return;
      }

      loading.value = true;

      try {
        const token = localStorage.getItem('token');
        const response = await api.post('/auth/change-password', {
          oldPassword: oldPassword.value,
          newPassword: newPassword.value
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          success.value = '密码已修改，请重新登陆';
          oldPassword.value = '';
          newPassword.value = '';
          confirmPassword.value = '';

          setTimeout(() => {
            handleLogout();
          }, 2000);
        }
      } catch (err) {
        error.value = err.response?.data?.error || '修改密码失败';
        console.error('修改密码错误:', err);
      } finally {
        loading.value = false;
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    };

    return {
      oldPassword,
      newPassword,
      confirmPassword,
      error,
      success,
      loading,
      user,
      handleChangePassword,
      handleLogout
    };
  }
};
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 10px;
}

.settings-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #0066cc;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
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

.btn-primary {
  background: #0066cc;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #0052a3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-danger:hover {
  background: #c82333;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 14px;
}

.user-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.user-info p {
  margin: 8px 0;
  color: #333;
}

.user-info strong {
  color: #0066cc;
}
</style>
