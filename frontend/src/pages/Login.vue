<template>
  <div class="login-container">
    <div class="login-box">
      <h1>👥 员工打卡系统</h1>
      <p class="subtitle">{{ showForgot ? '重置密码' : '登陆管理系统' }}</p>

      <!-- 登陆界面 -->
      <form v-if="!showForgot" @submit.prevent="handleLogin">
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

        <div class="forgot-link">
          <button type="button" @click="showForgot = true; error = ''" class="link-btn">
            忘记密码？
          </button>
        </div>
      </form>

      <!-- 忘记密码界面 -->
      <div v-else>
        <form v-if="!tempPassword" @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label>用户名</label>
            <input 
              v-model="forgotUsername" 
              type="text" 
              placeholder="输入你的用户名"
              autofocus
            >
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>

          <div class="forgot-link">
            <button type="button" @click="backToLogin" class="link-btn">
              ← 返回登陆
            </button>
          </div>
        </form>

        <!-- 临时密码显示 -->
        <div v-if="tempPassword" class="temp-password-box">
          <div class="success-icon">✅</div>
          <h3>密码已重置</h3>
          <p>您的临时密码是：</p>
          <div class="password-display">
            <code>{{ tempPassword }}</code>
            <button type="button" @click="copyPassword" class="btn-copy">
              {{ copied ? '已复制 ✓' : '复制' }}
            </button>
          </div>
          <p class="warning">⚠️ 请用此密码登陆后立即修改密码</p>
          <button type="button" @click="backToLogin" class="btn-login">
            去登陆
          </button>
        </div>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
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
    const showForgot = ref(false);
    const forgotUsername = ref('');
    const tempPassword = ref('');
    const copied = ref(false);

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
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          router.push('/');
        }
      } catch (err) {
        error.value = err.response?.data?.error || '登陆失败，请检查用户名和密码';
      } finally {
        loading.value = false;
      }
    };

    const handleForgotPassword = async () => {
      error.value = '';
      loading.value = true;

      if (!forgotUsername.value.trim()) {
        error.value = '请输入用户名';
        loading.value = false;
        return;
      }

      try {
        const response = await api.post('/auth/forgot-password', {
          username: forgotUsername.value
        });

        if (response.data.success) {
          tempPassword.value = response.data.tempPassword;
        }
      } catch (err) {
        error.value = err.response?.data?.error || '重置失败';
      } finally {
        loading.value = false;
      }
    };

    const copyPassword = async () => {
      try {
        await navigator.clipboard.writeText(tempPassword.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
      } catch {
        // 备用方案
        const input = document.createElement('input');
        input.value = tempPassword.value;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
      }
    };

    const backToLogin = () => {
      showForgot.value = false;
      tempPassword.value = '';
      forgotUsername.value = '';
      error.value = '';
      copied.value = false;
    };

    return {
      username,
      password,
      error,
      loading,
      showForgot,
      forgotUsername,
      tempPassword,
      copied,
      handleLogin,
      handleForgotPassword,
      copyPassword,
      backToLogin
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

.forgot-link {
  text-align: center;
  margin-top: 15px;
}

.link-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  padding: 5px;
  text-decoration: underline;
}

.link-btn:hover {
  color: #764ba2;
}

.temp-password-box {
  text-align: center;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.temp-password-box h3 {
  color: #2e7d32;
  margin: 0 0 15px 0;
  font-size: 20px;
}

.temp-password-box p {
  color: #666;
  margin: 10px 0;
  font-size: 14px;
}

.password-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #667eea;
}

.password-display code {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.btn-copy {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: background 0.3s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #5a6fd6;
}

.warning {
  color: #e65100 !important;
  font-weight: bold;
  font-size: 13px !important;
  margin: 15px 0 20px 0 !important;
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

@media (max-width: 600px) {
  .login-box {
    padding: 30px 20px;
    margin: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .password-display code {
    font-size: 20px;
  }
}
</style>
