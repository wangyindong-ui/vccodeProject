import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request' // 引入 axios

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  // 从 localStorage 读取缓存的用户信息，避免刷新丢失
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  // 用户的菜单权限列表
  const userMenus = ref(JSON.parse(localStorage.getItem('userMenus') || '[]'))
  // 用户的角色信息
  const userRole = ref(JSON.parse(localStorage.getItem('userRole') || '{}'))

  
  // 登录动作 (对接后端)
  async function login(username, password) {
    try {
      const res = await request.post('/login', { username, password })
      if (res.code === 200) {
        // 提取返回的数据
        const data = res.data || {}
        token.value = data.token || res.token
        userInfo.value = data.userInfo || res.userInfo
        userMenus.value = data.menus || []
        userRole.value = data.role || {}
        
        // 保存到 localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        localStorage.setItem('userMenus', JSON.stringify(userMenus.value))
        localStorage.setItem('userRole', JSON.stringify(userRole.value))
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
    userMenus.value = []
    userRole.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userMenus')
    localStorage.removeItem('userRole')
  }
  
  // 更新个人信息
  async function updateProfile(data) {
    const res = await request.post('/personal/edit', data)
    if (res && res.code === 200) {
      // 更新本地状态
      Object.assign(userInfo.value, data)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
    return res
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

  // 检查用户是否有权限访问某个菜单
  function hasMenuPermission(menuPath) {
    // 如果没有菜单权限数据，默认有权限（向后兼容）
    if (!userMenus.value || userMenus.value.length === 0) {
      return true
    }
    // 检查菜单列表中是否包含该路径
    return userMenus.value.some(menu => menu.path === menuPath || menu.name === menuPath)
  }

  return { 
    token, 
    userInfo, 
    userMenus, 
    userRole, 
    login, 
    logout, 
    updateProfile, 
    register,
    hasMenuPermission
  }
})


// 获取角色列表
export function getRoleList() {
  return request({
    url: '/users/getRoles', // 假设您的后端接口地址是这个
    method: 'get'
  })
}