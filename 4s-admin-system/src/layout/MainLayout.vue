<template>
  <el-container class="layout-container chinese-theme">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="chinese-aside">
      <div class="logo">
        <div class="stamp-icon">
          <el-icon>
            <Van />
          </el-icon>
        </div>
        <span class="logo-text">4S · 雅集</span>
      </div>

      <el-menu router :default-active="$route.path" background-color="transparent" text-color="#bdc3c7"
        active-text-color="#F1C40F" class="chinese-menu">
        <el-menu-item index="/dashboard">
          <el-icon>
            <Odometer />
          </el-icon>
          <span>首页概览</span>
        </el-menu-item>
        <!-- 新增：订单管理 -->
        <el-menu-item index="/orders">
          <el-icon>
            <Tickets />
          </el-icon>
          <span>订单管理</span>
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
          <span>售后维修</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon>
            <Box />
          </el-icon>
          <span>配件库存</span>
        </el-menu-item>
        <el-menu-item index="/test-drive">
          <el-icon>
            <Timer />
          </el-icon>
          <span>试驾预约</span>
        </el-menu-item>
        <el-menu-item index="/dictionary">
          <el-icon>
            <Notebook />
          </el-icon>
          <span>字典管理</span>
        </el-menu-item>
      </el-menu>

      <!-- 侧边栏底部云纹装饰 -->
      <div class="aside-footer-pattern"></div>
    </el-aside>

    <!-- 右侧主体内容 -->
    <el-container>
      <!-- 顶部 Header -->
      <el-header class="chinese-header">
        <div class="header-left">
          <!-- 装饰竖线 -->
          <div class="vertical-divider"></div>
          <span class="page-title">{{ $route.meta.title }}</span>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link user-link">
              <div class="avatar-frame">
                <el-avatar :size="30" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              </div>
              <span class="username">{{ userStore.userInfo.name || '掌柜' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
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
        <!-- 路由视图 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Van, Odometer, Tools, Box, Timer, Notebook, ArrowDown, Tickets } from '@element-plus/icons-vue'

// 初始化路由和状态仓库
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

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
</style>