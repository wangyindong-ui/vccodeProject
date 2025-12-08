<template>
  <el-container class="layout-container">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px">
      <div class="logo">
        <el-icon>
          <Van />
        </el-icon> 4S店智能管理
      </div>
      <el-menu router :default-active="$route.path" background-color="#304156" text-color="#bfcbd9"
        active-text-color="#409EFF">
        <el-menu-item index="/dashboard">
          <el-icon>
            <Odometer />
          </el-icon>
          <span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/cars">
          <el-icon>
            <Van />
          </el-icon>
          <span>车库管理</span>
        </el-menu-item>
        <el-menu-item index="/service">
          <el-icon>
            <Tools />
          </el-icon>
          <span>售后维修管理</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon>
            <Box />
          </el-icon>
          <span>配件库存管理</span>
        </el-menu-item>
        <el-menu-item index="/test-drive">
          <el-icon>
            <Timer />
          </el-icon>
          <span>试驾预约管理</span>
        </el-menu-item>
      </el-menu>


    </el-aside>

    <!-- 右侧主体内容 -->
    <el-container>
      <!-- 顶部 Header -->
      <el-header>
        <div class="header-left">
          <!-- 显示当前路由的标题 -->
          <span style="font-weight: bold; color: #606266">{{ $route.meta.title }}</span>
        </div>

        <div class="header-right">
          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link" style="cursor: pointer; display: flex; align-items: center;">
              <el-avatar :size="30" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                style="margin-right: 8px" />
              <!-- 使用 Store 中的用户名 -->
              {{ userStore.userInfo.name || '管理员' }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

// 初始化路由和状态仓库
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 处理下拉菜单点击事件
const handleCommand = (command) => {
  if (command === 'logout') {
    // 调用 store 的登出方法
    userStore.logout()
    ElMessage.success('已退出登录')
    // 跳转回登录页
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #0f172a !important;
  /* 更深的蓝黑色 */
  color: white;
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  background: linear-gradient(to right, #0f172a, #1e293b);
  border-bottom: 1px solid #334155;
}

/* 菜单项优化 */
:deep(.el-menu) {
  border-right: none;
  background-color: transparent !important;
}

:deep(.el-menu-item) {
  background-color: transparent !important;
  color: #94a3b8 !important;
  margin: 4px 8px;
  border-radius: 8px;
  height: 50px;
}

:deep(.el-menu-item:hover) {
  background-color: #334155 !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%) !important;
  color: #fff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.el-header {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
}

.el-main {
  background-color: #f1f5f9;
  padding: 24px;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>