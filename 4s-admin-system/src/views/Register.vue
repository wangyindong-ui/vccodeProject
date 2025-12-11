<template>
  <div class="login-container chinese-theme">
    <div class="login-wrapper">
      <!-- 左侧海报区 -->
      <div class="login-banner">
        <div class="mask-layer"></div>
        <div class="banner-content">
          <div class="brand">
            <div class="stamp-box">
              <el-icon :size="32"><Van /></el-icon>
            </div>
            <h1 class="font-song">加入 · 雅集</h1>
          </div>
          <p class="slogan font-song">共筑智能管理新篇章</p>
        </div>
      </div>

      <!-- 右侧注册表单区 -->
      <div class="login-form-box">
        <div class="form-header">
          <h2 class="font-song">创建账号</h2>
          <p>请填写以下信息完成注册</p>
        </div>
        
        <el-form :model="form" :rules="rules" ref="formRef" size="large" class="chinese-form">
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

          <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="您的姓名/昵称" :prefix-icon="Postcard" />
          </el-form-item>

          <!-- 角色选择下拉框 -->
          <el-form-item prop="role">
            <el-select 
              v-model="form.role" 
              placeholder="请选择角色" 
              style="width: 100%" 
              popper-class="chinese-popper"
              :loading="roleLoading"
            >
              <template #prefix>
                <el-icon><Flag /></el-icon>
              </template>
              <!-- 遍历接口返回的角色数据 -->
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item style="margin-top: 30px;">
            <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">
              立即注册
            </el-button>
          </el-form-item>

          <div class="form-footer" style="justify-content: center; margin-bottom: 0;">
            <span style="color: #7f8c8d; font-size: 14px;">已有账号？</span>
            <router-link to="/login" class="link-text" style="font-weight: bold; margin-left: 5px;">
              去登录
            </router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Postcard, Van, Flag } from '@element-plus/icons-vue'
import { getRoleList } from '../stores/user' 

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const roleLoading = ref(false)

// 2. 定义存储角色的数组
const roleOptions = ref([])

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  role: '' // 这里存储选中的角色ID (后端需要的值)
})

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
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 3. 获取角色列表的方法
const fetchRoleList = async () => {
  roleLoading.value = true
  try {
    const res = await getRoleList()
    // 假设后端返回格式为 { code: 200, data: [ {id: 101, roleName: '管理员'}, ... ] }
    if (res.code === 200) {
      roleOptions.value = res.data || []
    }
  } catch (error) {
    console.error("获取角色列表失败", error)
    ElMessage.warning('角色列表加载失败，请刷新重试')
  } finally {
    roleLoading.value = false
  }
}

const handleRegister = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const submitData = {
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role // 这里传给后端的是 ID
      }
      const success = await userStore.register(submitData)
      if (success) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      }
      loading.value = false
    }
  })
}

// 4. 页面加载时调用接口
onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped>
/* 样式保持不变 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.chinese-theme {
  --chinese-red: #C0392B;
  --chinese-gold: #D4AC0D;
  --chinese-ink: #2C3E50;
  --rice-paper: #FDFBF7;
  --bg-color: #F0EFE2;
}

.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; }

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
  background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');
}

.login-wrapper {
  width: 900px;
  height: 650px; /* 增加高度以容纳新字段 */
  display: flex;
  background: var(--rice-paper);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(44, 62, 80, 0.15);
  border: 1px solid #E5E0D5;
}

.login-banner {
  flex: 1.2;
  position: relative;
  background: url('https://images.unsplash.com/photo-1517504787944-9371059d7247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); 
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.mask-layer {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.85), rgba(44, 62, 80, 0.6));
}

.banner-content {
  position: relative; z-index: 2; text-align: center;
  border: 2px solid rgba(255,255,255,0.3); padding: 40px;
  backdrop-filter: blur(2px);
}

.brand {
  display: flex; flex-direction: column; align-items: center; gap: 15px; margin-bottom: 20px;
}

.stamp-box {
  width: 60px; height: 60px;
  background-color: var(--chinese-red);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
}

.brand h1 {
  font-size: 36px; margin: 0; font-weight: 700; letter-spacing: 4px;
  color: var(--chinese-gold); text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.slogan {
  font-size: 18px; opacity: 0.9; letter-spacing: 2px; margin-top: 10px;
  font-weight: 300; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;
}

.login-form-box {
  flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center;
  background-image: radial-gradient(var(--chinese-gold) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: var(--rice-paper);
}

.form-header { margin-bottom: 20px; text-align: center; }
.form-header h2 { margin: 0 0 10px; font-size: 26px; color: var(--chinese-ink); letter-spacing: 2px; }
.form-header p { margin: 0; color: #7f8c8d; font-size: 14px; }

/* 输入框 & 选择框 */
:deep(.chinese-form .el-input__wrapper),
:deep(.chinese-form .el-select__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  padding: 8px 0;
}
:deep(.chinese-form .el-input__wrapper.is-focus),
:deep(.chinese-form .el-select__wrapper.is-focused) {
  border-bottom-color: var(--chinese-red) !important;
}
:deep(.chinese-form .el-input__inner) {
  color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif;
}
:deep(.chinese-form .el-input__prefix-inner) { color: var(--chinese-ink); }

.submit-btn {
  width: 100%; padding: 22px 0; font-size: 18px;
  font-family: 'Noto Serif SC', serif; font-weight: bold; letter-spacing: 4px;
  background: var(--chinese-red); border: none; border-radius: 4px;
}
.submit-btn:hover { background: #A93226; }

.link-text {
  color: var(--chinese-ink); text-decoration: none; transition: color 0.3s;
}
.link-text:hover { color: var(--chinese-red); }
</style>

<!-- 下拉框全局样式 (无 scoped) -->
<style>
.chinese-popper .el-select-dropdown__item.selected {
  color: #C0392B !important; /* 朱砂红 */
  font-weight: bold;
  font-family: 'Noto Serif SC', serif;
}
.chinese-popper .el-select-dropdown__item {
  font-family: 'Noto Serif SC', serif;
  color: #2C3E50;
}
</style>