<template>
  <div class="cyan-style-container">
    <!-- 背景装饰：改为青绿山水意象的纹理 -->
    <div class="silk-bg"></div>

    <div class="app-container">
      <el-row :gutter="20">
        
        <!-- 左侧：个人名贴 -->
        <el-col :span="8" :xs="24">
          <el-card class="cyan-card profile-card">
            <template #header>
              <!-- 标题栏：改为云纹装饰 -->
              <div class="card-header">
                <div class="header-left">
                  <div class="jade-icon">
                    <el-icon><User /></el-icon>
                  </div>
                  <span class="title-text">名 贴</span>
                </div>
                <!-- 右侧云纹 -->
                <div class="cloud-decor"></div>
              </div>
            </template>
            
            <div class="user-profile">
              <div class="box-center">
                <!-- 头像框：改为双层金边圆窗 -->
                <div class="avatar-window" @click="showAvatarDialog = true" style="cursor: pointer;">
                  <el-avatar :size="100" :src="userStore.userInfo.avatar" class="avatar-img" />
                </div>
                <div class="user-name font-song">{{ userStore.userInfo.name }}</div>
                <!-- 性别：改为腰牌样式 -->
                <div class="role-badge">
                  <span class="badge-dot"></span>
                  {{ userStore.userInfo.gender }}
                  <span class="badge-dot"></span>
                </div>
              </div>
            </div>

            <div class="user-bio">
              <div class="bio-row">
                <div class="bio-label">
                  <el-icon class="teal-icon"><Iphone /></el-icon>
                  <span class="font-song">传音</span>
                </div>
                <div class="bio-value num-font">{{ userStore.userInfo.phone }}</div>
              </div>
              <div class="bio-row">
                <div class="bio-label">
                  <el-icon class="teal-icon"><Message /></el-icon>
                  <span class="font-song">书信</span>
                </div>
                <div class="bio-value num-font">{{ userStore.userInfo.email }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：资料修缮 -->
        <el-col :span="16" :xs="24">
          <el-card class="cyan-card">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <div class="jade-icon">
                    <el-icon><Edit /></el-icon>
                  </div>
                  <span class="title-text">修 缮</span>
                </div>
                <div class="cloud-decor"></div>
              </div>
            </template>

            <!-- Tabs 改为屏风样式 -->
            <el-tabs v-model="activeTab" class="cyan-tabs">
              <!-- 标签页1 -->
              <el-tab-pane label="基本信息" name="account">
                <el-form :model="form" label-width="80px" style="margin-top: 25px" class="cyan-form">
                  <el-form-item label="称谓">
                    <el-input v-model="form.name" class="cyan-input" />
                  </el-form-item>
                  <el-form-item label="传音">
                    <el-input v-model="form.phone" class="cyan-input" />
                  </el-form-item>
                  <el-form-item label="书信">
                    <el-input v-model="form.email" class="cyan-input" />
                  </el-form-item>
                  <el-form-item label="性别">
                    <el-input v-model="form.gender" class="cyan-input" />
                  </el-form-item>
                  <el-form-item>
                    <!-- 按钮：景泰蓝风格 -->
                    <el-button class="cyan-btn primary" @click="handleUpdateInfo">
                      <el-icon style="margin-right:5px"><Check /></el-icon> 确认修缮
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 标签页2 -->
              <el-tab-pane label="口令更迭" name="password">
                <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px" style="margin-top: 25px" class="cyan-form">
                  <el-form-item label="旧口令" prop="oldPassword">
                    <el-input v-model="pwdForm.oldPassword" type="password" show-password class="cyan-input" />
                  </el-form-item>
                  <el-form-item label="新口令" prop="newPassword">
                    <el-input v-model="pwdForm.newPassword" type="password" show-password class="cyan-input" />
                  </el-form-item>
                  <el-form-item label="确认口令" prop="confirmPassword">
                    <el-input v-model="pwdForm.confirmPassword" type="password" show-password class="cyan-input" />
                  </el-form-item>
                  <el-form-item>
                    <el-button class="cyan-btn primary" @click="handleChangePassword">
                      <el-icon style="margin-right:5px"><Key /></el-icon> 确认更迭
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 上传头像弹窗 -->
    <el-dialog v-model="showAvatarDialog" title="上传头像" width="500px" @close="resetAvatarUpload">
      <!-- 图片预览区 -->
      <div v-if="avatarPreview" class="avatar-preview-container">
        <div class="preview-title">预览效果</div>
        <div class="preview-box">
          <img :src="avatarPreview" alt="预览" class="preview-img" />
        </div>
      </div>

      <el-upload
        ref="uploadRef"
        action="#"
        :auto-upload="false"
        :on-change="handleFileSelect"
        accept="image/*"
        drag
        class="avatar-upload"
      >
        <template #default>
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽或<em>点击上传</em>头像</div>
        </template>
        <template #tip>
          <div class="el-upload__tip">支持 jpg、png、gif 等常见图片格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadAvatar" :loading="uploading">
          上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Iphone, Message, Check, Key, User, Edit, UploadFilled } from '@element-plus/icons-vue'
