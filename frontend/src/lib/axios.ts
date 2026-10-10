import axios from 'axios'
import { API_BASE_URL } from '@/utils/url'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
})

// İsteğe token eklemek için interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 Yetkisiz erişim / token zaman aşımı yakalayıcı
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common.Authorization
    }
    return Promise.reject(error)
  }
)