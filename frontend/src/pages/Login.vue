<template>
  <div class="login-container">
    <div class="login-box">
      <h1>👥 员工打卡系统</h1>
      <p class="subtitle">登陆管理系统</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="输入用户名"
            @keyup.enter="handleLogin"
            autofocus
          >
        </div>

        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="输入密码"
            @keyup.enter="handleLogin"
          >
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登陆中...' : '登陆' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>

      <div class="help-text">
        <p>默认账号: <strong>admin</strong></p>
        <p>默认密码: <strong>123456</strong></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);

    const handleLogin = async () => {
      error.value = '';
      loading.value = true;

      if (!username.value.trim()) {
        error.value = '请输入用户名';
        loading.value = false;
        return;
      }

      if (!password.value) {
        error.value = '请输入密码';
        loading.value = false;
        return;
      }

      try {
        const response = await api.post('/auth/login', {
          username: username.value,
          password: password.value
        });

        if (response.data.success) {
          // 保存 token
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // 跳转到首页
          router.push('/');
        }
      } catch (err) {
        error.value = err.response?.data?.error || '登陆失败，请检查用户名和密码';
        console.error('登陆错误:', err);
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      error,
      loading,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.login-box {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
  text-align: center;
}

.subtitle {
  margin: 0 0 30px 0;
  color: #999;
  text-align: center;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 5px;
  font-size: 14px;
  text-align: center;
}

.help-text {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #666;
}

.help-text p {
  margin: 5px 0;
}

.help-text strong {
  color: #333;
}

@media (max-width: 600px) {
  .login-box {
    padding: 30px 20px;
    margin: 20px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