import request, { API_BASE_URL } from '../utils/request'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('account')

// 头像上传相关
const showAvatarDialog = ref(false)
const uploadRef = ref(null)
const uploading = ref(false)
const avatarPreview = ref('') // 预览图片
let selectedFile = null

// 基本资料表单 - 包含用户的所有字段
const form = reactive({
  ...userStore.userInfo
})

// 密码表单
const pwdFormRef = ref(null)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证旧密码是否正确
// 在 script setup 中修改 validateOldPassword 函数

const validateOldPassword = async (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入旧密码'))
    return
  }
  
  try {
    const res = await request.get('/personal/oldPasswordConfirm', {
      params: {
        id: userStore.userInfo.id,
        oldPassword: value
      }
    })
    
    if (res && res.code === 200) {
      callback() // 验证通过
    } else {
      callback(new Error(res?.message || '旧密码不正确'))
    }
  } catch (e) {
    callback(new Error('密码验证失败'))
  }
}
// 密码校验规则
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }, { validator: validateOldPassword, trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

// 保存基本信息
const handleUpdateInfo = () => {
  // 确保 avatar 和 avatarPath 被包含在表单中
  const updateData = {
    ...form,
    avatar: userStore.userInfo.avatar,
    avatarPath: userStore.userInfo.avatarPath
  }
  userStore.updateProfile(updateData)
  ElMessage.success('个人资料更新成功')
}

// 修改密码
const handleChangePassword = () => {
  pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await request.get('/personal/changePassword', {
          params: {
            id: userStore.userInfo.id,
            changePassword: pwdForm.newPassword
          }
        })
        
        if (res && res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          // 清除登录信息
          userStore.logout()
          // 延迟后跳转到登录页
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        } else {
          ElMessage.error(res?.message || '密码修改失败')
        }
      } catch (e) {
        ElMessage.error('密码修改失败')
      }
    }
  })
}

// 页面加载时获取用户头像
const loadUserAvatar = async () => {
  try {
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
      const blobUrl = URL.createObjectURL(blob)
      userStore.userInfo.avatar = blobUrl
      // 同时更新 localStorage 保证数据一致
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
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
})

// 文件选择处理
const handleFileSelect = (uploadFile) => {
  selectedFile = uploadFile.raw
  // 生成本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(selectedFile)
}

// 从本地文件路径获取头像图片
const fetchAvatarFromPath = async (filenamePath) => {
  try {
    // 使用原生 fetch API 避免 axios 的 transformResponse 干扰
    const response = await fetch(`${API_BASE_URL}/personal/getAvatar?filenamePath=${encodeURIComponent(filenamePath)}`, {
      method: 'GET',
      headers: {
        'token': localStorage.getItem('token') || ''
      }
    })

    if (!response.ok) {
      throw new Error('获取头像失败')
    }

    // 直接获取 blob 数据
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    return blobUrl
  } catch (e) {
    console.error('获取头像失败:', e)
    throw e
  }
}

// 上传头像
const uploadAvatar = async () => {
  if (!selectedFile) {
    ElMessage.warning('请先选择图片')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('id', userStore.userInfo.id)
    formData.append('avatar', selectedFile)

    const res = await request.post('/personal/uploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res && res.code === 200) {
      // res.data 是本地文件路径，需要调用 getAvatar 获取图片
      const filenamePath = res.data
      if (filenamePath) {
        try {
          const blobUrl = await fetchAvatarFromPath(filenamePath)
          userStore.userInfo.avatar = blobUrl
          // 存储原始路径，以便后续使用
          userStore.userInfo.avatarPath = filenamePath
          // 同时更新 localStorage 保持数据一致
          localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
          ElMessage.success('头像上传成功')
        } catch (e) {
          ElMessage.error('获取头像失败，请稍后重试')
          return
        }
      }
      showAvatarDialog.value = false
      resetAvatarUpload()
    } else {
      ElMessage.error(res?.message || '头像上传失败')
    }
  } catch (e) {
    ElMessage.error('头像上传失败')
  } finally {
    uploading.value = false
  }
}

