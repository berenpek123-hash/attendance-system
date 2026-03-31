import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
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

export default api
