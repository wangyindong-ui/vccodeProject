<template>
  <el-container class="layout-container chinese-theme">
    <!-- 左侧侧边栏 -->
    <el-aside :width="isMobile ? '0' : '220px'" class="chinese-aside" :class="{ 'mobile-hidden': isMobile && !mobileMenuOpen }">
      <div class="logo">
        <div class="stamp-icon">
          <el-icon>
            <Van />
          </el-icon>
        </div>
        <span class="logo-text">4S · 雅集</span>
      </div>

      <el-menu router :default-active="$route.path" background-color="transparent" text-color="#bdc3c7"
        active-text-color="#F1C40F" class="chinese-menu" @select="handleMenuSelect">
        <!-- 动态渲染菜单项，根据用户权限显示 -->
        <el-menu-item 
          v-for="menuItem in availableMenus" 
          :key="menuItem.path" 
          :index="menuItem.path"
        >
          <el-icon>
            <component :is="menuItem.icon" />
          </el-icon>
          <span>{{ menuItem.title }}</span>
        </el-menu-item>
      </el-menu>

      <!-- 侧边栏底部云纹装饰 -->
      <div class="aside-footer-pattern"></div>
    </el-aside>

    <!-- 移动端菜单抽屉 -->
    <el-drawer
      v-model="mobileMenuOpen"
      direction="ltr"
      :size="280"
      :show-close="false"
      class="mobile-drawer"
    >
      <template #header>
        <div class="mobile-logo">
          <div class="stamp-icon">
            <el-icon>
              <Van />
            </el-icon>
          </div>
          <span class="logo-text">4S · 雅集</span>
        </div>
      </template>
      <el-menu router :default-active="$route.path" background-color="transparent" text-color="#2C3E50"
        active-text-color="#C0392B" @select="handleMobileMenuSelect">
        <el-menu-item 
          v-for="menuItem in availableMenus" 
          :key="menuItem.path" 
          :index="menuItem.path"
        >
          <el-icon>
            <component :is="menuItem.icon" />
          </el-icon>
          <span>{{ menuItem.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 右侧主体内容 -->
    <el-container>
      <!-- 顶部 Header -->
      <el-header class="chinese-header">
        <div class="header-left">
          <!-- 移动端菜单按钮 -->
          <el-button 
            v-if="isMobile" 
            class="mobile-menu-btn" 
            :icon="MenuIcon" 
            @click="toggleMobileMenu"
            circle
          />
          <!-- 装饰竖线 -->
          <div class="vertical-divider" v-if="!isMobile"></div>
          <span class="page-title">{{ $route.meta.title }}</span>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link user-link">
              <div class="avatar-frame">
                <el-avatar :size="isMobile ? 28 : 30" :src="userStore.userInfo.avatar" />
              </div>
              <span class="username" v-if="!isMobile">{{ userStore.userInfo.name || '掌柜' }}</span>
              <el-icon class="el-icon--right" v-if="!isMobile"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="chinese-dropdown">
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="chinese-main">
        <!-- 路由视图（使用 keep-alive 缓存已访问的页面，提升切换速度）-->
        <router-view v-slot="{ Component }">
          <keep-alive :max="10">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { onMounted, computed, ref, onUnmounted } from 'vue'
import { API_BASE_URL } from '../utils/request'
import { 
  Van, Odometer, Tools, Box, Timer, Notebook, ArrowDown, Tickets, 
  VideoCamera, Setting, Key, Menu as MenuIcon, Document, User, Coin,
  Monitor, Calendar, Management
} from '@element-plus/icons-vue'

// 初始化路由和状态仓库
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式状态
const isMobile = ref(false)
const mobileMenuOpen = ref(false)

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileMenuOpen.value = false
  }
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 处理菜单选择(PC端)
const handleMenuSelect = () => {
  // PC端不需要特殊处理
}

// 处理移动端菜单选择
const handleMobileMenuSelect = () => {
  mobileMenuOpen.value = false
}

// 所有可用的菜单配置（包含图标映射）
const allMenus = [
  { path: '/dashboard', name: 'Dashboard', title: '首页概览', icon: 'Odometer' },
  { path: '/orders', name: 'OrderList', title: '订单管理', icon: 'Tickets' },
  { path: '/cars', name: 'Car', title: '车库管理', icon: 'Van' },
  { path: '/service', name: 'Service', title: '售后维修', icon: 'Tools' },
  { path: '/inventory', name: 'Inventory', title: '配件库存', icon: 'Box' },
  { path: '/test-drive', name: 'TestDrive', title: '试驾预约', icon: 'Timer' },
  { path: '/dictionary', name: 'Dictionary', title: '字典管理', icon: 'Notebook' },
  { path: '/role', name: 'Role', title: '角色管理', icon: 'Setting' },
  { path: '/role-menu-permission', name: 'RoleMenuPermission', title: '角色菜单权限', icon: 'Key' },
  { path: '/monitor', name: 'CameraPlayer', title: '实时监控', icon: 'VideoCamera' },
  { path: '/mechanic-workbench', name: 'MechanicWorkbench', title: '我的工作台', icon: 'Tools' },
  { path: '/profile', name: 'Profile', title: '个人中心', icon: 'User' }
]

// 图标组件映射
const iconComponents = {
  Van, Odometer, Tools, Box, Timer, Notebook, Tickets, VideoCamera, 
  Setting, Key, Menu: MenuIcon, Document, User, Coin, Monitor, Calendar, Management
}

// 根据用户权限过滤可用菜单
const availableMenus = computed(() => {
  const userMenus = userStore.userMenus || []
  
  // 如果用户没有菜单权限数据，默认显示所有菜单（向后兼容）
  if (userMenus.length === 0) {
    return allMenus.map(menu => ({
      ...menu,
      icon: iconComponents[menu.icon] || MenuIcon
    }))
  }
  
  // 根据用户的菜单权限筛选
  const availableMenuList = []
  for (const userMenu of userMenus) {
    const menuConfig = allMenus.find(m => m.path === userMenu.path || m.name === userMenu.name)
    if (menuConfig) {
      availableMenuList.push({
        ...menuConfig,
        title: userMenu.title || menuConfig.title, // 优先使用后端返回的标题
        icon: iconComponents[userMenu.icon || menuConfig.icon] || MenuIcon
      })
    }
  }
  
  // 按照sort字段排序（如果有）
  availableMenuList.sort((a, b) => {
    const aMenu = userMenus.find(m => m.path === a.path)
    const bMenu = userMenus.find(m => m.path === b.path)
    return (aMenu?.sort || 0) - (bMenu?.sort || 0)
  })
  
  return availableMenuList
})

// 判断是否是管理员
const isAdmin = computed(() => {
  try {
    const role = userStore.userInfo?.role || userStore.userInfo?.roleName || ''
    return role === '管理员' || role === 'admin' || role === 'ADMIN' || role === 'administrator'
  } catch (e) {
    return false
  }
})

// 判断是否是维修师傅
const isMechanic = computed(() => {
  try {
    const role = userStore.userInfo?.role || userStore.userInfo?.roleName || ''
    return role === '维修师傅' || role === 'serviceMan' || role.includes('维修')
  } catch (e) {
    return false
  }
})

// 头像加载标记，避免重复加载
let avatarLoaded = false

// 加载用户头像（带缓存判断）
const loadUserAvatar = async () => {
  try {
    // 如果已经加载过头像，直接返回
    if (avatarLoaded && userStore.userInfo.avatar) {
      return
    }
    
    if (!userStore.userInfo.id) {
      console.warn('用户ID不存在，无法加载头像')
      return
    }

    const response = await fetch(`${API_BASE_URL}/personal/getAvatar?id=${userStore.userInfo.id}`, {
      method: 'GET',
      headers: {
        'token': localStorage.getItem('token') || ''
      }
    })

    if (response.ok) {
      const blob = await response.blob()
      // 检查 blob 是否有效（大小大于0）
      if (blob.size > 0) {
        const blobUrl = URL.createObjectURL(blob)
        userStore.userInfo.avatar = blobUrl
        avatarLoaded = true
        // 同时更新 localStorage 保证数据一致
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
      }
    } else {
      console.warn('获取头像响应异常:', response.status)
    }
  } catch (e) {
    console.error('加载头像失败:', e)
  }
}

// 页面加载时初始化
onMounted(() => {
  loadUserAvatar()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 处理下拉菜单点击事件
const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
/* 引入中文字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* 全局变量定义 */
.chinese-theme {
  --ink-black: #2C3E50;
  --vermilion: #C0392B;
  /* 朱砂红 */
  --imperial-gold: #D4AC0D;
  /* 帝王金 */
  --rice-paper: #F5F2EA;
  /* 宣纸色 */
  --border-color: #E5E0D5;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  /* 宋体/衬线体 */
}

.layout-container {
  height: 100vh;
}

/* --- 侧边栏样式 --- */
.chinese-aside {
  background-color: var(--ink-black) !important;
  color: #ecf0f1;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  border-right: 1px solid #1a252f;
  background-image: linear-gradient(rgba(44, 62, 80, 0.95), rgba(44, 62, 80, 0.95)),
    url('https://www.transparenttextures.com/patterns/black-scales.png');
  /* 隐约的纹理 */
}

.logo {
  height: 70px;
  line-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
}

.stamp-icon {
  width: 36px;
  height: 36px;
  background-color: var(--vermilion);
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  border: 2px solid #A93226;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--imperial-gold);
  letter-spacing: 2px;
  font-family: 'LiSu', 'SimSun', serif;
  /* 隶书或宋体 */
}

/* 菜单项优化 */
:deep(.chinese-menu) {
  border-right: none;
  padding-top: 10px;
}

:deep(.el-menu-item) {
  margin: 8px 12px;
  border-radius: 4px;
  height: 50px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.1);
}

/* 选中状态：新中式风格 (朱砂红左边框 + 金色文字 + 淡淡的背景) */
:deep(.el-menu-item.is-active) {
  background-color: rgba(192, 57, 43, 0.15) !important;
  /* 淡淡的朱红背景 */
  color: var(--imperial-gold) !important;
  font-weight: bold;
  border: 1px solid var(--vermilion);
  box-shadow: inset 0 0 10px rgba(192, 57, 43, 0.1);
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 3px;
  background-color: var(--vermilion);
  border-radius: 2px;
}

/* 侧边栏底部云纹 (CSS模拟) */
.aside-footer-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background-image: radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.1) 10px, transparent 11px);
  background-size: 20px 20px;
  opacity: 0.3;
}

