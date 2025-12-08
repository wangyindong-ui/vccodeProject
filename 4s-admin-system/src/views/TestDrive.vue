<template>
  <el-card>
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-form :inline="true" :model="filters" class="demo-form-inline">
        <el-form-item label="搜索客户">
          <el-input v-model="filters.keyword" placeholder="姓名或手机号" prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="预约状态">
          <el-select v-model="filters.status" placeholder="全部" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="待确认" :value="0" />
            <el-option label="已安排" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="warning" icon="Plus" @click="openDialog()">新建预约</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table :data="filteredData" border stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="customerName" label="客户姓名" width="120" />
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column prop="model" label="意向车型" min-width="160" show-overflow-tooltip />
      
      <el-table-column label="预约时间" width="180">
        <template #default="scope">
          <div style="display: flex; align-items: center; gap: 5px">
            <el-icon><Timer /></el-icon>
            {{ formatTime(scope.row.appointmentTime) }}
          </div>
        </template>
      </el-table-column>
      
      <!-- 修改列名 -->
      <el-table-column prop="userName" label="接待人" width="120" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" effect="light" round>
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button 
            v-if="scope.row.status === 0" 
            link type="primary" size="small" 
            @click="updateStatus(scope.row, 1)"
          >确认安排</el-button>
          
          <el-button 
            v-if="scope.row.status === 1" 
            link type="success" size="small" 
            @click="updateStatus(scope.row, 2)"
          >完成试驾</el-button>
          
          <el-button 
            v-if="[0, 1].includes(scope.row.status)" 
            link type="danger" size="small" 
            @click="updateStatus(scope.row, 3)"
          >取消</el-button>

          <el-button link type="info" size="small" @click="openDialog(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增/编辑弹窗 -->
  <el-dialog 
    v-model="dialogVisible" 
    :title="form.id ? '编辑预约信息' : '新建试驾预约'" 
    width="500px"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="客户姓名" prop="customerName">
        <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
      </el-form-item>
      
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入11位手机号" maxlength="11" />
      </el-form-item>
      
      <!-- 修改：变成接口获取的下拉列表 -->
      <el-form-item label="意向车型" prop="intendedVehicleModel">
        <el-select v-model="form.intendedVehicleModel" placeholder="请选择车型" style="width: 100%">
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
        />
      </el-form-item>
      
      <!-- 修改：变成接口获取的下拉列表，且标签改为接待人 -->
      <el-form-item label="接待人" prop="userId">
        <el-select v-model="form.userId" placeholder="请选择接待人员" style="width: 100%">
          <el-option 
            v-for="user in userOptions" 
            :key="user.id" 
            :label="user.name" 
            :value="user.id" 
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注信息">
        <el-input v-model="form.remark" type="textarea" rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

// --- 状态定义 ---
const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const formRef = ref(null)

// 动态选项数据源
const carOptions = ref([])   // 车型列表
const userOptions = ref([])  // 接待人列表

const filters = reactive({
  keyword: '',
  status: ''
})

const form = ref({
  id: null,
  customerName: '',
  phone: '',
  intendedVehicleModel: '',
  appointmentTime: '',
  userId: '',
  remark: '',
  status: 0
})

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  intendedVehicleModel: [{ required: true, message: '请选择意向车型', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  userId: [{ required: true, message: '请选择接待人', trigger: 'change' }]
}

// --- 辅助函数 ---
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

const getStatusType = (status) => {
  if (status === 1) return 'primary'
  if (status === 2) return 'success'
  if (status === 3) return 'info'
  return 'warning'
}

// --- 核心逻辑 ---

// 1. 获取预约列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/test-drive')
    if (res && res.data) {
      tableData.value = res.data
    } else {
      tableData.value = []
    }
  } catch (e) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 2. 加载下拉选项 (车型 & 员工)
const loadOptions = async () => {
  try {
    // 获取车型
    const resCars = await request.get('/getAllCarName')
    
    // --- 修改开始 ---
    // 判断 resCars 是否存在，以及 resCars.data 是否存在
    if (resCars && resCars.data) {
      carOptions.value = resCars.data
    } else {
      carOptions.value = []
    }
    // --- 修改结束 ---

    // 获取员工 (接待人)
    const resUsers = await request.get('/users/list')
    if (resUsers && resUsers.data) {
      userOptions.value = resUsers.data
    }
  } catch (e) {
    console.error('加载选项数据失败', e)
  }
}

const filteredData = computed(() => {
  return tableData.value.filter(item => {
    const matchKey = !filters.keyword || 
      (item.customerName && item.customerName.includes(filters.keyword)) || 
      (item.phone && item.phone.includes(filters.keyword))
    const matchStatus = filters.status === '' || item.status === filters.status
    return matchKey && matchStatus
  })
})

const handleSearch = () => { loadData() }

const openDialog = (row = null) => {
  // 打开弹窗时，确保选项数据已加载
  if (carOptions.value.length === 0) {
    loadOptions()
  }

  if (row) {
    const data = JSON.parse(JSON.stringify(row))
    if (Array.isArray(data.appointmentTime)) {
        const [y, m, d, h, min, s] = data.appointmentTime
        const pad = n => String(n).padStart(2, '0')
        data.appointmentTime = `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${pad(s || 0)}`
    }
    form.value = data
  } else {
    form.value = { id: null, customerName: '', phone: '', carModel: '', appointmentTime: '', salesMan: '', status: 0 }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('/addTestDrive', form.value)
        ElMessage.success('预约创建成功')
        dialogVisible.value = false
        loadData()
      } catch (e) { }
    }
  })
}

const updateStatus = async (row, newStatus) => {
  try {
    await request.put('/test-drive/status', { id: row.id, status: newStatus })
    row.status = newStatus
    ElMessage.success(`状态已更新为：${getStatusText(newStatus)}`)
  } catch (e) { }
}

onMounted(() => {
  loadData()
  loadOptions() // 页面加载时同时获取下拉选项数据
})
</script>

<style scoped>
.action-bar { margin-bottom: 20px; }
</style>