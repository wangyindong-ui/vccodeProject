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
            <el-input v-model="filters.plate" placeholder="请输入车牌" class="chinese-input" @keyup.enter="handleSearch">
              <template #prefix><el-icon>
                  <Search />
                </el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部" class="chinese-select" style="width: 140px"
              popper-class="chinese-popper">
              <el-option label="全部状态" value="" />
              <el-option label="待维修" :value="1" />
              <el-option label="维修中" :value="2" />
              <el-option label="已完工" :value="3" />
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

      <!-- 3. 表格区域 -->
      <el-table :data="tableData" style="width: 100%" class="chinese-table" header-row-class-name="chinese-header"
        v-loading="loading">
        <el-table-column prop="orderNo" label="工单编号" width="160">
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
            <span class="ink-text">{{ scope.row.owner }}</span>
          </template>
        </el-table-column>

        <!-- 新增：车型列 -->
        <el-table-column prop="carModel" label="车型/车款" min-width="160" show-overflow-tooltip>
          <template #default="scope">
            <span class="ink-text">{{ scope.row.carModel || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="issue" label="故障描述" show-overflow-tooltip />

        <!-- 创建时间列 -->
        <el-table-column label="创建时间" width="200">
          <template #default="scope">
            <div class="time-wrapper">
              <el-icon class="gold-icon">
                <Timer />
              </el-icon>
              <span class="num-font">{{ formatTime(scope.row.createTime) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="进厂时间" width="200">
          <template #default="scope">
            <div class="time-wrapper">
              <el-icon class="gold-icon">
                <Timer />
              </el-icon>
              <span class="num-font">{{ formatTime(scope.row.entryTime) }}</span>
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

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 1" link class="action-btn confirm"
              @click="updateStatus(scope.row, 2)">
              开始维修
            </el-button>
            <el-button v-if="scope.row.status === 2" link class="action-btn finish" @click="updateStatus(scope.row, 3)">
              完工结算
            </el-button>
            <el-button link class="action-btn edit" @click="viewDetail(scope.row)">详情</el-button>
            <!-- 新增：删除按钮 -->
            <el-button link class="action-btn delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 4. 分页区域 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 5. 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" class="chinese-dialog"
      :close-on-click-modal="false">
      <div class="cloud-pattern top"></div>

      <el-form :model="form" label-width="100px" class="chinese-form-layout">
        <!-- 仅在编辑时显示工单编号 -->
        <el-form-item label="工单编号" v-if="isEdit">
          <el-input v-model="form.orderNo" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="form.plate" placeholder="例如：京A88888" />
        </el-form-item>
        <el-form-item label="车型/车款">
          <el-input v-model="form.carModel" placeholder="例如：A4L 45 TFSI" />
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
            <el-option label="已完工" :value="3" />
          </el-select>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
// 引入图标
import { Search, Plus, Tools, Timer, Select, Refresh, EditPen } from '@element-plus/icons-vue'

// --- 状态定义 ---
const loading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('登记新维修工单')

const tableData = ref([])



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
  createTime: null
})

// 时间格式化（兼容 [y,m,d,h,min] 或 [y,m,d,h,min,s]）
const formatTime = (timeArray) => {
  if (!Array.isArray(timeArray) || timeArray.length < 5) return '-'
  const [y, m, d, h, min, s] = timeArray
  const pad = (num) => String(num).padStart(2, '0')
  const sec = (s === undefined || s === null) ? '00' : pad(s)
  return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${sec}`
}

// 状态文字映射
const getStatusText = (status) => {
  const map = { 1: '待维修', 2: '维修中', 3: '已完工' }
  return map[status] || '未知'
}

// 状态样式映射 (印章颜色)
const getStatusClass = (status) => {
  if (status === 3) return 'seal-red'   // 已完工 - 红色
  if (status === 2) return 'seal-blue'  // 维修中 - 蓝色
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

// 分页：页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  loadData()
}

// 分页：每页数量变化
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

</script>

<style scoped>
/* 引入衬线字体 (系统回退) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.chinese-style-container {
  --chinese-red: #C0392B;
  /* 朱砂红 */
  --chinese-gold: #D4AC0D;
  /* 帝王金 */
  --chinese-ink: #2C3E50;
  /* 水墨黑 */
  --chinese-border: #E5E0D5;
  /* 边框色 */

  min-height: 100vh;
  padding: 20px;
  position: relative;
  background-color: #F5F2EA;
  /* 米色底 */
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
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.08);
  border-radius: 4px;
}

/* 标题区 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--chinese-gold);
  margin-bottom: 25px;
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
}

.stamp-text {
  color: var(--chinese-red);
  font-family: 'LiSu', 'SimSun', serif;
  /* 隶书 */
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

/* 回纹装饰线 */
.decoration-line {
  height: 20px;
  flex-grow: 1;
  margin-left: 30px;
  background-image: linear-gradient(90deg, transparent 50%, var(--chinese-border) 50%);
  background-size: 10px 100%;
  opacity: 0.5;
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
  transition: none;
}

.chinese-btn:first-child {
  margin-left: 0 !important;
}

/* 1. 查询按钮 (水墨黑) */
.chinese-btn.primary,
.chinese-btn.primary:hover,
.chinese-btn.primary:focus {
  background-color: #2C3E50 !important;
  border-color: #2C3E50 !important;
  color: #fff !important;
  opacity: 1 !important;
}

/* 2. 新增按钮 (帝王金) */
.chinese-btn.gold,
.chinese-btn.gold:hover,
.chinese-btn.gold:focus {
  background-color: #D4AC0D !important;
  border-color: #D4AC0D !important;
  color: #fff !important;
}

/* 3. 重置按钮 (空心黑字) */
.chinese-btn.plain,
.chinese-btn.plain:hover,
.chinese-btn.plain:focus {
  background-color: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
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
  box-shadow: none !important;
}

/* ================================================= */

.dialog-footer {
  text-align: center;
  padding-bottom: 10px;
}

/* 输入框样式覆盖 (底部横线) */
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

/* 表格样式 */
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
}

.seal-gold {
  color: var(--chinese-gold);
  border-color: var(--chinese-gold);
}

.seal-blue {
  color: #2980B9;
  border-color: #2980B9;
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
}

.action-btn.confirm {
  color: var(--chinese-ink);
}

.action-btn.finish {
  color: var(--chinese-red);
}

.action-btn.cancel {
  color: #95A5A6;
}

.action-btn.edit {
  color: #7F8C8D;
}

.action-btn:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* 弹窗祥云纹饰 */
.cloud-pattern {
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
}

.cloud-pattern.top {
  margin-bottom: 20px;
  transform: rotate(180deg);
}

.cloud-pattern.bottom {
  margin-top: 20px;
}

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

/* 分页区域 */
.pagination-wrapper {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: var(--chinese-red) !important;
}

/* 表单布局 */
.chinese-form-layout {
  padding: 0 20px;
}

:deep(.chinese-form-layout .el-input__wrapper),
:deep(.chinese-form-layout .el-select__wrapper),
:deep(.chinese-form-layout .el-textarea__inner) {
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  background-color: transparent;
  padding-left: 0;
  transition: border-color 0.3s;
}

:deep(.chinese-form-layout .el-input__wrapper:hover),
:deep(.chinese-form-layout .el-input__wrapper.is-focus),
:deep(.chinese-form-layout .el-select__wrapper:hover),
:deep(.chinese-form-layout .el-select__wrapper.is-focus) {
  border-bottom-color: var(--chinese-gold) !important;
}

:deep(.chinese-form-layout .el-input__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
}

:deep(.chinese-form-layout .el-form-item__label) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
  font-weight: bold;
}
</style>