// 重置上传组件
const resetAvatarUpload = () => {
  selectedFile = null
  avatarPreview.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}
</script>

<style scoped>
/* 引入衬线字体，保持与系统一致 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* --- 中国风格变量 --- */
.cyan-style-container {
  --chinese-red: #C0392B;
  --chinese-gold: #D4AC0D;
  --chinese-ink: #2C3E50;
  --chinese-border: #E5E0D5;
  --blue-porcelain: #1F5B99;
  --light-blue-porcelain: #4A90D9;
  --white-porcelain: #F0F5FA;
  
  min-height: 100vh;
  position: relative;
  background: linear-gradient(-45deg, #F0F5FA, #E8F0F8, #F0F5FA, #E8F0F8);
  background-size: 400% 400%;
  animation: containerFadeIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), bgGradient 15s ease infinite;
  overflow: hidden;
}

@keyframes bgGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 容器进场动画 */
@keyframes containerFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 字体工具 */
.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: bold; }
.num-font { font-family: 'Times New Roman', serif; letter-spacing: 0.5px; }

/* 背景：青花瓷纹理 */
.silk-bg {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(31, 91, 153, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(212, 172, 13, 0.03) 0%, transparent 30%);
  z-index: 0;
  pointer-events: none;
}

.app-container {
  position: relative;
  z-index: 1;
  padding: 10px;
}

/* --- 通用卡片：青花瑼风格 --- */
.cyan-card {
  border: 2px solid var(--blue-porcelain);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 16px rgba(31, 91, 153, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
  animation: cardSlideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

/* 左侧卡片 - 延迟进场 */
.profile-card {
  animation-delay: 0.2s;
}

/* 右侧卡片 - 延迟进场 */
:nth-child(2) .cyan-card {
  animation-delay: 0.4s;
}

/* 卡片从下向上滑入 + 缩放 + 旋转 */
@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.85) rotateX(15deg);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0);
  }
}

/* 标题栏 */
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 2px solid var(--blue-porcelain);
  padding-bottom: 15px;
  margin-bottom: 5px;
  position: relative;
}

.header-left { display: flex; align-items: center; gap: 12px; }

/* 图标：青花瑼风格 */
.jade-icon {
  width: 36px; height: 36px;
  background-color: rgba(31, 91, 153, 0.1);
  border: 2px solid var(--blue-porcelain);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--blue-porcelain);
  font-size: 18px;
}

.title-text {
  font-size: 18px; color: var(--blue-porcelain);
  font-weight: bold; letter-spacing: 2px;
}

/* 装饰：云纹线条 */
.cloud-decor {
  height: 10px; width: 100px;
  background-image: radial-gradient(circle, var(--chinese-gold) 1px, transparent 1px);
  background-size: 6px 6px;
  opacity: 0.3;
}

/* --- 个人信息区域 --- */
.box-center { text-align: center; padding: 20px 0; }

/* 头像：青花瑼风格 */
.avatar-window {
  display: inline-block;
  padding: 6px;
  border: 3px solid var(--chinese-gold);
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(212, 172, 13, 0.2);
  animation: avatarPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
  transition: all 0.3s ease;
}

/* 头像悬停放大效果 */
.avatar-window:hover {
  transform: scale(1.3);
  box-shadow: 0 8px 20px rgba(212, 172, 13, 0.4), 0 0 20px rgba(31, 91, 153, 0.2);
  border-color: var(--blue-porcelain);
}

@keyframes avatarPop {
  0% {
    transform: scale(0) rotateZ(-30deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotateZ(10deg);
  }
  100% {
    transform: scale(1) rotateZ(0);
    opacity: 1;
  }
}

.avatar-img { border: 3px solid #fff; }

.user-name {
  margin-top: 15px; font-size: 24px; color: var(--chinese-ink);
  animation: textGlide 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s backwards;
}

/* 用户名从左滑入 */
@keyframes textGlide {
  0% {
    opacity: 0;
    transform: translateX(-30px);
    letter-spacing: -5px;
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    letter-spacing: normal;
  }
}

/* 角色：青花瑼风格 */
.role-badge {
  margin-top: 10px; display: inline-block;
  background-color: var(--blue-porcelain);
  color: var(--chinese-gold);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 13px; letter-spacing: 1px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(31, 91, 153, 0.2);
  animation: badgeFlip 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s backwards;
}

/* 角色徽章翻转进场 */
@keyframes badgeFlip {
  0% {
    opacity: 0;
    transform: rotateY(90deg) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: rotateY(0) scale(1);
  }
}

.badge-dot {
  display: inline-block; width: 4px; height: 4px; background: var(--chinese-gold);
  border-radius: 50%; margin: 0 4px; vertical-align: middle;
}

/* 详细信息行 */
.user-bio { padding: 10px 20px 30px; }
.bio-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(74, 74, 74, 0.1);
  transition: all 0.3s ease;
  animation: bioRowSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  position: relative;
}

/* 信息行水墨效果 */
.bio-row::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 74, 74, 0.3), transparent);
  animation: inkLineSpread 2s ease-out infinite;
}

