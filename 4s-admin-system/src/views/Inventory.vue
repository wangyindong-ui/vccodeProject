<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <!-- 顶部统计区域：改为中式匾额风格 -->
    <el-row :gutter="20" style="margin-bottom: 25px; position: relative; z-index: 1;">
      <el-col :span="8">
        <div class="stat-panel">
          <div class="stat-icon ink-icon"><el-icon>
              <Box />
            </el-icon></div>
          <div class="stat-content">
            <div class="stat-label">库存总件数</div>
            <div class="stat-value num-font">{{ inventoryStats.totalStock }}</div>
          </div>
          <div class="corner-pattern"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-panel">
          <div class="stat-icon gold-icon"><el-icon>
              <Money />
            </el-icon></div>
          <div class="stat-content">
            <div class="stat-label">库存总金额(元)</div>
            <div class="stat-value num-font text-gold">{{ formatMoney(inventoryStats.totalAmount) }}</div>
          </div>
          <div class="corner-pattern"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-panel">
          <div class="stat-icon red-icon"><el-icon>
              <Warning />
            </el-icon></div>
          <div class="stat-content">
            <div class="stat-label">缺货预警项</div>
            <div class="stat-value num-font text-red">
              {{ inventoryStats.shortageWarning }}
            </div>
          </div>
          <div class="corner-pattern"></div>
        </div>
      </el-col>
    </el-row>

    <el-card class="chinese-card">
      <!-- 顶部标题区 -->
      <div class="card-header">
        <div class="header-left">
          <!-- 模拟印章 -->
          <div class="stamp-box">
            <span class="stamp-text">配件</span>
          </div>
          <span class="title-text">库存典籍 · 雅集</span>
        </div>
        <!-- 回纹装饰线 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="search-group">
          <el-input v-model="searchKey" placeholder="输入配件名称" class="chinese-input" style="width: 260px" clearable
            @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon>
                <Search />
              </el-icon></template>
          </el-input>

          <!-- 按钮组：固定颜色，无悬停变色 -->
          <el-button class="chinese-btn primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon> 检索
          </el-button>

          <el-button class="chinese-btn plain" @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon> 重置
          </el-button>
        </div>

        <div class="btn-group">
          <el-button class="chinese-btn gold" @click="openDialog">
            <el-icon>
              <EditPen />
            </el-icon> 配件入库
          </el-button>
        </div>
      </div>

      <!-- 桌面端表格区域 -->
      <el-table :data="tableData" style="width: 100%" class="chinese-table desktop-only" header-row-class-name="chinese-header"
        v-loading="loading">
        <el-table-column prop="code" label="编号" width="140">
          <template #default="scope">
            <span class="num-font" style="font-weight: bold;">{{ scope.row.code }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="配件名称" min-width="150">
          <template #default="scope">
            <span class="ink-text font-song">{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <span class="category-text">{{ scope.row.category }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="location" label="库位" width="120">
          <template #default="scope">
            <span class="num-font">{{ scope.row.location }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="单价(元)" width="130" sortable>
          <template #default="scope">
            <span class="num-font">¥ {{ formatMoney(scope.row.price) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="当前库存" width="160" sortable>
          <template #default="scope">
            <div class="stock-info">
              <span :class="['num-font', scope.row.stock < 10 ? 'text-red' : 'text-ink']" style="font-size: 16px;">
                {{ scope.row.stock }}
              </span>
              <span class="unit-text">{{ scope.row.unit }}</span>
              <!-- 如果缺货，显示一个小印章 -->
              <span v-if="scope.row.stock < 10" class="warning-seal">缺</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link class="action-btn confirm" @click="handleEdit(scope.row)">修缮</el-button>
            <el-button link class="action-btn finish" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片视图 -->
      <div class="mobile-card-list mobile-only" v-loading="loading">
        <div v-for="item in tableData" :key="item.id" class="inventory-card">
          <!-- 卡片头部 -->
          <div class="card-header-mobile">
            <div class="card-title-row">
              <span class="item-name">{{ item.name }}</span>
              <span v-if="item.stock < 10" class="warning-badge">缺货</span>
            </div>
            <div class="item-code">编号: {{ item.code }}</div>
          </div>
          
          <!-- 卡片主体信息 -->
          <div class="card-body-mobile">
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">分类</span>
                <span class="info-value category-tag">{{ item.category }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">库位</span>
                <span class="info-value location-tag">{{ item.location }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">单价</span>
                <span class="info-value price-value">¥{{ formatMoney(item.price) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">库存</span>
                <span class="info-value stock-value" :class="{ 'low-stock': item.stock < 10 }">
                  {{ item.stock }} {{ item.unit }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 卡片操作按钮 -->
          <div class="card-actions-mobile">
            <el-button size="small" class="chinese-btn plain" @click="handleEdit(item)">
              <el-icon><EditPen /></el-icon> 修缮
            </el-button>
            <el-button size="small" class="chinese-btn danger" @click="handleDelete(item)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
        
        <!-- 移动端空状态 -->
        <div v-if="tableData.length === 0 && !loading" class="empty-state-mobile">
          <el-icon class="empty-icon"><Box /></el-icon>
          <p>暂无配件数据</p>
        </div>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 配件入库/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" class="chinese-dialog"
      :close-on-click-modal="false">
      <div class="cloud-pattern top"></div>

      <el-form :model="form" label-width="100px" class="chinese-form-layout">
        <el-form-item>
          <template #label>
            <span class="required-star">*</span> 配件编号
          </template>
          <el-input v-model="form.code" placeholder="例如：P-2023001" :disabled="isEdit" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span class="required-star">*</span> 配件名称
          </template>
          <el-input v-model="form.name" placeholder="例如：机油滤清器" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%" popper-class="chinese-popper">
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库位">
          <el-select v-model="form.location" placeholder="请选择库位" style="width: 100%" popper-class="chinese-popper">
            <el-option
              v-for="option in stationOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单价(元)">
          <el-input-number v-model="form.price" :precision="2" :step="0.01" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="例如：个、套、支" />
        </el-form-item>
      </el-form>

      <div class="cloud-pattern bottom"></div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" @click="handleSubmit" :loading="submitLoading">
            <el-icon style="margin-right: 4px"><Select /></el-icon>
            {{ isEdit ? '确认修改' : '确认入库' }}
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
import { Search, Plus, Box, Money, Warning, EditPen, Refresh, Select, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const submitLoading = ref(false)
const searchKey = ref('')
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('配件入库登记')

const tableData = ref([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 库存统计数据
const inventoryStats = reactive({
  totalStock: 0,
  totalAmount: 0,
  shortageWarning: 0
})

// 分类选项
const categoryOptions = ref([])

// 库位选项
const stationOptions = ref([])

const form = ref({
  id: null,
  code: '',
  name: '',
  category: '',
  location: '',
  price: 0,
  stock: 0,
  unit: '个'
})

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const res = await request.get('/inventory/inventoryClassification')
    if (res && res.code === 200 && res.data) {
      categoryOptions.value = res.data.map(item => ({
        value: item.dictCode,
        label: item.dictName
      }))
    }
  } catch (e) {
    console.error('加载分类选项失败', e)
  }
}

// 加载库位选项
const loadStationOptions = async () => {
  try {
    const res = await request.get('/inventory/station')
    if (res && res.code === 200 && res.data) {
      stationOptions.value = res.data.map(item => ({
        value: item.id,
        label: item.dictName
      }))
    }
  } catch (e) {
    console.error('加载库位选项失败', e)
  }
}


// 加载库存统计
const loadInventoryStats = async () => {
  try {
    const res = await request.get('/inventory/inventoryParams')
    if (res && res.code === 200 && res.data) {
      inventoryStats.totalStock = res.data.totalStock || 0
      inventoryStats.totalAmount = res.data.totalAmount || 0
      inventoryStats.shortageWarning = res.data.shortageWarning || 0
    }
  } catch (e) {
    console.error('加载库存统计失败', e)
  }
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    if (searchKey.value && searchKey.value.trim() !== '') {
      params.name = searchKey.value.trim()
    }

    const res = await request.get('/inventory/listPage', { params })

    if (res && res.code === 200) {
      const data = res.data || {}

      if (Array.isArray(data)) {
        tableData.value = data
        total.value = data.length
      } else {
        tableData.value = data.records || data.list || []
        total.value = Number(data.total) || 0
      }
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (e) {
    console.error('加载数据失败', e)
    ElMessage.error('加载配件数据失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 格式化金额
const formatMoney = (val) => {
  if (!val) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchKey.value = ''
  pagination.currentPage = 1
  loadData()
}

// 分页：页码变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

// 分页：每页数量变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  loadData()
}

// 打开新增弹窗
const openDialog = () => {
  isEdit.value = false
  dialogTitle.value = '配件入库登记'
  form.value = {
    id: null,
    code: '',
    name: '',
    category: '',
    location: '',
    price: 0,
    stock: 0,
    unit: '个'
  }
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '配件详情'
  form.value = JSON.parse(JSON.stringify(row))
  
  // 确保库位是id值
  if (form.value.location && typeof form.value.location !== 'number') {
    const station = stationOptions.value.find(item => item.label === form.value.location)
    if (station) {
      form.value.location = station.value
    }
  }
  
  dialogVisible.value = true
}


// 删除配件
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配件 ${row.name} 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await request.get(`/inventory/delete`, { params: { id: row.id } })
    ElMessage.success('配件删除成功')
    loadData()
    loadInventoryStats()
  } catch (error) {
    if (error !== 'cancel' && error.message !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.code || !form.value.name) {
    ElMessage.warning('请填写配件编号和名称')
    return
  }

  submitLoading.value = true
  try {
    const payload = {
      code: form.value.code,
      name: form.value.name,
      category: form.value.category,
      location: form.value.location,
      price: form.value.price,
      stock: form.value.stock,
      unit: form.value.unit
    }

    if (isEdit.value && form.value.id) {
      payload.id = form.value.id
      await request.post('/inventory/update', payload)
      ElMessage.success('配件信息更新成功')
    } else {
      await request.post('/inventory/insert', payload)
      ElMessage.success('配件入库成功')
    }

    dialogVisible.value = false
    loadData()
    loadInventoryStats()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '入库失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadInventoryStats()
  loadCategoryOptions()
  loadStationOptions()
})
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

.text-gold {
  color: var(--chinese-gold);
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

/* 统计面板样式 (仿古匾额) */
.stat-panel {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--chinese-border);
  padding: 20px;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.05);
  transition: all 0.3s;
  animation: statPanelEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes statPanelEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.stat-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(44, 62, 80, 0.1);
  border-color: var(--chinese-gold);
}

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 24px;
  margin-right: 15px;
}

.ink-icon {
  background-color: rgba(44, 62, 80, 0.1);
  color: var(--chinese-ink);
}

.gold-icon {
  background-color: rgba(212, 172, 13, 0.1);
  color: var(--chinese-gold);
}

.red-icon {
  background-color: rgba(192, 57, 43, 0.1);
  color: var(--chinese-red);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
  font-family: 'Noto Serif SC', serif;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--chinese-ink);
}

.corner-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid var(--chinese-gold);
  border-right: 2px solid var(--chinese-gold);
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
  font-size: 24px;
  font-weight: bold;
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

/* 回纹装饰线 */
.decoration-line {
  height: 20px;
  flex-grow: 1;
  margin-left: 30px;
  background-image: linear-gradient(90deg, transparent 50%, var(--chinese-border) 50%);
  background-size: 10px 100%;
  opacity: 0.5;
  animation: lineGlow 3s infinite;
}

@keyframes lineGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* 操作栏布局 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-group {
  display: flex;
  align-items: center;
}

/* 按钮样式 */
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

.chinese-btn.primary,
.chinese-btn.primary:hover,
.chinese-btn.primary:focus {
  background-color: #2C3E50 !important;
  border-color: #2C3E50 !important;
  color: #fff !important;
  opacity: 1 !important;
}

.chinese-btn.gold,
.chinese-btn.gold:hover,
.chinese-btn.gold:focus {
  background-color: #D4AC0D !important;
  border-color: #D4AC0D !important;
  color: #fff !important;
}

.chinese-btn.plain,
.chinese-btn.plain:hover,
.chinese-btn.plain:focus {
  background-color: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
}

/* 输入框样式 */
:deep(.chinese-input .el-input__wrapper) {
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
  animation: tableEnter 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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

:deep(.el-table__row) {
  animation: rowEnter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition: all 0.3s;
}

:deep(.el-table__row:nth-child(1)) { animation-delay: 0.1s; }
:deep(.el-table__row:nth-child(2)) { animation-delay: 0.2s; }
:deep(.el-table__row:nth-child(3)) { animation-delay: 0.3s; }
:deep(.el-table__row:nth-child(n+4)) { animation-delay: 0.4s; }

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

:deep(.el-table__body tr:hover) {
  background-color: rgba(212, 172, 13, 0.08) !important;
  transform: translateY(-2px);
}

:deep(.chinese-header th) {
  background-color: #F9F7F0 !important;
  color: var(--chinese-ink) !important;
  font-family: 'Noto Serif SC', serif;
  font-weight: bold;
  border-bottom: 1px solid var(--chinese-gold) !important;
}

.category-text {
  background-color: rgba(44, 62, 80, 0.05);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 13px;
  color: var(--chinese-ink);
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.unit-text {
  font-size: 13px;
  color: #7f8c8d;
}

.warning-seal {
  display: inline-block;
  font-size: 12px;
  color: var(--chinese-red);
  border: 1px solid var(--chinese-red);
  padding: 0 4px;
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
  margin-left: 5px;
  animation: warningSealPulse 2s ease-in-out infinite;
}

@keyframes warningSealPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 8px rgba(192, 57, 43, 0.4);
  }
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

.action-btn.edit {
  color: #7F8C8D;
}

.action-btn:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
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
  animation: pageActivePulse 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes pageActivePulse {
  0% { transform: scale(0.9); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1.05); }
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: var(--chinese-red) !important;
}

/* 表单布局 */
.chinese-form-layout {
  padding: 0 20px;
}

:deep(.chinese-form-layout .el-input__wrapper),
:deep(.chinese-form-layout .el-input-number__wrapper) {
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  background-color: transparent;
  padding-left: 0;
  transition: border-color 0.3s;
}

:deep(.chinese-form-layout .el-input__wrapper:hover),
:deep(.chinese-form-layout .el-input__wrapper.is-focus),
:deep(.chinese-form-layout .el-input-number__wrapper:hover),
:deep(.chinese-form-layout .el-input-number__wrapper.is-focus) {
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

.cloud-pattern {
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
  animation: cloudFloat 2s ease-in-out infinite;
}

.cloud-pattern.top {
  margin-bottom: 20px;
  transform: rotate(180deg);
  animation: cloudFloatReverse 2s ease-in-out infinite;
}

.cloud-pattern.bottom {
  margin-top: 20px;
}

@keyframes cloudFloat {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.7; transform: translateY(-2px); }
}

@keyframes cloudFloatReverse {
  0%, 100% { opacity: 0.3; transform: rotate(180deg) translateY(0); }
  50% { opacity: 0.7; transform: rotate(180deg) translateY(2px); }
}

.dialog-footer {
  text-align: center;
  padding-bottom: 10px;
}

.chinese-btn-default-plain {
  background: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
  font-family: 'Noto Serif SC', serif;
  border-radius: 2px;
}

.chinese-btn-vermilion-solid {
  background-color: #C0392B !important;
  border-color: #C0392B !important;
  color: #fff !important;
  font-family: 'Noto Serif SC', serif;
  border-radius: 2px;
  letter-spacing: 1px;
  margin-left: 15px;
}

/* 必填项星号动画 */
.required-star {
  color: #C0392B;
  font-weight: bold;
  margin-right: 4px;
  display: inline-block;
  animation: pulse-star 1.5s ease-in-out infinite;
}

@keyframes pulse-star {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* Inventory 页面移动端卡片视图已通过 mobile-cards.css 全局样式实现 */
</style>

<style>
.chinese-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(212, 172, 13, 0.3);
  margin-right: 0;
  text-align: center;
}

.chinese-dialog .el-dialog__title {
  font-family: 'Noto Serif SC', serif;
  color: #2C3E50;
  font-weight: bold;
  font-size: 18px;
}

.chinese-dialog .el-dialog__body {
  padding: 10px 20px;
}
</style>