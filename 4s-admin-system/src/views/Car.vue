<template>
  <div class="car-list-view">
    <!-- 1. 顶部搜索区 -->
    <div class="chinese-card filter-section">
      <div class="card-title-bar">
        <span class="title-text">:: 车辆检索 ::</span>
      </div>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="车辆品牌">
          <el-input v-model="queryParams.brand" placeholder="输入品牌..." class="chinese-input" clearable
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="车型名称">
          <el-input v-model="queryParams.model" placeholder="输入车型..." class="chinese-input" clearable
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="chinese-btn-vermilion" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon> 寻车
          </el-button>
          <el-button class="chinese-btn-default" @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 2. 数据展示区 -->
    <div class="chinese-card table-section">
      <div class="table-header">
        <div class="left-panel">
          <span class="section-title">库存明细录</span>
        </div>
        <div class="right-panel">
          <el-button type="primary" class="chinese-btn-gold" @click="openDialog">
            <el-icon>
              <Plus />
            </el-icon> 新车入库
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" class="chinese-table"
        header-cell-class-name="chinese-th" stripe>
        <el-table-column prop="brandName" label="品牌" width="140" fixed>
          <template #default="scope">
            <span class="brand-text">{{ scope.row.brandName || scope.row.brand || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="model" label="车型名称" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: #2C3E50; font-weight: bold;">{{ scope.row.model || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="colorName" label="外观颜色" width="130">
          <template #default="scope">
            <div class="color-tag">
              <span class="dot" :style="{ background: getColorCode(scope.row.colorName) }"></span>
              <span>{{ scope.row.colorName || '未填' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="指导价 (万)" width="140">
          <template #default="scope">
            <span class="price-text">¥ {{ formatMoney(scope.row.price) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="当前库存" width="130" align="center">
          <template #default="scope">
            <span :class="['stock-text', (scope.row.stock || 0) < 3 ? 'low-stock' : '']">
              {{ scope.row.stock }} 辆
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <div :class="['status-seal', getStatusClass(scope.row.status)]">
              {{ getStatusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link class="btn-link-primary" @click="handleEdit(scope.row)">详情</el-button>
            <!-- 修改点：添加点击事件 handleGenerateOrder -->
            <el-button link class="btn-link-gold" @click="handleGenerateOrder(scope.row)">生成订单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 3. 新车入库/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" class="chinese-dialog"
      :close-on-click-modal="false">
      <div class="cloud-pattern top"></div>

      <el-form :model="form" label-width="100px" class="chinese-form-layout">
        <el-form-item label="车辆品牌">
          <el-input v-model="form.brandName" placeholder="例如：奥迪" />
        </el-form-item>
        <el-form-item label="车型名称">
          <el-input v-model="form.model" placeholder="例如：A4L" />
        </el-form-item>
        <el-form-item label="车辆颜色">
          <el-input v-model="form.colorName" placeholder="例如：传奇黑" />
        </el-form-item>
        <el-form-item label="指导价(万)">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="销售状态">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%" popper-class="chinese-popper">
            <el-option label="在售" :value="1" />
            <el-option label="停售" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="cloud-pattern bottom"></div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" @click="handleSubmit">
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
import { useRouter } from 'vue-router' // 1. 引入 useRouter
import { ElMessage } from 'element-plus'
import { getCarList, addCar, updateCar } from '../utils/car'
import { Search, Plus, Refresh, Select } from '@element-plus/icons-vue'

const router = useRouter() // 2. 获取路由实例

// 3. 新增：处理生成订单跳转
const handleGenerateOrder = (row) => {
  // 跳转到订单页面，并通过 query 传递车型名称
  // 注意：path: '/orders' 需要根据你 router/index.js 里配置的实际路径来写
  router.push({
    path: '/orders', 
    query: { 
      autoModel: row.model // 将车型名称传过去
    }
  })
}

// --- 状态变量 ---
const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新车入库登记')

const queryParams = reactive({
  brand: '',
  model: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const tableData = ref([])

const form = ref({
  id: null,
  brandName: '',
  model: '',
  price: 0,
  colorName: '',
  stock: 1,
  status: 1
})

// --- 核心：加载数据 ---
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    if (queryParams.brand && queryParams.brand.trim() !== '') {
      params.brand = queryParams.brand.trim()
    }

    if (queryParams.model && queryParams.model.trim() !== '') {
      params.model = queryParams.model.trim()
    }

    const res = await getCarList(params)

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
    console.error(e)
    ElMessage.error('加载车辆数据失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// --- 事件处理 ---
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  queryParams.brand = ''
  queryParams.model = ''
  handleSearch()
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

// 打开新增弹窗
const openDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新车入库登记'
  form.value = { id: null, brandName: '', model: '', price: 0, colorName: '', stock: 1, status: 1 }
  dialogVisible.value = true
}

// 打开编辑详情弹窗
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '车型详情'
  form.value = JSON.parse(JSON.stringify(row)) // 深拷贝回显数据
  dialogVisible.value = true
}

// 统一提交处理
const handleSubmit = async () => {
  if (!form.value.brandName || !form.value.model) {
    ElMessage.warning('请填写品牌和车型')
    return
  }

  try {
    if (isEdit.value) {
      // 编辑
      await updateCar(form.value)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await addCar(form.value)
      ElMessage.success('入库成功')
    }
    dialogVisible.value = false
    loadData() // 刷新列表
  } catch (e) {
    // 错误处理交给拦截器
  }
}

// --- 辅助函数 ---
const formatMoney = (val) => {
  if (!val) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusText = (status) => status === 1 ? '在售' : (status === 2 ? '停售' : '未知')
const getStatusClass = (status) => status === 1 ? 'seal-blue' : (status === 2 ? 'seal-red' : 'seal-gray')

const getColorCode = (name) => {
  const n = String(name || '');
  if (!n) return 'transparent'
  if (n.includes('黑')) return '#2C3E50'
  if (n.includes('白')) return '#F0F0F0'
  if (n.includes('红')) return '#C0392B'
  if (n.includes('蓝')) return '#2980B9'
  if (n.includes('绿') || n.includes('青')) return '#27AE60'
  if (n.includes('黄') || n.includes('金')) return '#F1C40F'
  if (n.includes('银')) return '#BDC3C7'
  if (n.includes('灰') || n.includes('钛')) return '#7F8C8D'
  if (n.includes('棕') || n.includes('咖')) return '#6E2C00'
  if (n.includes('紫')) return '#8E44AD'
  return '#95A5A6'
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$border-color: #E5E0D5;

.car-list-view {
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

  .search-form {
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

  .card-title-bar {
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

  .brand-text {
    font-family: 'Noto Serif SC', serif;
    font-weight: bold;
    color: $ink-black;
  }

  .price-text {
    color: $vermilion;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
  }

  .stock-text {
    font-family: 'Arial', sans-serif;
    color: $ink-black;
  }

  .stock-text.low-stock {
    color: $vermilion;
    font-weight: bold;
  }

  .color-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
  }

  .color-tag:hover {
    transform: rotate(180deg) scale(1.05);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
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
      animation: sealAppear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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

  .btn-link-gold {
    color: $imperial-gold;
    font-weight: bold;
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

  .chinese-form-layout {
    padding: 0 20px;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper),
    :deep(.el-input-number__wrapper) {
      box-shadow: none !important;
      border-bottom: 1px solid $ink-black !important;
      border-radius: 0;
      background-color: transparent;
      padding-left: 0;

      &:hover,
      &.is-focus {
        border-bottom-color: $imperial-gold !important;
      }
    }

    :deep(.el-input__inner) {
      font-family: 'Noto Serif SC', serif;
      color: $ink-black;
    }

    :deep(.el-form-item__label) {
      font-family: 'Noto Serif SC', serif;
      color: $ink-black;
      font-weight: bold;
    }
  }

  .cloud-pattern {
    height: 20px;
    background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
    animation: cloudFloat 2s ease-in-out infinite;

    &.top {
      margin-bottom: 20px;
      transform: rotate(180deg);
    }

    &.bottom {
      margin-top: 20px;
    }
  }

  @keyframes cloudFloat {
    0%, 100% {
      transform: translateY(0px);
      opacity: 0.5;
    }
    50% {
      transform: translateY(-8px);
      opacity: 0.8;
    }
  }

  .dialog-footer {
    text-align: center;
    padding-bottom: 10px;
  }

  .chinese-btn-default-plain {
    background: transparent !important;
    border: 1px solid $ink-black !important;
    color: $ink-black !important;
    font-family: 'Noto Serif SC', serif;
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.05) !important;
    }
  }

  .chinese-btn-vermilion-solid {
    background-color: $vermilion !important;
    border-color: $vermilion !important;
    color: #fff !important;
    font-family: 'Noto Serif SC', serif;
    border-radius: 2px;
    letter-spacing: 1px;
    margin-left: 15px;

    &:hover {
      background-color: darken($vermilion, 10%) !important;
    }
  }
}
</style>

<style lang="scss">
$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;

.chinese-dialog {
  .el-dialog__header {
    border-bottom: 1px solid rgba($imperial-gold, 0.3);
    margin-right: 0;
    text-align: center;

    .el-dialog__title {
      font-family: 'Noto Serif SC', serif;
      color: $ink-black;
      font-weight: bold;
      font-size: 18px;
    }
  }

  .el-dialog__body {
    padding: 10px 20px;
  }
}

.chinese-popper {
  .el-select-dropdown__item.selected {
    color: $vermilion !important;
    font-weight: bold;
    font-family: 'Noto Serif SC', serif;
  }

  .el-select-dropdown__item {
    font-family: 'Noto Serif SC', serif;
    color: $ink-black;
  }
}
</style>