@keyframes inkLineSpread {
  0% {
    width: 0;
    left: 50%;
  }
  100% {
    width: 100%;
    left: 0;
  }
}

.bio-row:nth-child(1) {
  animation-delay: 0.7s;
}

.bio-row:nth-child(2) {
  animation-delay: 0.85s;
}

/* 信息行从右向左滑入 */
@keyframes bioRowSlide {
  0% {
    opacity: 0;
    transform: translateX(50px) skewX(10deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) skewX(0);
  }
}

/* --- 右侧表单区域 --- */

/* 表单进场动画 */
:deep(.cyan-form .el-form-item) {
  animation: formItemSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

/* 每个表单项依次进场 */
:deep(.cyan-form .el-form-item:nth-child(1)) {
  animation-delay: 0.5s;
}
:deep(.cyan-form .el-form-item:nth-child(2)) {
  animation-delay: 0.6s;
}
:deep(.cyan-form .el-form-item:nth-child(3)) {
  animation-delay: 0.7s;
}
:deep(.cyan-form .el-form-item:nth-child(4)) {
  animation-delay: 0.8s;
}

/* 表单项从下向上滑入+淡入 */
@keyframes formItemSlide {
  0% {
    opacity: 0;
    transform: translateY(30px) translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}

/* Tabs：屏风样式 */
:deep(.cyan-tabs .el-tabs__nav-wrap::after) {
  background-color: transparent;
  border-bottom: 2px solid var(--blue-porcelain);
}
:deep(.cyan-tabs .el-tabs__item) {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  color: #888;
  transition: all 0.3s ease;
}
:deep(.cyan-tabs .el-tabs__item.is-active) {
  color: var(--blue-porcelain);
  font-weight: bold;
  animation: tabFlip 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
:deep(.cyan-tabs .el-tabs__active-bar) {
  background-color: var(--chinese-gold);
  height: 3px;
  border-radius: 3px;
}

@keyframes tabFlip {
  0% {
    opacity: 0;
    transform: rotateY(-20deg) translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: rotateY(0) translateX(0);
  }
}

/* 输入框：青花瑼风格 */
:deep(.cyan-input .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: none !important;
  border: 1px solid var(--chinese-border);
  border-radius: 4px;
  transition: all 0.3s;
}
:deep(.cyan-input .el-input__wrapper.is-focus) {
  border-color: var(--blue-porcelain) !important;
  background-color: #fff !important;
  box-shadow: 0 0 0 1px var(--blue-porcelain) inset !important;
}
:deep(.cyan-input .el-input__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
}

/* 按钮：青花瓷风格 */
.cyan-btn.primary {
  background-color: var(--blue-porcelain) !important;
  border: 1px solid var(--blue-porcelain) !important;
  color: #fff !important;
  border-bottom: 3px solid var(--chinese-ink) !important;
  border-radius: 4px;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 2px;
  font-weight: bold;
  padding: 18px 30px;
  opacity: 1 !important;
  transition: all 0.3s;
}

/* 按钮悬停效果 */
.cyan-btn.primary:hover {
  background-color: var(--chinese-ink) !important;
  border-color: var(--chinese-ink) !important;
  transform: translateY(-2px);
  border-bottom-width: 5px !important;
  box-shadow: 0 8px 16px rgba(31, 91, 153, 0.3) !important;
}

/* 按钮点击动画 */
.cyan-btn.primary:active {
  transform: translateY(1px);
  border-bottom-width: 2px !important;
}

/* 上传头像弹窗样式 */
:deep(.avatar-upload) {
  border: 2px dashed var(--blue-porcelain);
  border-radius: 4px;
  background-color: var(--white-porcelain);
  transition: all 0.3s ease;
}

:deep(.avatar-upload:hover) {
  border-color: var(--light-blue-porcelain);
  background-color: #e8f4fb;
}

:deep(.avatar-upload .el-icon--upload) {
  color: var(--blue-porcelain);
  font-size: 67px;
  margin: 40px 0 16px 0;
}

:deep(.avatar-upload .el-upload__text) {
  color: var(--chinese-ink);
}

:deep(.avatar-upload .el-upload__text em) {
  color: var(--blue-porcelain);
  font-style: normal;
}

:deep(.avatar-upload .el-upload__tip) {
  color: var(--chinese-border);
}

:deep(.el-dialog__footer) {
  text-align: right;
}

/* 头像预览区 */
.avatar-preview-container {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--chinese-border);
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--blue-porcelain);
  margin-bottom: 12px;
}

.preview-box {
  text-align: center;
  background-color: var(--white-porcelain);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--chinese-border);
}

