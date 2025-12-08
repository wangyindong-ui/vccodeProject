import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request' // 引入 axios

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  // 从 localStorage 读取缓存的用户信息，避免刷新丢失
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  
  // 登录动作 (对接后端)
  async function login(username, password) {
    try {
      const res = await request.post('/login', { username, password })
      if (res.code === 200) {
        token.value = res.token
        userInfo.value = res.userInfo
        
        localStorage.setItem('token', res.token)
        localStorage.setItem('userInfo', JSON.stringify(res.userInfo))
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  // 更新个人信息
  async function updateProfile(data) {
    await request.post('/user/update', data)
    // 更新本地状态
    Object.assign(userInfo.value, data)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

 // 注册动作
  async function register(registerForm) {
    try {
      // 发送注册请求
      const res = await request.post('/register', registerForm)
      // request.js 里的拦截器通常处理了 !200 的情况，但为了保险我们这里也判断一下
      if (res && res.code === 200) {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  return { token, userInfo, login, logout, updateProfile, register } // 记得导出 register
})