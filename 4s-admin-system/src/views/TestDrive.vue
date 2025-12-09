<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <el-card class="chinese-card">
      <!-- 顶部标题区 -->
      <div class="card-header">
        <div class="header-left">
          <!-- 模拟印章 -->
          <div class="stamp-box">
            <span class="stamp-text">试驾</span>
          </div>
          <span class="title-text">预约管理 · 雅集</span>
        </div>
        <!-- 回纹装饰线 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <el-form :inline="true" :model="filters" class="chinese-form">
          <el-form-item label="寻访客">
            <el-input 
              v-model="filters.keyword" 
              placeholder="姓名或联系方式" 
              class="chinese-input"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item label="当前状态">
            <el-select 
              v-model="filters.status" 
              placeholder="全部" 
              class="chinese-select" 
              style="width: 140px"
              popper-class="chinese-popper"
            >
              <el-option label="全部状态" value="" />
              <el-option label="待确认" :value="0" />
              <el-option label="已安排" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已取消" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- 按钮组 -->
            <el-button class="chinese-btn primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            
            <el-button class="chinese-btn plain" @click="handleReset">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
            
            <el-button class="chinese-btn gold" icon="Plus" @click="openDialog()">
              <el-icon><EditPen /></el-icon> 新增预约
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="filteredData" 
        style="width: 100%" 
        v-loading="loading"
        class="chinese-table"
        header-row-class-name="chinese-header"
      >
        <el-table-column prop="customerName" label="客户姓名" width="120">
          <template #default="scope">
            <span class="ink-text font-song">{{ scope.row.customerName }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="phone" label="联系电话" width="140">
          <template #default="scope">
            <span class="num-font">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="model" label="意向车型" min-width="160" show-overflow-tooltip />
        
        <el-table-column label="预约良辰" width="200">
          <template #default="scope">
            <div class="time-wrapper">
              <el-icon class="gold-icon"><Calendar /></el-icon>
              <span class="num-font">{{ formatTime(scope.row.appointmentTime) }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="userName" label="接待人员" width="120" />
        
        <el-table-column prop="status" label="当前状态" width="120">
          <template #default="scope">
            <!-- 倾斜印章样式 -->
            <div :class="['status-seal', getStatusClass(scope.row.status)]">
              {{ getStatusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              link class="action-btn confirm"
              @click="updateStatus(scope.row, 1)"
            >确认安排</el-button>
            
            <el-button 
              v-if="scope.row.status === 1" 
              link class="action-btn finish"
              @click="updateStatus(scope.row, 2)"
            >完成试驾</el-button>
            
            <el-button 
              v-if="[0, 1].includes(scope.row.status)" 
              link class="action-btn cancel"
              @click="updateStatus(scope.row, 3)"
            >取消</el-button>

            <el-button link class="action-btn edit" @click="openDialog(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="form.id ? '编辑信息' : '预约登记'" 
      width="500px"
      class="chinese-dialog"
    >
      <div class="cloud-pattern top"></div>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="chinese-form-layout">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入11位手机号" maxlength="11" />
        </el-form-item>
        
        <el-form-item label="意向车型" prop="intendedVehicleModel">
          <el-select v-model="form.intendedVehicleModel" placeholder="请选择车型" style="width: 100%" popper-class="chinese-popper">
            <el-option 
              v-for="car in carOptions" 
              :key="car.id" 
              :label="car.model" 
              :value="car.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="form.appointmentTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            popper-class="chinese-popper"
          />
        </el-form-item>
        
        <el-form-item label="接待人员" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择接待人员" style="width: 100%" popper-class="chinese-popper">
            <el-option 
              v-for="user in userOptions" 
              :key="user.id" 
              :label="user.name" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="当前状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%" popper-class="chinese-popper">
            <el-option label="待确认" :value="0" />
            <el-option label="已安排" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注信息">
          <el-input v-model="form.remark" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      
      <div class="cloud-pattern bottom"></div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn vermilion" @click="handleSubmit">
            <el-icon style="margin-right: 4px"><Select /></el-icon> 确认落款
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import { Search, Plus, Calendar, EditPen, Select, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const formRef = ref(null)
const carOptions = ref([])   
const userOptions = ref([])  

const filters = reactive({ keyword: '', status: '' })
const form = ref({ id: null, customerName: '', phone: '', intendedVehicleModel: '', appointmentTime: '', userId: '', remark: '', status: 0 })

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  intendedVehicleModel: [{ required: true, message: '请选择意向车型', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  userId: [{ required: true, message: '请选择接待人', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const formatTime = (val) => {
  if (!val) return '-'
  if (Array.isArray(val)) {
    const [y, m, d, h, min] = val
    const pad = n => String(n).padStart(2, '0')
    return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}`
  }
  return val.replace('T', ' ').substring(0, 16)
}

const statusMap = { 0: '待确认', 1: '已安排', 2: '已完成', 3: '已取消' }
const getStatusText = (status) => statusMap[status] || '未知'

const getStatusClass = (status) => {
  if (status === 1) return 'seal-blue'
  if (status === 2) return 'seal-red'
  if (status === 3) return 'seal-gray'
  return 'seal-gold'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/test-drive')
    if (res && res.data) tableData.value = res.data
    else tableData.value = []
  } catch (e) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const resCars = await request.get('/getAllCarName')
    if (resCars && resCars.data) carOptions.value = resCars.data
    else carOptions.value = []

    const resUsers = await request.get('/users/list')
    if (resUsers && resUsers.data) userOptions.value = resUsers.data
  } catch (e) {}
}

const filteredData = computed(() => {
  return tableData.value.filter(item => {
    const matchKey = !filters.keyword || (item.customerName && item.customerName.includes(filters.keyword)) || (item.phone && item.phone.includes(filters.keyword))
    const matchStatus = filters.status === '' || item.status === filters.status
    return matchKey && matchStatus
  })
})

const handleSearch = () => { loadData() }

const handleReset = () => {
  filters.keyword = ''
  filters.status = ''
  loadData()
}

const openDialog = (row = null) => {
  if (carOptions.value.length === 0) loadOptions()
  
  if (row) {
    const data = JSON.parse(JSON.stringify(row))
    
    // 1. 处理时间
    if (Array.isArray(data.appointmentTime)) {
        const [y, m, d, h, min, s] = data.appointmentTime
        const pad = n => String(n).padStart(2, '0')
        data.appointmentTime = `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${pad(s || 0)}`
    }

    // 2. 车型转 Number
    if (data.intendedVehicleModel) {
      data.intendedVehicleModel = Number(data.intendedVehicleModel)
    }
    
    // 3. 用户ID转 String
    if (data.userId) {
      data.userId = String(data.userId)
    }

    form.value = data
  } else {
    // 新增时清空
    form.value = { id: null, customerName: '', phone: '', intendedVehicleModel: '', appointmentTime: '', userId: '', remark: '', status: 0 }
  }
  dialogVisible.value = true
}

// 核心修改：提交逻辑区分新增和编辑
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          // 编辑模式：调用 editTestDriveStatus 接口 (PUT)
          await request.put('/editTestDriveStatus', form.value)
          ElMessage.success('修改成功')
        } else {
          // 新增模式：调用 addTestDrive 接口 (POST)
          await request.post('/addTestDrive', form.value)
          ElMessage.success('预约创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (e) { }
    }
  })
}

const updateStatus = async (row, newStatus) => {
  try {
    await request.put('/editTestDriveStatus', { id: row.id, status: newStatus })
    row.status = newStatus
    ElMessage.success(`状态已更新为：${getStatusText(newStatus)}`)
  } catch (e) { }
}

onMounted(() => {
  loadData()
  loadOptions()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.chinese-style-container {
  --chinese-red: #C0392B;
  --chinese-gold: #D4AC0D;
  --chinese-ink: #2C3E50;
  --chinese-border: #E5E0D5;
  
  min-height: 100vh;
  padding: 20px;
  position: relative;
  background-color: #F5F2EA;
}

.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: bold; }
.num-font { font-family: 'Times New Roman', serif; letter-spacing: 0.5px; }

.ink-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(245, 242, 234, 0.9), rgba(245, 242, 234, 0.9)),
    url('https://www.transparenttextures.com/patterns/rice-paper-2.png'); 
  z-index: 0;
  pointer-events: none;
}

.chinese-card {
  position: relative;
  z-index: 1;
  border: 1px solid var(--chinese-border);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.08);
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--chinese-gold);
  margin-bottom: 25px;
}

.header-left { display: flex; align-items: center; gap: 15px; }

.stamp-box {
  width: 48px; height: 48px;
  border: 3px solid var(--chinese-red);
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  background-color: rgba(192, 57, 43, 0.05);
}
.stamp-text {
  color: var(--chinese-red);
  font-family: 'LiSu', 'SimSun', serif;
  font-size: 24px;
  font-weight: bold;
}

.title-text {
  font-size: 22px;
  color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 2px;
  font-weight: 700;
}

.decoration-line {
  height: 20px;
  flex-grow: 1;
  margin-left: 30px;
  background-image: linear-gradient(90deg, transparent 50%, var(--chinese-border) 50%);
  background-size: 10px 100%;
  opacity: 0.5;
}

.chinese-btn {
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
  font-weight: 600;
  margin-left: 12px !important;
  opacity: 1 !important;
  transition: none;
}
.chinese-btn:first-child { margin-left: 0 !important; }

.chinese-btn.primary, .chinese-btn.primary:hover, .chinese-btn.primary:focus {
  background-color: #2C3E50 !important;
  border-color: #2C3E50 !important;
  color: #fff !important;
  opacity: 1 !important;
}

.chinese-btn.gold, .chinese-btn.gold:hover, .chinese-btn.gold:focus {
  background-color: #D4AC0D !important;
  border-color: #D4AC0D !important;
  color: #fff !important;
}

.chinese-btn.plain, .chinese-btn.plain:hover, .chinese-btn.plain:focus {
  background-color: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
}

.chinese-btn.vermilion, .chinese-btn.vermilion:hover, .chinese-btn.vermilion:focus {
  background-color: #C0392B !important;
  border-color: #C0392B !important;
  color: #fff !important;
  letter-spacing: 2px;
  padding-left: 25px; padding-right: 25px;
  box-shadow: none !important;
}

.dialog-footer { text-align: center; padding-bottom: 10px; }

:deep(.chinese-input .el-input__wrapper),
:deep(.chinese-select .el-input__wrapper) {
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  background: transparent;
  padding-left: 0;
}
:deep(.el-input__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
}

.chinese-table {
  border: 1px solid var(--chinese-border);
  background: transparent;
}
:deep(.chinese-header th) {
  background-color: #F9F7F0 !important;
  color: var(--chinese-ink) !important;
  font-family: 'Noto Serif SC', serif;
  font-weight: bold;
  border-bottom: 1px solid var(--chinese-gold) !important;
}

.ink-text { color: var(--chinese-ink); font-size: 15px; }
.time-wrapper { display: flex; align-items: center; gap: 6px; color: #555; }
.gold-icon { color: var(--chinese-gold); }

.status-seal {
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid;
  border-radius: 4px;
  font-family: 'LiSu', serif;
  font-size: 14px;
  transform: rotate(-5deg);
  font-weight: bold;
}
.seal-gold { color: var(--chinese-gold); border-color: var(--chinese-gold); }
.seal-blue { color: #2980B9; border-color: #2980B9; }
.seal-red  { color: var(--chinese-red); border-color: var(--chinese-red); }
.seal-gray { color: #7F8C8D; border-color: #7F8C8D; border-style: dashed;}

.action-btn { font-family: 'Noto Serif SC', serif; font-weight: 600; }
.action-btn.confirm { color: var(--chinese-ink); }
.action-btn.finish { color: var(--chinese-red); }
.action-btn.cancel { color: #95A5A6; }
.action-btn:hover { text-decoration: underline; text-underline-offset: 4px; }

.cloud-pattern {
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
}
.cloud-pattern.top { margin-bottom: 20px; transform: rotate(180deg); }
.cloud-pattern.bottom { margin-top: 20px; }

:global(.chinese-dialog .el-dialog__header) {
  border-bottom: 1px solid var(--chinese-border);
  margin-right: 0;
  text-align: center;
}
:global(.chinese-dialog .el-dialog__title) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
  font-weight: bold;
}
:global(.chinese-popper .el-select-dropdown__item.selected) {
  color: var(--chinese-red) !important;
  font-weight: bold;
}
</style>