.preview-img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 50%;
  border: 3px solid var(--blue-porcelain);
}

/* ============================================
   移动端响应式样式
   ============================================ */
@media screen and (max-width: 768px) {
  .cyan-style-container {
    min-height: auto;
  }

  .app-container {
    padding: 8px;
  }

  /* 卡片样式优化 */
  .cyan-card {
    border-width: 1px;
    border-radius: 12px;
    margin-bottom: 12px;
  }

  /* 头部简化 */
  .card-header {
    padding-bottom: 10px;
    margin-bottom: 0;
  }

  .jade-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .title-text {
    font-size: 15px;
    letter-spacing: 1px;
  }

  .cloud-decor {
    display: none;
  }

  /* 头像区域优化 */
  .box-center {
    padding: 15px 0;
  }

  .avatar-window {
    padding: 4px;
    border-width: 2px;
  }

  :deep(.avatar-window .el-avatar) {
    width: 80px !important;
    height: 80px !important;
  }

  .user-name {
    font-size: 18px;
    margin-top: 10px;
  }

  .role-badge {
    font-size: 11px;
    padding: 3px 12px;
    margin-top: 8px;
  }

  /* 用户信息行优化 */
  .user-bio {
    padding: 8px 12px 15px;
  }

  .bio-row {
    padding: 10px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .bio-label {
    font-size: 12px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .bio-label .teal-icon {
    font-size: 14px;
  }

  .bio-value {
    font-size: 14px;
    word-break: break-all;
    padding-left: 18px;
  }

  /* 标签页优化 */
  :deep(.cyan-tabs .el-tabs__item) {
    font-size: 14px;
    padding: 0 12px;
  }

  :deep(.cyan-tabs .el-tabs__nav-scroll) {
    overflow-x: auto;
  }

  /* 表单优化 */
  :deep(.cyan-form) {
    margin-top: 15px !important;
  }

  :deep(.cyan-form .el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.cyan-form .el-form-item__label) {
    font-size: 13px;
    padding-right: 8px;
  }

  :deep(.cyan-input .el-input__inner) {
    font-size: 14px;
  }

  /* 按钮优化 */
  .cyan-btn.primary {
    width: 100%;
    padding: 14px 20px;
    font-size: 14px;
    letter-spacing: 1px;
  }

  /* 头像上传弹窗优化 */
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 10vh auto !important;
  }

  :deep(.el-dialog__header) {
    padding: 12px 15px;
  }

  :deep(.el-dialog__body) {
    padding: 15px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 15px;
  }

  .avatar-preview-container {
    margin-bottom: 15px;
    padding-bottom: 15px;
  }

  .preview-img {
    max-width: 100px;
    max-height: 100px;
  }

  :deep(.avatar-upload .el-icon--upload) {
    font-size: 48px;
    margin: 20px 0 10px 0;
  }

  :deep(.avatar-upload .el-upload__text) {
    font-size: 13px;
  }

  /* 禁用部分动画提升性能 */
  .avatar-window:hover {
    transform: scale(1.05);
  }

  .bio-row::before {
    animation: none;
  }
}

/* 超小屏幕优化 */
@media screen and (max-width: 375px) {
  .app-container {
    padding: 5px;
  }

  :deep(.avatar-window .el-avatar) {
    width: 70px !important;
    height: 70px !important;
  }

  .user-name {
    font-size: 16px;
  }

  .bio-value {
    font-size: 13px;
  }

  :deep(.cyan-form .el-form-item__label) {
    font-size: 12px;
    width: 70px !important;
  }
}

</style>