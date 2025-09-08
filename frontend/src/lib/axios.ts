import axios from 'axios'

const isDev = import.meta.env.DEV

// Dev'de Vite proxy kullan: /api
// Prod'da .env.production'dan al (ör: https://api.domain.com)
const baseURL = isDev
  ? (import.meta.env.VITE_API_ADDRESS || '/api')
  : (import.meta.env.VITE_API_ADDRESS || 'https://api.example.com')

export const api = axios.create({
  baseURL,            // Örn: "/api"
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