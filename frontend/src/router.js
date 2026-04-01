import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/Login.vue'
import Dashboard from './pages/Dashboard.vue'
import Checkin from './pages/Checkin.vue'
import DailyReport from './pages/DailyReport.vue'
import MonthlyReport from './pages/MonthlyReport.vue'
import EmployeeManagement from './pages/EmployeeManagement.vue'
import WorkHoursReport from './pages/WorkHoursReport.vue'
import ShopManagement from './pages/ShopManagement.vue'
import Settings from './pages/Settings.vue'

const routes = [
  { path: '/login', component: Login, meta: { title: '登陆', requiresAuth: false } },
  { path: '/checkin', component: Checkin, meta: { title: '员工打卡', requiresAuth: false } },
  { path: '/', component: Dashboard, meta: { title: '仪表盘', requiresAuth: true } },
  { path: '/daily-report', component: DailyReport, meta: { title: '日报', requiresAuth: true } },
  { path: '/monthly-report', component: MonthlyReport, meta: { title: '月报', requiresAuth: true } },
  { path: '/work-hours', component: WorkHoursReport, meta: { title: '工作时长', requiresAuth: true } },
  { path: '/shops', component: ShopManagement, meta: { title: '店铺管理', requiresAuth: true } },
  { path: '/employees', component: EmployeeManagement, meta: { title: '员工管理', requiresAuth: true } },
  { path: '/settings', component: Settings, meta: { title: '系统设置', requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? to.meta.title + ' - 员工打卡系统' : '员工打卡系统'
  
  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false;
  const isLoggedIn = !!localStorage.getItem('token');

  if (requiresAuth && !isLoggedIn) {
    // 需要登陆但未登陆，重定向到登陆页
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    // 已登陆，访问登陆页则重定向到首页
    next('/');
  } else {
    next();
  }
})

export default router
