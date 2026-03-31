import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import Checkin from './pages/Checkin.vue'
import DailyReport from './pages/DailyReport.vue'
import MonthlyReport from './pages/MonthlyReport.vue'
import EmployeeManagement from './pages/EmployeeManagement.vue'

const routes = [
  { path: '/', component: Dashboard, meta: { title: '仪表盘' } },
  { path: '/checkin', component: Checkin, meta: { title: '员工打卡' } },
  { path: '/daily-report', component: DailyReport, meta: { title: '日报' } },
  { path: '/monthly-report', component: MonthlyReport, meta: { title: '月报' } },
  { path: '/employees', component: EmployeeManagement, meta: { title: '员工管理' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? to.meta.title + ' - 员工打卡系统' : '员工打卡系统'
  next()
})

export default router
