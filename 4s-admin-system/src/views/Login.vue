<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧海报区 -->
      <div class="login-banner">
        <div class="banner-content">
          <div class="brand">
            <el-icon :size="40">
              <Van />
            </el-icon>
            <h1>Future Auto</h1>
          </div>
          <p class="slogan">智能驱动 · 卓越服务 · 极致体验</p>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="login-form-box">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>请登录您的管理账号</p>
        </div>

        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large" class="custom-form">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock"
              @keyup.enter="handleLogin" />
          </el-form-item>

          <div class="form-footer">
            <el-checkbox v-model="remember">记住我</el-checkbox>
            <div>
              <!-- 新增注册入口 -->
              <router-link to="/register"
                style="color: #64748b; text-decoration: none; font-size: 14px; margin-right: 15px">注册账号</router-link>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
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
import { User, Lock } from '@element-plus/icons-vue'

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
    // 等待表单验证完成
    await loginFormRef.value.validate()
    
    loading.value = true
    // 直接调用并等待登录结果
    const success = await userStore.login(
      loginForm.value.username,
      loginForm.value.password
    )
    
    if (success) {
      ElMessage.success(`欢迎回来，${userStore.userInfo.name}`)
      router.push('/dashboard')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    // 处理验证错误
    ElMessage.warning('请正确填写表单')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
}

.login-wrapper {
  width: 900px;
  height: 550px;
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.login-banner {
  flex: 1.2;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)),
    url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}

.banner-content {
  text-align: center;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.brand h1 {
  font-size: 32px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 1px;
}

.slogan {
  font-size: 16px;
  opacity: 0.8;
  letter-spacing: 2px;
  margin-top: 10px;
}

.login-form-box {
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0 0 10px;
  font-size: 28px;
  color: #1e293b;
}

.form-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.custom-form .el-input__wrapper {
  background-color: #f1f5f9;
  box-shadow: none !important;
  border-radius: 8px;
  padding: 8px 15px;
}

.custom-form .el-input__wrapper.is-focus {
  background-color: white;
  box-shadow: 0 0 0 2px #3b82f6 !important;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.submit-btn {
  width: 100%;
  padding: 22px 0;
  font-size: 16px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}
</style>