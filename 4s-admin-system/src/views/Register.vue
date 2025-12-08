<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧海报区 (保持与登录页一致的视觉风格) -->
      <div class="login-banner">
        <div class="banner-content">
          <div class="brand">
            <el-icon :size="40"><Van /></el-icon>
            <h1>Future Auto</h1>
          </div>
          <p class="slogan">加入我们 · 开启智能管理新篇章</p>
        </div>
      </div>

      <!-- 右侧注册表单区 -->
      <div class="login-form-box">
        <div class="form-header">
          <h2>创建账号</h2>
          <p>请填写以下信息完成注册</p>
        </div>
        
        <el-form :model="form" :rules="rules" ref="formRef" size="large" class="custom-form">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名 (必填)" :prefix-icon="User" />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="设置密码 (必填)" 
              show-password
              :prefix-icon="Lock"
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="确认密码" 
              show-password
              :prefix-icon="Lock"
            />
          </el-form-item>

          <!-- 额外信息 -->
          <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="您的姓名/昵称" :prefix-icon="Postcard" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">
              立即注册
            </el-button>
          </el-form-item>

          <div class="form-footer" style="justify-content: center;">
            <span style="color: #64748b; font-size: 14px;">已有账号？</span>
            <router-link to="/login" style="color: #3b82f6; text-decoration: none; font-weight: 600; margin-left: 5px;">
              去登录
            </router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Postcard } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '' // 可选
})

// 密码一致性校验
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码长度至少6位', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const handleRegister = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      // 构造发给后端的数据 (去掉 confirmPassword)
      const submitData = {
        username: form.username,
        password: form.password,
        name: form.name,
        role: '员工' // 默认角色
      }

      const success = await userStore.register(submitData)
      
      if (success) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      }
      // 如果失败，axios 拦截器通常已经弹出了错误提示
      loading.value = false
    }
  })
}
</script>

<style scoped>
/* 复用 Login.vue 的样式，保持一致性 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
}
.login-wrapper {
  width: 900px;
  height: 600px; /* 稍微高一点以容纳更多输入框 */
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}
.login-banner {
  flex: 1.2;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)), 
              url('https://images.unsplash.com/photo-1486006920555-c77dcf18193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'); /* 换了一张背景图 */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}
.banner-content { text-align: center; }
.brand { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }
.brand h1 { font-size: 32px; margin: 0; font-weight: 700; letter-spacing: 1px; }
.slogan { font-size: 16px; opacity: 0.8; letter-spacing: 2px; margin-top: 10px; }

.login-form-box {
  flex: 1;
  padding: 40px; /* 稍微减小内边距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.form-header { margin-bottom: 20px; }
.form-header h2 { margin: 0 0 10px; font-size: 26px; color: #1e293b; }
.form-header p { margin: 0; color: #64748b; font-size: 14px; }

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
.submit-btn { 
  width: 100%; 
  padding: 22px 0; 
  font-size: 16px; 
  background: linear-gradient(to right, #3b82f6, #2563eb);
  border: none;
  margin-top: 10px;
}
.submit-btn:hover { background: linear-gradient(to right, #2563eb, #1d4ed8); }
</style>