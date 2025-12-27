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
        <!-- 回纹装饰区 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 操作区 -->
      <div class="action-bar">
        <el-form :inline="true" :model="filters" class="chinese-form">
          <el-form-item label="寻访名">
            <el-input 
              v-model="filters.keyword" 
              placeholder="姓名或联系方式" 
              class="chinese-input"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
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
              @change="handleSearch"
            >
              <el-option label="全部状态" value="" />
              <el-option label="待确认" :value="0" />
              <el-option label="已安排" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已取消" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- 按钮区 -->
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
            
            <el-button link class="action-btn delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
          <el-config-provider :locale="locale">
            <el-date-picker
              v-model="form.appointmentTime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY年MM月DD日 HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              popper-class="chinese-date-picker"
            />
          </el-config-provider>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import request from '../utils/request'
import { Search, Plus, Calendar, EditPen, Select, Refresh } from '@element-plus/icons-vue'

const locale = zhCn

const loading = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const formRef = ref(null)
const carOptions = ref([])   
const userOptions = ref([])  

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})  

const filters = reactive({ keyword: '', status: '' })
const form = ref({ id: null, customerName: '', phone: '', intendedVehicleModel: '', appointmentTime: '', userId: '', remark: '', status: 0 })

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  intendedVehicleModel: [{ required: true, message: '请选择意向车型', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  userId: [{ required: true, message: '请选择接待', trigger: 'change' }],
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
    const res = await request.get('/test-drive', {
      params: {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    })
    if (res && res.data) {
      if (Array.isArray(res.data)) {
        tableData.value = res.data
        pagination.total = res.data.length
      } else {
        tableData.value = res.data.records || res.data.list || []
        pagination.total = Number(res.data.total) || 0
      }
    } else {
      tableData.value = []
      pagination.total = 0
    }
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

const handleSearch = () => { 
  pagination.currentPage = 1
  loadData() 
}

const handleReset = () => {
  filters.keyword = ''
  filters.status = ''
  pagination.currentPage = 1
  loadData()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
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

    // 2. 车型转Number
    if (data.intendedVehicleModel) {
      data.intendedVehicleModel = Number(data.intendedVehicleModel)
    }
    
    // 3. 用户ID转String
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

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除预约记录 "${row.customerName}" 吗？`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await request.get('/delete', { params: { id: row.id } })
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(res?.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
  loadOptions()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$border-color: #E5E0D5;

.chinese-style-container {
  .chinese-card {
    background: #fff;
    border: 1px solid $border-color;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    position: relative;
    background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');
    animation: cardEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transition: all 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      border: 1px solid rgba($imperial-gold, 0.2);
      pointer-events: none;
      z-index: 0;
    }
  }

  @keyframes cardEnter {
    0% {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    70% {
      opacity: 1;
      transform: scale(1.02) translateY(-5px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .action-bar {
    position: relative;
    z-index: 1;

    :deep(.el-form-item) {
      margin-right: 20px;
      margin-bottom: 10px;
    }
  }

  .chinese-input {
    width: 180px;
  }

  .card-header {
    margin-bottom: 18px;
    border-bottom: 1px dashed $border-color;
    padding-bottom: 10px;

    .title-text {
      font-weight: bold;
      color: $ink-black;
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
    }
  }

  .chinese-btn-vermilion {
    background-color: $vermilion;
    border-color: $vermilion;
    border-radius: 2px;
    font-family: 'Noto Serif SC';

    &:hover {
      background-color: darken($vermilion, 8%);
    }
  }

  .chinese-btn-default {
    border-radius: 2px;

    &:hover {
      color: $imperial-gold;
      border-color: $imperial-gold;
      background-color: #FEF9E7;
    }
  }

  .chinese-btn-gold {
    background-color: $imperial-gold;
    border-color: $imperial-gold;
    border-radius: 2px;
    font-family: 'Noto Serif SC';

    &:hover {
      background-color: darken($imperial-gold, 8%);
    }
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    position: relative;
    z-index: 1;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: $ink-black;
      border-left: 4px solid $vermilion;
      padding-left: 10px;
    }
  }

  :deep(.chinese-table) {
    --el-table-header-bg-color: #F9F7F0;
    --el-table-border-color: #EAECEE;
    z-index: 1;
    animation: tableEnter 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    @keyframes tableEnter {
      from {
        opacity: 0;
        transform: scale(0.98) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .chinese-th {
      color: $ink-black;
      font-weight: bold;
      font-family: 'Noto Serif SC', serif;
      border-bottom: 2px solid $imperial-gold !important;
      font-size: 15px;
    }

    .el-table__body tr {
      background-color: transparent;
      transition: all 0.3s;
      animation: rowEnter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .el-table__body tr:nth-child(1) { animation-delay: 0.1s; }
    .el-table__body tr:nth-child(2) { animation-delay: 0.2s; }
    .el-table__body tr:nth-child(3) { animation-delay: 0.3s; }
    .el-table__body tr:nth-child(n+4) { animation-delay: 0.4s; }

    @keyframes rowEnter {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .el-table__body tr:hover>td {
      background-color: rgba(254, 249, 231, 0.8) !important;
      cursor: pointer;
    }

    .el-table__body tr:hover .cell {
      color: $ink-black;
      font-weight: 600;
      transform: scale(1.02);
      text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
    }

    .el-table__body tr td.el-table-fixed-column--left,
    .el-table__body tr td.el-table-fixed-column--right,
    .el-table__header th.el-table-fixed-column--left,
    .el-table__header th.el-table-fixed-column--right {
      background-color: #fff;
      z-index: 10;
    }

    &.el-table--striped .el-table__body tr.el-table__row--striped td.el-table-fixed-column--left,
    &.el-table--striped .el-table__body tr.el-table__row--striped td.el-table-fixed-column--right {
      background-color: #fafafa;
    }

    .el-table__body tr:hover>td.el-table-fixed-column--left,
    .el-table__body tr:hover>td.el-table-fixed-column--right {
      background-color: #FEF9E7 !important;
    }
  }

  .status-seal {
    display: inline-block;
    padding: 2px 8px;
    border: 2px solid;
    border-radius: 4px;
    font-family: 'LiSu', serif;
    font-size: 14px;
    transform: rotate(-5deg);
    font-weight: bold;
    animation: sealAppear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), sealPulse 0.4s ease-in-out 0.5s infinite;

    &.seal-blue {
      color: #2980B9;
      border-color: #2980B9;
    }

    &.seal-red {
      color: $vermilion;
      border-color: $vermilion;
      border-style: dashed;
    }

    &.seal-gray {
      color: #7F8C8D;
      border-color: #7F8C8D;
      border-style: dashed;
    }
  }

  @keyframes sealAppear {
    from {
      opacity: 0;
      transform: scale(0.8) rotate(-15deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(0);
    }
  }

  @keyframes sealPulse {
    0%, 100% {
      transform: scale(1) rotate(-5deg);
    }
    50% {
      transform: scale(1.08) rotate(-5deg);
    }
  }

  .btn-link-primary {
    color: #34495E;
    font-weight: bold;

    &:hover {
      color: $vermilion;
    }
  }

  .btn-link-danger {
    color: $vermilion;
    font-weight: bold;

    &:hover {
      color: darken($vermilion, 10%);
    }
  }

  .pagination-wrapper {
    margin-top: 25px;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 1;
    animation: paginationFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    :deep(.el-pagination.is-background .el-pager li.is-active) {
      background-color: $vermilion !important;
    }
  }

  @keyframes paginationFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>