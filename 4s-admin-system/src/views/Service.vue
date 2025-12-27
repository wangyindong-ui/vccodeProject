<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <el-card class="chinese-card">
      <!-- 1. 顶部标题与装饰 -->
      <div class="card-header">
        <div class="header-left">
          <!-- 模拟印章 -->
          <div class="stamp-box">
            <span class="stamp-text">维修</span>
          </div>
          <span class="title-text">售后工单 · 雅集</span>
        </div>
        <!-- 回纹装饰线 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 2. 操作栏 -->
      <div class="action-bar">
        <el-form :inline="true" :model="filters" class="chinese-form">
          <el-form-item label="车牌">
            <el-input v-model="filters.plate" placeholder="请输入车牌" class="chinese-input" clearable @keyup.enter="handleSearch" @clear="handleSearch">
              <template #prefix><el-icon>
                  <Search />
                </el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部" class="chinese-select" style="width: 140px"
              popper-class="chinese-popper" @change="handleSearch">
              <el-option label="全部状态" value="" />
              <el-option label="待维修" :value="1" />
              <el-option label="维修中" :value="2" />
              <el-option label="已派工" :value="3" />
              <el-option label="已完成" :value="4" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <!-- 按钮组：固定颜色，无悬停变色 -->
            <el-button class="chinese-btn primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon> 查询
            </el-button>

            <el-button class="chinese-btn plain" @click="handleReset">
              <el-icon>
                <Refresh />
              </el-icon> 重置
            </el-button>

            <el-button class="chinese-btn gold" @click="openAddDialog">
              <el-icon>
                <EditPen />
              </el-icon> 登记工单
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 3A. 移动端卡片列表 -->
      <div class="mobile-only mobile-card-list" v-loading="loading">
        <div 
          v-for="item in tableData" 
          :key="item.id" 
          class="service-card mobile-card"
        >
          <!-- 卡片内容 -->
          <div class="card-body">
            <div class="info-row">
              <span class="label">车牌号</span>
              <span class="value font-song">{{ item.plate }}</span>
            </div>
            <div class="info-row">
              <span class="label">车主</span>
              <span class="value">{{ item.owner }}</span>
            </div>
            <div class="info-row">
              <span class="label">故障描述</span>
              <span class="value issue-text">{{ item.issue || '-' }}</span>
            </div>
          </div>

          <!-- 卡片底部操作按钮 -->
          <div class="card-actions">
            <!-- 状态标签 -->
            <div :class="['status-seal', getStatusClass(item.status)]" style="margin-right: 8px;">
              {{ getStatusText(item.status) }}
            </div>
            <el-button 
              v-if="item.status === 1 && !item.mechanicId" 
              size="small" 
              type="warning"
              @click="handleDispatch(item)"
            >
              派工
            </el-button>
            <el-button 
              v-if="item.status === 2" 
              size="small" 
              type="success"
              @click="updateStatus(item, 4)"
            >
              完工结算
            </el-button>
            <el-button 
              size="small"
              @click="viewDetail(item)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              @click="handleDelete(item)"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && tableData.length === 0" description="暂无维修工单" />
      </div>

      <!-- 3. 表格区域 - 桌面端 -->
      <div class="table-wrapper">
        <el-table 
          :data="tableData" 
          style="width: 100%" 
          class="chinese-table desktop-only" 
          header-row-class-name="chinese-header"
          v-loading="loading"
        >

        <el-table-column prop="orderNo" label="工单号" width="140">
          <template #default="scope">
            <span class="num-font">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="plate" label="车牌号" width="140">
          <template #default="scope">
            <!-- 车牌使用宋体加粗 -->
            <span class="ink-text font-song" style="font-size: 15px;">{{ scope.row.plate }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="owner" label="车主" width="120">
          <template #default="scope">
            <span class="ink-text">{{ scope.row.owner || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            <div class="time-wrapper">
              <el-icon class="gold-icon">
                <Timer />
              </el-icon>
              <span class="num-font">{{ formatTime(scope.row.createTime) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="scope">
            <div class="time-wrapper">
              <el-icon class="gold-icon">
                <Timer />
              </el-icon>
              <span class="num-font">{{ formatTime(scope.row.updateTime) }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 状态列：印章样式 -->
        <el-table-column prop="status" label="当前状态" width="120">
          <template #default="scope">
            <div :class="['status-seal', getStatusClass(scope.row.status)]">
              {{ getStatusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="scope">
            <el-button v-if="scope.row.status === 1 && !scope.row.mechanicId" link class="action-btn dispatch"
              @click="handleDispatch(scope.row)">
              <el-icon style="margin-right: 2px"><SetUp /></el-icon>派工
            </el-button>
            <el-button v-if="scope.row.status === 2" link class="action-btn finish" @click="updateStatus(scope.row, 4)">
              <el-icon style="margin-right: 2px"><Select /></el-icon>完工结算
            </el-button>
            <el-button link class="action-btn edit" @click="viewDetail(scope.row)">
              <el-icon style="margin-right: 2px"><View /></el-icon>详情
            </el-button>
            <el-button link class="action-btn delete" @click="handleDelete(scope.row)">
              <el-icon style="margin-right: 2px"><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 4. 分页区域 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 登记/编辑工单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" class="chinese-dialog"
      :close-on-click-modal="false">
      <div class="cloud-pattern top"></div>

      <el-form label-width="100px" class="chinese-form-layout">
        <el-form-item label="车牌号">
          <el-input v-model="form.plate" placeholder="例如：京A12345" />
        </el-form-item>
        <el-form-item label="车型">
          <el-input v-model="form.carModel" placeholder="例如：奥迪A6L" />
        </el-form-item>
        <el-form-item label="车主姓名">
          <el-input v-model="form.owner" placeholder="例如：张三" />
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="form.issue" type="textarea" :rows="3" placeholder="请详细描述故障情况..." />
        </el-form-item>
        <el-form-item label="维修状态" v-if="isEdit">
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option label="待维修" :value="1" />
            <el-option label="维修中" :value="2" />
            <el-option label="已完成" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始维修时间" v-if="isEdit && form.startRepairTime">
          <el-input :value="formatTime(form.startRepairTime)" disabled />
        </el-form-item>
        <el-form-item label="结束维修时间" v-if="isEdit && form.endRepairTime">
          <el-input :value="formatTime(form.endRepairTime)" disabled />
        </el-form-item>
      </el-form>

      <div class="cloud-pattern bottom"></div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn vermilion" @click="handleSubmit" :loading="submitLoading">
            <el-icon style="margin-right: 4px"><Select /></el-icon> {{ isEdit ? '确认修改' : '确认登记' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 派工选择弹窗 -->
    <el-dialog v-model="dispatchDialogVisible" title="选择维修师傅" width="400px" class="chinese-dialog"
      :close-on-click-modal="false">
      <div class="cloud-pattern top"></div>
      
      <el-form label-width="100px" class="chinese-form-layout">
        <el-form-item label="工单编号">
          <el-input :value="currentDispatchOrder?.orderNo" disabled />
        </el-form-item>
        <el-form-item label="维修师傅">
          <el-select v-model="selectedMechanicId" placeholder="请选择维修师傅" style="width: 100%"
            :loading="mechanicLoading">
            <el-option 
              v-for="mechanic in mechanicList" 
              :key="mechanic.id" 
              :label="mechanic.name" 
              :value="mechanic.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="cloud-pattern bottom"></div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn plain" @click="dispatchDialogVisible = false">取消</el-button>
          <el-button class="chinese-btn vermilion" @click="confirmDispatch" :loading="dispatchLoading">
            <el-icon style="margin-right: 4px"><Select /></el-icon> 确认派工
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
// 引入图标
import { Search, Plus, Tools, Timer, Select, Refresh, EditPen, SetUp, View, Delete } from '@element-plus/icons-vue'

// --- 状态定义 ---
const loading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('登记新维修工单')

const tableData = ref([])

// 派工相关状态
const dispatchDialogVisible = ref(false)
const dispatchLoading = ref(false)
const mechanicLoading = ref(false)
const mechanicList = ref([])
const selectedMechanicId = ref(null)
const currentDispatchOrder = ref(null)



const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

const filters = reactive({
  plate: '',
  status: ''
})

const form = reactive({
  id: null,
  orderNo: '',
  plate: '',
  carModel: '',
  owner: '',
  issue: '',
  status: 1,
  entryTime: null,
  createTime: null,
  startRepairTime: null,
  endRepairTime: null
})

// 时间格式化（兼容 [y,m,d,h,min] 和 [y,m,d,h,min,s]）
const formatTime = (timeArray) => {
  if (!Array.isArray(timeArray) || timeArray.length < 5) return '-'
  const [y, m, d, h, min, s] = timeArray
  const pad = (num) => String(num).padStart(2, '0')
  const sec = (s === undefined || s === null) ? '00' : pad(s)
  return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${sec}`
}

// 状态文字映射
const getStatusText = (status) => {
  const map = { 1: '待维修', 2: '维修中', 3: '已派工', 4: '已完成' }
  return map[status] || '未知'
}

// 状态样式映射(印章颜色)
const getStatusClass = (status) => {
  if (status === 4) return 'seal-red'   // 已完成 - 红色
  if (status === 2) return 'seal-blue'  // 维修中 - 蓝色
  if (status === 3) return 'seal-green' // 已派工 - 绿色
  return 'seal-gold'                    // 待维修 - 金色
}

// 加载数据：支持分页和过滤
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    }

    // 只在有值时才加入搜索条件
    if (filters.plate && filters.plate.trim() !== '') {
      params.plate = filters.plate.trim()
    }
    if (filters.status !== '') {
      params.status = filters.status
    }

    const res = await request.get('/services/listPage', { params })

    if (res && res.data) {
      // 兼容不同返回格式
      if (Array.isArray(res.data)) {
        tableData.value = res.data
        total.value = res.data.length
      } else if (res.data.records) {
        tableData.value = res.data.records
        total.value = Number(res.data.total) || 0
      } else if (res.data.list) {
        tableData.value = res.data.list
        total.value = Number(res.data.total) || 0
      }
    }
  } catch (error) {
    console.error("加载失败", error)
    ElMessage.error('加载维修工单失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  filters.plate = ''
  filters.status = ''
  queryParams.pageNum = 1
  loadData()
}

// 分页：页码变更
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  loadData()
}

// 分页：每页数量变更
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1
  loadData()
}


// 初始化：加载数据
onMounted(() => {
  loadData()
})


// 更新状态
const updateStatus = async (row, newStatusInt) => {
  try {
    const payload = {
      id: row.id,
      plate: row.plate,
      carModel: row.carModel,
      owner: row.owner,
      issue: row.issue,
      status: newStatusInt
    }
    await request.post(`/services/update`, payload)
    row.status = newStatusInt
    const statusText = getStatusText(newStatusInt)
    ElMessage.success(`状态已更新为：${statusText}`)
    loadData() // 新增：刷新列表
  } catch (e) {
    ElMessage.error('状态更新失败')
  }
}

// 打开新增对话框
const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '登记新维修工单'
  form.id = null
  form.orderNo = ''
  form.plate = ''
  form.carModel = ''
  form.owner = ''
  form.issue = ''
  form.status = 1
  form.entryTime = null
  form.createTime = null
  dialogVisible.value = true
}

// 查看/编辑详情
const viewDetail = (row) => {
  isEdit.value = true
  dialogTitle.value = '工单详情'
  form.id = row.id
  form.orderNo = row.orderNo
  form.plate = row.plate
  form.carModel = row.carModel || ''
  form.owner = row.owner
  form.issue = row.issue
  form.status = row.status
  form.entryTime = row.entryTime
  form.createTime = row.createTime
  form.startRepairTime = row.startRepairTime
  form.endRepairTime = row.endRepairTime
  dialogVisible.value = true
}

// 新增或更新工单
const handleSubmit = async () => {
  if (!form.plate) {
    ElMessage.warning('请填写车牌号')
    return
  }
  if (!form.owner) {
    ElMessage.warning('请填写车主姓名')
    return
  }
  if (!form.issue) {
    ElMessage.warning('请填写故障描述')
    return
  }

  submitLoading.value = true
  try {
    const payload = {
      plate: form.plate,
      carModel: form.carModel,
      owner: form.owner,
      issue: form.issue,
      status: form.status
    }

    if (isEdit.value && form.id) {
      // 修改：使用 POST 请求到 /service/update
      payload.id = form.id
      await request.post(`/services/update`, payload)
      ElMessage.success('工单更新成功')
    } else {
      // 新增
      payload.orderNo = 'T-' + Date.now().toString().slice(-4)
      await request.post('/services/addService', payload)
      ElMessage.success('工单登记成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '登记失败')
  } finally {
    submitLoading.value = false
  }
}
// 删除工单
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工单 ${row.orderNo} 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.get(`/services/delete`, { params: { id: row.id } })
    ElMessage.success('工单删除成功')
    loadData()
  } catch (error) {
    // 只在不是取消操作时才显示错误
    if (error !== 'cancel' && error.message !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 派工操作 - 打开选择维修师傅弹窗
const handleDispatch = async (row) => {
  currentDispatchOrder.value = row
  selectedMechanicId.value = null
  dispatchDialogVisible.value = true
  
  // 获取维修师傅列表
  mechanicLoading.value = true
  try {
    const res = await request.get('/users/selectMachincer')
    if (res.code === 200) {
      mechanicList.value = res.data || []
    } else {
      ElMessage.error('获取维修师傅列表失败')
    }
  } catch (error) {
    console.error('获取维修师傅列表失败', error)
    ElMessage.error('获取维修师傅列表失败')
  } finally {
    mechanicLoading.value = false
  }
}

// 确认派工
const confirmDispatch = async () => {
  if (!selectedMechanicId.value) {
    ElMessage.warning('请选择维修师傅')
    return
  }
  
  dispatchLoading.value = true
  try {
    const res = await request.get('/services/sendUser', {
      params: {
        orderId: currentDispatchOrder.value.id,
        mechanicId: selectedMechanicId.value
      }
    })
    if (res.code === 200) {
      ElMessage.success(res.message || '派工成功')
      dispatchDialogVisible.value = false
      // 派工成功后刷新列表
      loadData()
    } else {
      ElMessage.error(res.message || '派工失败')
    }
  } catch (error) {
    console.error('派工失败', error)
    ElMessage.error('派工失败')
  } finally {
    dispatchLoading.value = false
  }
}

</script>

<style scoped>
/* 引入衬线字体 (系统回退) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.chinese-style-container {
  --chinese-red: #C0392B;
  --chinese-gold: #D4AC0D;
  --chinese-ink: #2C3E50;
  --chinese-border: #E5E0D5;
  min-height: 100vh;
  padding: 20px;
  position: relative;
  background: linear-gradient(-45deg, #F5F2EA, #F9F7F0, #F5F2EA, #F9F7F0);
  background-size: 400% 400%;
  animation: bgGradient 15s ease infinite;
  overflow-x: auto;
}

@keyframes bgGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.action-btn.delete { color: var(--chinese-red); }

/* 字体工具类 */
.font-song {
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-weight: bold;
}

.num-font {
  font-family: 'Times New Roman', serif;
  letter-spacing: 0.5px;
}

.text-red {
  color: var(--chinese-red);
  font-weight: bold;
}

.text-ink {
  color: var(--chinese-ink);
}

/* 宣纸纹理背景 */
.ink-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(245, 242, 234, 0.9), rgba(245, 242, 234, 0.9)),
    url('https://www.transparenttextures.com/patterns/rice-paper-2.png');
  z-index: 0;
  pointer-events: none;
}

/* 卡片容器 */
.chinese-card {
  position: relative;
  z-index: 1;
  border: 1px solid var(--chinese-border);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.08);
  border-radius: 4px;
  animation: cardEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition: all 0.3s ease;
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

.chinese-card:hover {
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.15);
  transform: translateY(-2px);
}

/* 标题区 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--chinese-gold);
  margin-bottom: 25px;
  animation: headerEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes headerEnter {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 印章样式 */
.stamp-box {
  width: 48px;
  height: 48px;
  border: 3px solid var(--chinese-red);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: rgba(192, 57, 43, 0.05);
  animation: stampBounce 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  position: relative;
  overflow: hidden;
}

@keyframes stampBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(2deg);
  }
}

.stamp-box::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: stampShine 3s ease-in-out infinite;
}

@keyframes stampShine {
  0%, 100% {
    transform: rotate(45deg) translate(-100%, -100%);
  }
  50% {
    transform: rotate(45deg) translate(100%, 100%);
  }
}

.stamp-text {
  color: var(--chinese-red);
  font-family: 'LiSu', 'SimSun', serif;
  font-size: 24px;
  font-weight: bold;
  position: relative;
  z-index: 1;
  animation: stampTextGlow 2s ease-in-out infinite;
}

@keyframes stampTextGlow {
  0%, 100% {
    text-shadow: 0 0 0 rgba(192, 57, 43, 0.2);
  }
  50% {
    text-shadow: 0 0 8px rgba(192, 57, 43, 0.5);
  }
}

.title-text {
  font-size: 22px;
  color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 2px;
  font-weight: 700;
  animation: titleSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 回纹装饰区 */
.decoration-line {
  height: 20px;
  flex-grow: 1;
  margin-left: 30px;
  background-image: linear-gradient(90deg, transparent 50%, var(--chinese-border) 50%);
  background-size: 10px 100%;
  opacity: 0.5;
  animation: lineGlow 3s ease-in-out infinite;
}

@keyframes lineGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

/* ================================================= */
/* 按钮样式：强制不透明，强制无悬停变色 */
/* ================================================= */

.chinese-btn {
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
  font-weight: 600;
  margin-left: 12px !important;
  opacity: 1 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: buttonSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes buttonSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chinese-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.chinese-btn:hover::before {
  width: 300px;
  height: 300px;
}

.chinese-btn:first-child {
  margin-left: 0 !important;
}

/* 1. 查询按钮 (水墨风) */
.chinese-btn.primary,
.chinese-btn.primary:hover,
.chinese-btn.primary:focus {
  background-color: #2C3E50 !important;
  border-color: #2C3E50 !important;
  color: #fff !important;
  opacity: 1 !important;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.3);
}

.chinese-btn.primary:hover {
  box-shadow: 0 8px 20px rgba(44, 62, 80, 0.4);
  transform: translateY(-2px);
}

/* 2. 新增按钮 (帝王金) */
.chinese-btn.gold,
.chinese-btn.gold:hover,
.chinese-btn.gold:focus {
  background-color: #D4AC0D !important;
  border-color: #D4AC0D !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(212, 172, 13, 0.3);
}

.chinese-btn.gold:hover {
  box-shadow: 0 8px 20px rgba(212, 172, 13, 0.4);
  transform: translateY(-2px);
}

/* 3. 重置按钮 (空心黑字) */
.chinese-btn.plain,
.chinese-btn.plain:hover,
.chinese-btn.plain:focus {
  background-color: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
}

.chinese-btn.plain:hover {
  background-color: rgba(44, 62, 80, 0.05) !important;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.2);
}

/* 4. 确认按钮 (朱砂红) */
.chinese-btn.vermilion,
.chinese-btn.vermilion:hover,
.chinese-btn.vermilion:focus {
  background-color: #C0392B !important;
  border-color: #C0392B !important;
  color: #fff !important;
  letter-spacing: 2px;
  padding-left: 25px;
  padding-right: 25px;
  box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
}

.chinese-btn.vermilion:hover {
  box-shadow: 0 8px 20px rgba(192, 57, 43, 0.4);
  transform: translateY(-2px);
}

/* ================================================= */

.dialog-footer {
  text-align: center;
  padding-bottom: 10px;
}

/* 输入框样式覆盖(底部横线) */
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

/* 表格容器 - 实现水平滚动条在列表下方 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  margin-bottom: 10px;
}

/* 表格容器滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  height: 12px;
  background-color: #e5e0d5;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #c0392b;
}

.table-wrapper::-webkit-scrollbar-track {
  background-color: #e5e0d5;
  border-radius: 6px;
}

/* 表格样式 */
.chinese-table {
  border: 1px solid var(--chinese-border);
  background: transparent;
  animation: tableEnter 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  min-width: 1540px; /* 确保表格有足够宽度触发滚动 */
}

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

:deep(.chinese-header th) {
  background-color: #F9F7F0 !important;
  color: var(--chinese-ink) !important;
  font-family: 'Noto Serif SC', serif;
  font-weight: bold;
  border-bottom: 1px solid var(--chinese-gold) !important;
  animation: headerColumnEnter 0.5s ease-out;
  position: relative;
}

@keyframes headerColumnEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-table__row) {
  animation: rowEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition: all 0.3s ease;
}

:deep(.el-table__row:nth-child(1)) { animation-delay: 0.1s; }
:deep(.el-table__row:nth-child(2)) { animation-delay: 0.2s; }
:deep(.el-table__row:nth-child(3)) { animation-delay: 0.3s; }
:deep(.el-table__row:nth-child(4)) { animation-delay: 0.4s; }
:deep(.el-table__row:nth-child(5)) { animation-delay: 0.5s; }
:deep(.el-table__row:nth-child(n+6)) { animation-delay: 0.6s; }

@keyframes rowEnter {
  0% {
    opacity: 0;
    transform: translateX(-20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

:deep(.el-table__body tr:hover) {
  background-color: rgba(212, 172, 13, 0.08) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.12);
}

:deep(.el-table__body tr:hover td) {
  color: var(--chinese-ink);
  text-shadow: 0 0 2px rgba(212, 172, 13, 0.3);
}

.ink-text {
  color: var(--chinese-ink);
  font-size: 15px;
}

.time-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
}

.gold-icon {
  color: var(--chinese-gold);
}

/* 状态印章 */
.status-seal {
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid;
  border-radius: 4px;
  font-family: 'LiSu', serif;
  font-size: 14px;
  transform: rotate(-5deg);
  font-weight: bold;
  animation: sealAppear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

@keyframes sealAppear {
  from {
    opacity: 0;
    transform: rotate(-45deg) scale(0.3);
  }
  to {
    opacity: 1;
    transform: rotate(-5deg) scale(1);
  }
}

.status-seal::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: sealShine 3s infinite;
}

@keyframes sealShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.status-seal:hover {
  animation: sealPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes sealPulse {
  0% { transform: rotate(-5deg) scale(1); }
  50% { transform: rotate(-5deg) scale(1.1); }
  100% { transform: rotate(-5deg) scale(1.15); }
}

.seal-gold {
  color: var(--chinese-gold);
  border-color: var(--chinese-gold);
}

.seal-blue {
  color: #2980B9;
  border-color: #2980B9;
}

.seal-green {
  color: #27AE60;
  border-color: #27AE60;
}

.seal-red {
  color: var(--chinese-red);
  border-color: var(--chinese-red);
}

.seal-gray {
  color: #7F8C8D;
  border-color: #7F8C8D;
  border-style: dashed;
}

/* 操作链接 */
.action-btn {
  font-family: 'Noto Serif SC', serif;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: actionButtonEnter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: inline-block;
  cursor: pointer;
  position: relative;
}

@keyframes actionButtonEnter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.action-btn::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.action-btn:hover::after {
  width: 100%;
}

.action-btn.confirm {
  color: var(--chinese-ink);
}

.action-btn.confirm:hover {
  color: var(--chinese-gold);
  text-shadow: 0 0 4px rgba(212, 172, 13, 0.4);
}

.action-btn.finish {
  color: var(--chinese-red);
}

.action-btn.finish:hover {
  color: #A93226;
  text-shadow: 0 0 4px rgba(192, 57, 43, 0.3);
  transform: scale(1.05);
}

.action-btn.cancel {
  color: #95A5A6;
}

.action-btn.cancel:hover {
  color: #5D6D7B;
  transform: scale(1.05);
}

.action-btn.edit {
  color: #7F8C8D;
}

.action-btn.edit:hover {
  color: var(--chinese-gold);
  transform: scale(1.05);
}

.action-btn.dispatch {
  color: #E67E22;
}

.action-btn.dispatch:hover {
  color: #D35400;
  text-shadow: 0 0 4px rgba(230, 126, 34, 0.4);
  transform: scale(1.05);
}

.action-btn.delete {
  color: #E74C3C;
}

.action-btn.delete:hover {
  color: #C0392B;
  text-shadow: 0 0 4px rgba(231, 76, 60, 0.4);
  transform: scale(1.05);
}

.action-btn:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* 弹窗祥云纹饰 */
.cloud-pattern {
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
  animation: cloudFloat 2s ease-in-out infinite;
}

@keyframes cloudFloat {
  0%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-2px);
  }
}

.cloud-pattern.top {
  margin-bottom: 20px;
  transform: rotate(180deg);
  animation: cloudFloatReverse 2s ease-in-out infinite;
}

@keyframes cloudFloatReverse {
  0%, 100% {
    opacity: 0.3;
    transform: rotate(180deg) translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: rotate(180deg) translateY(2px);
  }
}

.cloud-pattern.bottom {
  margin-top: 20px;
}

:global(.chinese-dialog .el-dialog__header) {
  border-bottom: 1px solid var(--chinese-border);
  margin-right: 0;
  text-align: center;
  animation: dialogHeaderSlideDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes dialogHeaderSlideDown {
  from {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top;
  }
}

:global(.chinese-dialog .el-dialog__title) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
  font-weight: bold;
  animation: dialogTitleGlow 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes dialogTitleGlow {
  0%, 100% {
    text-shadow: none;
  }
  50% {
    text-shadow: 0 0 8px rgba(212, 172, 13, 0.4);
  }
}

:global(.chinese-dialog .el-dialog__close) {
  animation: closeButtonAppear 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes closeButtonAppear {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

:global(.chinese-dialog .el-dialog__close:hover) {
  animation: closeButtonSpin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes closeButtonSpin {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(180deg) scale(1.1);
  }
}

:global(.chinese-popper .el-select-dropdown__item.selected) {
  color: var(--chinese-red) !important;
  font-weight: bold;
}

/* 分页区域 */
.pagination-wrapper {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: paginationFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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

:deep(.el-pagination.is-background .el-pager li) {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  transform: scale(1.1);
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: var(--chinese-red) !important;
  animation: pageActivePulse 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes pageActivePulse {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  transition: all 0.3s ease;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: var(--chinese-red);
  transform: scale(1.15);
}

/* 表单布局 */
.chinese-form-layout {
  padding: 0 20px;
  animation: formLayoutEnter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes formLayoutEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.chinese-form-layout .el-form-item) {
  animation: formItemEnter 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:deep(.chinese-form-layout .el-form-item:nth-child(1)) { animation-delay: 0s; }
:deep(.chinese-form-layout .el-form-item:nth-child(2)) { animation-delay: 0.1s; }
:deep(.chinese-form-layout .el-form-item:nth-child(3)) { animation-delay: 0.2s; }
:deep(.chinese-form-layout .el-form-item:nth-child(n+4)) { animation-delay: 0.3s; }

@keyframes formItemEnter {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

:deep(.chinese-form-layout .el-input__wrapper),
:deep(.chinese-form-layout .el-select__wrapper),
:deep(.chinese-form-layout .el-textarea__inner) {
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  background-color: transparent;
  padding-left: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.chinese-form-layout .el-input__wrapper:hover),
:deep(.chinese-form-layout .el-input__wrapper.is-focus),
:deep(.chinese-form-layout .el-select__wrapper:hover),
:deep(.chinese-form-layout .el-select__wrapper.is-focus),
:deep(.chinese-form-layout .el-textarea__inner:hover),
:deep(.chinese-form-layout .el-textarea__inner:focus) {
  border-bottom-color: var(--chinese-gold) !important;
  background-color: rgba(212, 172, 13, 0.03);
  box-shadow: inset 0 -2px 0 rgba(212, 172, 13, 0.2) !important;
}

:deep(.chinese-form-layout .el-input__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
  transition: all 0.2s ease;
}

:deep(.chinese-form-layout .el-form-item__label) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
  font-weight: bold;
  animation: labelSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes labelSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

:global(.chinese-dialog .el-dialog__body) {
  animation: dialogBodyFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

@keyframes dialogBodyFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

:global(.chinese-dialog .el-dialog__footer) {
  animation: dialogFooterSlideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation-delay: 0.15s;
  animation-fill-mode: both;
}

@keyframes dialogFooterSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:global(.chinese-dialog .el-button) {
  font-family: 'Noto Serif SC', serif;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:global(.chinese-dialog .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

:global(.chinese-dialog .el-button.is-primary) {
  background-color: var(--chinese-red) !important;
  border-color: var(--chinese-red) !important;
}

:global(.chinese-dialog .el-button.is-primary:hover) {
  background-color: #A93226 !important;
  border-color: #A93226 !important;
}

/* ==================== 移动端适配样式 ==================== */
@media screen and (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }
  
  /* 移动端操作栏优化 */
  .action-bar :deep(.el-form) {
    display: flex;
    flex-direction: column;
  }
  
  .action-bar :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 12px;
    width: 100%;
  }
  
  .action-bar :deep(.el-input),
  .action-bar :deep(.el-select) {
    width: 100% !important;
  }
  
  .action-bar :deep(.el-button) {
    width: 100%;
    margin: 0 0 8px 0;
  }
  
  /* 卡片内文本优化 */
  .service-card .issue-text {
    word-break: break-all;
    line-height: 1.5;
    max-height: 3em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  /* 状态印章在移动端缩小 */
  .service-card .status-seal {
    transform: scale(0.85) rotate(-5deg);
    font-size: 12px;
    padding: 2px 6px;
  }
  
  /* 分页组件移动端适配 */
  .pagination-wrapper {
    padding: 12px;
    overflow-x: auto;
  }
  
  .pagination-wrapper :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .pagination-wrapper :deep(.el-pagination__total),
  .pagination-wrapper :deep(.el-pagination__sizes) {
    margin-bottom: 8px;
  }
}

/* 桌面端隐藏移动端内容 */
@media screen and (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
  
  .desktop-only {
    display: table !important;
  }
}
</style>