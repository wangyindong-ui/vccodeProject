<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧：个人简介卡片 -->
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>关于我</span>
            </div>
          </template>
          <div class="user-profile">
            <div class="box-center">
              <el-avatar :size="100" :src="userStore.userInfo.avatar" />
              <div class="user-name">{{ userStore.userInfo.name }}</div>
              <div class="user-role">{{ userStore.userInfo.role || '普通用户' }}</div>
            </div>
          </div>
          <div class="user-bio">
            <div class="user-bio-section">
              <div class="user-bio-section-header">
                <el-icon><Iphone /></el-icon><span>联系电话</span>
              </div>
              <div class="user-bio-section-body">{{ userStore.userInfo.phone }}</div>
            </div>
            <div class="user-bio-section">
              <div class="user-bio-section-header">
                <el-icon><Message /></el-icon><span>电子邮箱</span>
              </div>
              <div class="user-bio-section-body">{{ userStore.userInfo.email }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：编辑资料与修改密码 -->
      <el-col :span="16" :xs="24">
        <el-card>
          <el-tabs v-model="activeTab">
            <!-- 标签页1：基本资料 -->
            <el-tab-pane label="基本资料" name="account">
              <el-form :model="form" label-width="80px" style="margin-top: 20px">
                <el-form-item label="昵称">
                  <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateInfo">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 标签页2：修改密码 -->
            <el-tab-pane label="修改密码" name="password">
              <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px" style="margin-top: 20px">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="pwdForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="pwdForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

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
  // 调用Store更新状态
  userStore.updateProfile(form)
  ElMessage.success('个人资料更新成功')
}

// 修改密码
const handleChangePassword = () => {
  pwdFormRef.value.validate((valid) => {
    if (valid) {
      // 这里模拟后端验证旧密码
      if (pwdForm.oldPassword !== '123456') {
        ElMessage.error('旧密码不正确 (默认: 123456)')
        return
      }
      
      ElMessage.success('密码修改成功，请重新登录')
      // 模拟登出
      userStore.logout()
      // 实际项目中这里应该跳转到登录页
      setTimeout(() => {
        location.reload()
      }, 1000)
    }
  })
}
</script>

<style scoped>
.box-center { margin: 0 auto; display: table; text-align: center; }
.user-name { font-weight: bold; margin-top: 15px; font-size: 20px; }
.user-role { padding-top: 10px; font-weight: 400; font-size: 14px; color: #777; }
.user-bio { margin-top: 20px; color: #606266; }
.user-bio-section { font-size: 14px; padding: 15px 0; border-bottom: 1px solid #dfe6ec; }
.user-bio-section-header { border-bottom: 1px solid #dfe6ec; padding-bottom: 10px; margin-bottom: 10px; font-weight: bold; display: flex; align-items: center; gap: 5px; }
</style>