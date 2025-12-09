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
                <div class="avatar-window">
                  <el-avatar :size="100" :src="userStore.userInfo.avatar" class="avatar-img" />
                </div>
                <div class="user-name font-song">{{ userStore.userInfo.name }}</div>
                <!-- 角色：改为腰牌样式 -->
                <div class="role-badge">
                  <span class="badge-dot"></span>
                  {{ userStore.userInfo.role || '访客' }}
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Iphone, Message, Check, Key, User, Edit } from '@element-plus/icons-vue'

const userStore = useUserStore()
const activeTab = ref('account')

// 基本资料表单
const form = reactive({
  name: userStore.userInfo.name,
  phone: userStore.userInfo.phone,
  email: userStore.userInfo.email
})

// 密码表单
const pwdFormRef = ref(null)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

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
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

// 保存基本信息
const handleUpdateInfo = () => {
  userStore.updateProfile(form)
  ElMessage.success('个人资料更新成功')
}

// 修改密码
const handleChangePassword = () => {
  pwdFormRef.value.validate((valid) => {
    if (valid) {
      if (pwdForm.oldPassword !== '123456') {
        ElMessage.error('旧密码不正确 (默认: 123456)')
        return
      }
      
      ElMessage.success('密码修改成功，请重新登录')
      userStore.logout()
      setTimeout(() => {
        location.reload()
      }, 1000)
    }
  })
}
</script>

<style scoped>
/* 引入衬线字体，保持与系统一致 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* --- 青绿山水风格变量 --- */
.cyan-style-container {
  --cyan-dark: #1F3A3D;    /* 黛绿 (深色文字/边框) */
  --cyan-main: #2D6E7E;    /* 孔雀蓝/松石绿 (主色) */
  --cyan-light: #E0E5DF;   /* 月白/淡青 (背景) */
  --gold-antique: #C89B40; /* 古铜金 (装饰) */
  --red-seal: #A93226;     /* 赭石红 (强调) */
  
  min-height: 100vh;
  position: relative;
  background-color: #F2F4F3; /* 极淡的青灰底色 */
  font-family: 'Noto Serif SC', 'SimSun', serif;
}

/* 字体工具 */
.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: bold; }
.num-font { font-family: 'Times New Roman', serif; letter-spacing: 0.5px; }

/* 背景：丝绸/云纹质感 */
.silk-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    radial-gradient(circle at 100% 0%, rgba(45, 110, 126, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 0% 100%, rgba(200, 155, 64, 0.05) 0%, transparent 20%),
    url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png'); /* 柔和纹理 */
  z-index: 0;
  pointer-events: none;
}

.app-container {
  position: relative;
  z-index: 1;
  padding: 10px;
}

/* --- 通用卡片：玉石质感 --- */
.cyan-card {
  border: 1px solid #D1D9D4;
  background: rgba(255, 255, 255, 0.85); /* 半透明白玉 */
  box-shadow: 0 4px 16px rgba(31, 58, 61, 0.08);
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

/* 标题栏 */
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(45, 110, 126, 0.2);
  padding-bottom: 15px;
  margin-bottom: 5px;
}

.header-left { display: flex; align-items: center; gap: 12px; }

/* 图标：玉佩样式 */
.jade-icon {
  width: 36px; height: 36px;
  background-color: rgba(45, 110, 126, 0.1);
  border: 1px solid var(--cyan-main);
  border-radius: 50%; /* 圆形玉佩 */
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan-main);
  font-size: 18px;
}

.title-text {
  font-size: 18px; color: var(--cyan-dark);
  font-weight: bold; letter-spacing: 2px;
}

/* 装饰：云纹线条 */
.cloud-decor {
  height: 10px; width: 100px;
  background-image: radial-gradient(circle, var(--cyan-main) 1px, transparent 1px);
  background-size: 6px 6px;
  opacity: 0.3;
}

/* --- 个人信息区域 --- */
.box-center { text-align: center; padding: 20px 0; }

/* 头像：金窗样式 */
.avatar-window {
  display: inline-block;
  padding: 6px;
  border: 2px solid var(--gold-antique); /* 金边 */
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(200, 155, 64, 0.2);
}
.avatar-img { border: 2px solid #fff; }

.user-name {
  margin-top: 15px; font-size: 24px; color: var(--cyan-dark);
}

/* 角色：腰牌样式 (长条圆角) */
.role-badge {
  margin-top: 10px; display: inline-block;
  background-color: var(--cyan-dark);
  color: var(--gold-antique);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 13px; letter-spacing: 1px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(31, 58, 61, 0.2);
}
.badge-dot {
  display: inline-block; width: 4px; height: 4px; background: var(--gold-antique);
  border-radius: 50%; margin: 0 4px; vertical-align: middle;
}

/* 详细信息行 */
.user-bio { padding: 10px 20px 30px; }
.bio-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 0;
  border-bottom: 1px dashed rgba(45, 110, 126, 0.3); /* 虚线 */
}
.bio-row:last-child { border-bottom: none; }

.bio-label { display: flex; align-items: center; gap: 8px; color: var(--cyan-main); font-weight: bold; }
.bio-value { color: #555; font-size: 15px; }
.teal-icon { font-size: 18px; }

/* --- 右侧表单区域 --- */

/* Tabs：屏风样式 */
:deep(.cyan-tabs .el-tabs__nav-wrap::after) {
  background-color: transparent; /* 去掉默认灰线 */
  border-bottom: 1px solid rgba(45, 110, 126, 0.2);
}
:deep(.cyan-tabs .el-tabs__item) {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  color: #888;
}
:deep(.cyan-tabs .el-tabs__item.is-active) {
  color: var(--cyan-main);
  font-weight: bold;
}
:deep(.cyan-tabs .el-tabs__active-bar) {
  background-color: var(--gold-antique); /* 金色选中条 */
  height: 3px;
  border-radius: 3px;
}

/* 输入框：背景填充+金边 */
:deep(.cyan-input .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: none !important;
  border: 1px solid #D1D9D4;
  border-radius: 4px;
  transition: all 0.3s;
}
:deep(.cyan-input .el-input__wrapper.is-focus) {
  border-color: var(--cyan-main) !important;
  background-color: #fff !important;
  box-shadow: 0 0 0 1px var(--cyan-main) inset !important;
}
:deep(.cyan-input .el-input__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--cyan-dark);
}

/* 按钮：景泰蓝风格 (深蓝底+金字) */
.cyan-btn.primary {
  background-color: var(--cyan-main) !important;
  border: 1px solid var(--cyan-main) !important;
  color: #fff !important; /* 金字太花，用白色更清晰，金边框即可 */
  border-bottom: 3px solid var(--cyan-dark) !important; /* 立体感 */
  border-radius: 4px;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 2px;
  font-weight: bold;
  padding: 18px 30px; /* 加大按钮 */
  opacity: 1 !important;
  transition: none;
}
.cyan-btn.primary:hover {
  background-color: var(--cyan-dark) !important;
  border-color: var(--cyan-dark) !important;
  transform: translateY(1px);
  border-bottom-width: 2px !important;
}

</style>