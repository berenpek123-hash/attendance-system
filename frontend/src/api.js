import axios from 'axios'

// 自动检测环境
const getAPIBase = () => {
  if (import.meta.env.PROD) {
    // 生产环境：使用 Render 后端 URL
    return 'https://attendance-system-backend-dmgp.onrender.com/api'
  } else {
    // 开发环境：使用本地代理
    return '/api'
  }
}

const API_BASE = getAPIBase()

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  
  // 打卡 API 不需要 token
  const publicEndpoints = ['/attendance/checkin', '/attendance/status']
  const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint))
  
  // 其他 API 需要 token
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, error => {
  return Promise.reject(error)
})

// 添加响应拦截器，处理未认证
api.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response?.status === 401) {
    // token 过期或无效，清除本地数据并重定向到登陆
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

// 打卡相关
export const checkin = (employeeId) => {
  return api.post('/attendance/checkin', { employeeId })
}

export const getCheckinStatus = (employeeId) => {
  return api.get(`/attendance/status/${employeeId}`)
}

// 员工相关
export const getEmployees = (shopId) => {
  const params = shopId ? { shopId } : {}
  return api.get('/employees', { params })
}

export const getEmployee = (id) => {
  return api.get(`/employees/${id}`)
}

export const addEmployee = (data) => {
  return api.post('/employees', data)
}

export const updateEmployee = (id, data) => {
  return api.put(`/employees/${id}`, data)
}

export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`)
}

// 店铺相关
export const getShops = () => {
  return api.get('/shops')
}

// 报表相关
export const getDailyReport = (date, shopId) => {
  const params = { date }
  if (shopId) params.shopId = shopId
  return api.get('/reports/daily', { params })
}

export const getMonthlyReport = (month, shopId) => {
  const params = { month }
  if (shopId) params.shopId = shopId
  return api.get('/reports/monthly', { params })
}

export const getEmployeeStats = (employeeId, month) => {
  const params = {}
  if (month) params.month = month
  return api.get(`/reports/employee/${employeeId}`, { params })
}

// 工作时长相关
export const getTodayWorkHours = (params = {}) => {
  return api.get('/reports/work-hours/today', { params })
}

export const getMonthlyWorkHours = (params = {}) => {
  return api.get('/reports/work-hours', { params })
}

// 认证相关
export const login = (username, password) => {
  return api.post('/auth/login', { username, password })
}

export const forgotPassword = (username) => {
  return api.post('/auth/forgot-password', { username })
}

export const changePassword = (oldPassword, newPassword) => {
  return api.post('/auth/change-password', { oldPassword, newPassword })
}

export default api