/* --- 头部样式 --- */
.chinese-header {
  background-color: #FCFAF5;
  /* 亮宣纸色 */
  border-bottom: 1px solid #D6D0C4;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
  background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');
}

.header-left {
  display: flex;
  align-items: center;
}

.vertical-divider {
  width: 4px;
  height: 18px;
  background-color: var(--vermilion);
  margin-right: 12px;
  border-radius: 2px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--ink-black);
  letter-spacing: 1px;
}

.user-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--ink-black);
}

.avatar-frame {
  padding: 2px;
  border: 1px solid var(--imperial-gold);
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  font-weight: 600;
  margin-right: 4px;
}

/* --- 主内容区域 --- */
.chinese-main {
  background-color: var(--rice-paper);
  background-image: linear-gradient(to bottom, #F5F2EA, #EFEDE6);
  padding: 24px;
}

/* 下拉菜单样式覆盖 (全局或Deep) */
:global(.chinese-dropdown .el-dropdown-menu__item:hover) {
  background-color: #F9E79F !important;
  color: #8D6E63 !important;
}

/* ============================================
   响应式样式 - 移动端适配
   ============================================ */

/* 移动端隐藏侧边栏 */
@media screen and (max-width: 768px) {
  .chinese-aside {
    position: fixed !important;
    left: -220px;
    top: 0;
    height: 100vh;
    z-index: 2000;
    transition: left 0.3s ease;
  }
  
  .chinese-aside.mobile-hidden {
    left: -220px;
  }
  
  /* 移动端 Header 调整 */
  .chinese-header {
    padding: 0 15px !important;
    height: 56px !important;
  }
  
  .mobile-menu-btn {
    margin-right: 10px;
    background-color: var(--vermilion) !important;
    color: white !important;
    border: none !important;
  }
  
  .page-title {
    font-size: 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .username {
    display: none;
  }
  
  .header-right {
    margin-left: auto;
  }
  
  /* 移动端主内容区域 */
  .chinese-main {
    padding: 16px !important;
  }
}

/* 移动端抽屉样式 */
:deep(.mobile-drawer) {
  .el-drawer__header {
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, var(--ink-black), rgba(44, 62, 80, 0.95));
  }
  
  .el-drawer__body {
    padding: 10px;
    background-color: #F5F2EA;
  }
  
  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .stamp-icon {
      width: 36px;
      height: 36px;
      background-color: var(--vermilion);
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
      border: 2px solid #A93226;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: bold;
      color: var(--imperial-gold);
      letter-spacing: 2px;
      font-family: 'LiSu', 'SimSun', serif;
    }
  }
  
  .el-menu {
    border: none;
    background-color: transparent;
    
    .el-menu-item {
      margin: 8px 12px;
      border-radius: 4px;
      color: var(--ink-black);
      transition: all 0.3s;
      
      &:hover {
        background-color: rgba(192, 57, 43, 0.1);
      }
      
      &.is-active {
        background-color: rgba(192, 57, 43, 0.15);
        color: var(--vermilion);
        font-weight: bold;
        border: 1px solid var(--vermilion);
      }
    }
  }
}

/* 平板端适配 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .chinese-aside {
    width: 180px !important;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .chinese-header {
    padding: 0 20px;
  }
  
  .chinese-main {
    padding: 20px;
  }
}
</style>