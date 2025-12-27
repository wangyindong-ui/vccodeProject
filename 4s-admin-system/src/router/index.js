import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import Login from '../views/Login.vue'
import { ElMessage } from 'element-plus'

const routes = [
  // 1. 登录页
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  // 2. 注册页 (请确保这一段存在)
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'), // 确保文件名大小写一致
    meta: { title: '用户注册' }
  },
  // 3. 主布局 (后台管理)
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页概览' }
      },
      {
        path: '/cars',
        name: 'Car',
        component: () => import('../views/Car.vue'),
        meta: { title: '车库管理' }
      },
      {
        path: '/service',
        name: 'Service',
        component: () => import('../views/Service.vue'),
        meta: { title: '售后维修' }
      },
      {
        path: '/inventory',
        name: 'Inventory',
        component: () => import('../views/Inventory.vue'),
        meta: { title: '配件库存' }
      },
      // --- 新增：字典表管理 ---
      {
        path: '/dictionary',
        name: 'Dictionary',
        component: () => import('../views/Dictionary.vue'),
        meta: { title: '字典表管理' }
      },
      {
        path: '/role',
        name: 'Role',
        component: () => import('../views/Role.vue'),
        meta: { title: '角色管理' }
      },
      // --- 新增：角色菜单权限管理（仅管理员可见）---
      {
        path: '/role-menu-permission',
        name: 'RoleMenuPermission',
        component: () => import('../views/RoleMenuPermission.vue'),
        meta: { title: '权限管理', requiresAdmin: true }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: '/orders',
        name: 'OrderList',
        component: () => import('../views/OrderList.vue'),
        meta: { title: '订单管理' }
      },
            // --- 新增试驾预约路由 START ---
      {
        path: '/test-drive',
        name: 'TestDrive',
        component: () => import('../views/TestDrive.vue'),
        meta: { title: '试驾预约管理' }
      },

          // --- 新增监控路由 ---
      {
        path: '/monitor',
        name: 'CameraPlayer',
        component: () => import('../views/CameraPlayer.vue'),
        meta: { title: '实时监控' }
      },
      // --- 维修师傅工作台 ---
      {
        path: '/mechanic-workbench',
        name: 'MechanicWorkbench',
        component: () => import('../views/MechanicWorkbench.vue'),
        meta: { title: '我的工作台' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 缓存解析后的用户菜单，避免每次路由跳转都解析 JSON
let cachedUserMenus = null
let cachedMenusVersion = null

// 获取用户菜单（带缓存）
const getUserMenus = () => {
  const storedMenus = localStorage.getItem('userMenus')
  // 如果缓存版本不一致，重新解析
  if (cachedMenusVersion !== storedMenus) {
    cachedUserMenus = JSON.parse(storedMenus || '[]')
    cachedMenusVersion = storedMenus
  }
  return cachedUserMenus
}

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果去的是登录页或注册页，直接放行
  if (to.path === '/login' || to.path === '/register') {
    // 清除菜单缓存（登录/注册时可能需要重新获取）
    cachedUserMenus = null
    cachedMenusVersion = null
    next()
    return
  }
  
  // 检查是否有token
  if (!token) {
    next('/login')
    return
  }
  
  // 已登录用户，检查菜单权限（使用缓存）
  const userMenus = getUserMenus()
  
  // 如果用户没有菜单权限数据，默认允许访问（向后兼容）
  if (userMenus.length === 0) {
    next()
    return
  }
  
  // 个人中心始终允许访问
  if (to.path === '/profile') {
    next()
    return
  }
  
  // 如果访问根路径或首页，重定向到用户有权限的第一个页面
  if (to.path === '/' || to.path === '/dashboard') {
    // 检查用户是否有首页权限
    const hasDashboardPermission = userMenus.some(menu => menu.path === '/dashboard')
    if (hasDashboardPermission) {
      next()
    } else {
      // 没有首页权限，跳转到第一个有权限的页面
      if (userMenus.length > 0) {
        next(userMenus[0].path)
      } else {
        ElMessage.warning('您没有任何菜单权限')
        next('/profile')
      }
    }
    return
  }
  
  // 检查用户是否有权限访问该路由
  const hasPermission = userMenus.some(menu => {
    return menu.path === to.path || to.path.startsWith(menu.path + '/')
  })
  
  if (hasPermission) {
    next()
  } else {
    ElMessage.warning('您没有权限访问该页面')
    // 重定向到用户有权限的第一个页面
    if (userMenus.length > 0) {
      next(userMenus[0].path)
    } else {
      next('/profile')
    }
  }
})

export default router