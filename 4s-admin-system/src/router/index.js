import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import Login from '../views/Login.vue'

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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 如果去的是登录页 或 注册页，直接放行
  if (to.path === '/login' || to.path === '/register') {
    next()
  } else {
    // 否则检查是否有token
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router