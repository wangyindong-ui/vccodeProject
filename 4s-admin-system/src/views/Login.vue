<template>
  <div class="login-container chinese-theme">
    <div class="login-wrapper">
      <!-- 左侧海报区：水墨意境 -->
      <div class="login-banner">
        <div class="mask-layer"></div>
        <div class="banner-content">
          <div class="brand">
            <div class="stamp-box">
              <el-icon :size="32"><Van /></el-icon>
            </div>
            <h1 class="font-song">未来 · 智行</h1>
          </div>
          <p class="slogan font-song">运筹帷幄 · 决胜千里</p>
        </div>
      </div>

      <!-- 右侧表单区：宣纸质感 -->
      <div class="login-form-box">
        <div class="form-header">
          <h2 class="font-song">欢迎归来</h2>
          <p>请登录您的管理账号</p>
        </div>

        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large" class="chinese-form">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock"
              @keyup.enter="handleLogin" />
          </el-form-item>

          <div class="form-footer">
            <el-checkbox v-model="remember" class="chinese-checkbox">记住我</el-checkbox>
            <div class="links-box">
              <router-link to="/register" class="link-text">注册账号</router-link>
              <el-link :underline="false" class="link-text">忘记密码？</el-link>
            </div>
          </div>

          <el-form-item>
            <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Van } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const remember = ref(true)

const loginForm = ref({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    const success = await userStore.login(loginForm.value.username, loginForm.value.password)
    if (success) {
      ElMessage.success(`欢迎回来，${userStore.userInfo.name}`)
      router.push('/dashboard')
    }
  } catch (error) {
    ElMessage.warning('请正确填写表单')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 引入中文字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* 全局变量 */
.chinese-theme {
  --chinese-red: #C0392B;    /* 朱砂红 */
  --chinese-gold: #D4AC0D;   /* 帝王金 */
  --chinese-ink: #2C3E50;    /* 水墨黑 */
  --rice-paper: #FDFBF7;     /* 宣纸白 */
  --bg-color: #F0EFE2;       /* 背景米色 */
}

.font-song {
  font-family: 'Noto Serif SC', 'SimSun', serif;
}

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
  background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');
  overflow: hidden;
}

.login-wrapper {
  width: 900px;
  height: 550px;
  display: flex;
  background: var(--rice-paper);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(44, 62, 80, 0.15);
  border: 1px solid #E5E0D5;
  animation: wrapperEnter 1s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 左侧海报区 */
.login-banner {
  flex: 1.2;
  position: relative;
  background: url('https://images.unsplash.com/photo-1542300057-b02674e2d4d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); 
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
}

/* 缓慢缩放背景图效果 */
.login-banner::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: inherit;
  background-size: cover;
  background-position: center;
  z-index: 0;
  animation: bgZoom 20s infinite alternate;
}

.mask-layer {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.85), rgba(44, 62, 80, 0.6));
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  border: 2px solid rgba(255,255,255,0.3);
  padding: 40px;
  backdrop-filter: blur(2px);
  animation: fadeIn 1s 0.5s backwards;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

/* 红色印章风格图标 */
.stamp-box {
  width: 60px; height: 60px;
  background-color: var(--chinese-red);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
  animation: stampDrop 0.8s 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

.brand h1 {
  font-size: 36px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--chinese-gold);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  animation: slideUp 0.8s 1s backwards;
}

.slogan {
  font-size: 18px;
  opacity: 0.9;
  letter-spacing: 2px;
  margin-top: 10px;
  font-weight: 300;
  border-top: 1px solid rgba(255,255,255,0.3);
  padding-top: 10px;
  animation: slideUp 0.8s 1.2s backwards;
}

/* 右侧表单区 */
.login-form-box {
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image: radial-gradient(var(--chinese-gold) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: var(--rice-paper);
}

.form-header { 
  margin-bottom: 30px; 
  text-align: center; 
  animation: slideDown 0.8s 0.4s backwards;
}
.form-header h2 {
  margin: 0 0 10px;
  font-size: 28px;
  color: var(--chinese-ink);
  letter-spacing: 2px;
}
.form-header p { margin: 0; color: #7f8c8d; font-size: 14px; }

/* 输入框改造 */
:deep(.chinese-form .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  padding: 10px 0;
  transition: all 0.3s;
}
:deep(.chinese-form .el-input__wrapper.is-focus) {
  border-bottom-color: var(--chinese-red) !important;
}
:deep(.chinese-form .el-input__inner) {
  color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif;
}
:deep(.chinese-form .el-input__prefix-inner) { color: var(--chinese-ink); }

/* 表单项动画 */
.chinese-form .el-form-item {
  animation: slideUp 0.6s backwards;
}
.chinese-form .el-form-item:nth-child(1) { animation-delay: 0.6s; }
.chinese-form .el-form-item:nth-child(2) { animation-delay: 0.7s; }
.chinese-form .el-form-item:last-child { animation-delay: 0.9s; } /* Button */

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  animation: fadeIn 0.8s 0.8s backwards;
}

.links-box {
  display: flex;
  align-items: center;
}

.link-text {
  color: #7f8c8d;
  text-decoration: none;
  font-size: 14px;
  margin-left: 15px;
  transition: color 0.3s;
  font-family: 'Noto Serif SC', serif;
}
.link-text:hover { color: var(--chinese-red); }

:deep(.chinese-checkbox .el-checkbox__label) { color: #7f8c8d; }
:deep(.chinese-checkbox .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--chinese-red);
  border-color: var(--chinese-red);
}

/* 按钮改造 */
.submit-btn {
  width: 100%;
  padding: 22px 0;
  font-size: 18px;
  font-family: 'Noto Serif SC', serif;
  font-weight: bold;
  letter-spacing: 4px;
  background: var(--chinese-red);
  border: none;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  background: #A93226;
  box-shadow: 0 4px 10px rgba(192, 57, 43, 0.3);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(1px);
}

/* 动画定义 */
@keyframes wrapperEnter {
  from { opacity: 0; transform: scale(0.95) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes stampDrop {
  0% { opacity: 0; transform: scale(3); }
  60% { opacity: 1; transform: scale(1); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes bgZoom {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
</style>