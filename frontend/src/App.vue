<template>
  <div class="app-container">
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-content">
        <h1 class="logo">📋 员工打卡系统</h1>
        <ul class="nav-menu">
          <li><router-link to="/" :class="{ active: $route.path === '/' }">仪表盘</router-link></li>
          <li><router-link to="/checkin" :class="{ active: $route.path === '/checkin' }">打卡</router-link></li>
          <li><router-link to="/daily-report" :class="{ active: $route.path === '/daily-report' }">日报</router-link></li>
          <li><router-link to="/monthly-report" :class="{ active: $route.path === '/monthly-report' }">月报</router-link></li>
          <li><router-link to="/work-hours" :class="{ active: $route.path === '/work-hours' }">工作时长</router-link></li>
          <li><router-link to="/shops" :class="{ active: $route.path === '/shops' }">店铺管理</router-link></li>
          <li><router-link to="/employees" :class="{ active: $route.path === '/employees' }">员工管理</router-link></li>
        </ul>
        <div class="nav-user">
          <span class="username">{{ username }}</span>
          <router-link to="/settings" class="nav-link">⚙️ 设置</router-link>
          <button @click="handleLogout" class="nav-link logout-btn">🚪 退出</button>
        </div>
      </div>
    </nav>
    
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const username = ref('')
    
    const isLoggedIn = computed(() => {
      return !!localStorage.getItem('token')
    })

    onMounted(() => {
      // 获取用户信息
      const user = localStorage.getItem('user')
      if (user) {
        username.value = JSON.parse(user).username
      }

      // 检查API连接
      fetch('http://localhost:3000/api/health')
        .catch(err => {
          console.error('后端服务未连接', err)
        })
    })

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    return {
      isLoggedIn,
      username,
      handleLogout
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-menu a:hover,
.nav-menu a.active {
  background: rgba(255,255,255,0.2);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.username {
  color: white;
  font-size: 0.8rem;
  white-space: nowrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255,255,255,0.2);
}

.logout-btn {
  background: rgba(255,0,0,0.3);
}

.logout-btn:hover {
  background: rgba(255,0,0,0.5);
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 2rem;
}

@media (max-width: 1024px) {
  .nav-menu a {
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .nav-link {
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .username {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .nav-menu {
    gap: 0.3rem;
    font-size: 0.8rem;
    width: 100%;
  }
  
  .nav-user {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>
