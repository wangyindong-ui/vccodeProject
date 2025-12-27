<template>
  <div class="order-list-view">
    <!-- 1. 顶部搜索区(保持不变) -->
    <div class="chinese-card filter-section">
      <div class="card-title-bar">
        <span class="title-text">:: 订单检索 ::</span>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="输入单号..." class="chinese-input" clearable
            @keyup.enter="handleSearch" @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="客户雅称">
          <el-input v-model="searchForm.customer" placeholder="客户姓名" class="chinese-input" clearable
            @keyup.enter="handleSearch" @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" class="chinese-select" clearable
            style="width: 140px;" @change="handleSearch">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="服务中" value="servicing" />
            <el-option label="已完成" value="done" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="chinese-btn-vermilion" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon> 寻单
          </el-button>
          <el-button class="chinese-btn-default" @click="resetSearch">
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
          <span class="section-title">订单明细录</span>
        </div>
        <div class="right-panel">
          <el-button type="primary" class="chinese-btn-gold" @click="openCreateDialog">
            <el-icon>
              <Plus />
            </el-icon> 新增订单
          </el-button>
          <el-button class="chinese-btn-default" @click="handleExport" :loading="exportLoading">
            <el-icon>
              <Download />
            </el-icon> 导出数据
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" class="chinese-table"
        header-cell-class-name="chinese-th" stripe>
        <el-table-column prop="orderNo" label="订单编号" width="210" fixed />
        <el-table-column prop="customerName" label="客户雅称" width="120" />
        <el-table-column prop="orderType" label="业务类型" width="110">
          <template #default="scope">
            <el-tag effect="plain" type="info" class="chinese-tag">{{ scope.row.orderType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="carModel" label="关联车型" min-width="180" show-overflow-tooltip />
        <el-table-column prop="totalAmount" label="金额 (元)" width="140">
          <template #default="scope">
            <span class="price-text">￥ {{ formatMoney(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesperson" label="销售顾问" width="110" align="center">
          <template #default="scope">
            <span style="color: #7f8c8d;">{{ scope.row.salesmanName || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="当前状态" width="120">
          <template #default="scope">
            <span class="status-dot" :class="scope.row.status"></span>
            <span class="status-text">{{ statusMap[scope.row.status] || scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单吉时" width="180">
          <template #default="scope">
            {{ formatTimeArray(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: #999; font-style: italic;">{{ scope.row.remark || '无备注' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="scope">
            <el-button link class="btn-link-primary" @click="viewDetail(scope.row)">
              <el-icon style="margin-right: 4px"><View /></el-icon>详情
            </el-button>
            <el-button link class="btn-link-danger" @click="handleDelete(scope.row)">
              <el-icon style="margin-right: 4px"><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" background />
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" class="chinese-dialog"
      @close="dialogVisible = false">
      <div class="chinese-form-layout">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="form.customerName" placeholder="输入客户姓名" />
          </el-form-item>

          <el-form-item label="业务类型" prop="orderType">
            <el-select v-model="form.orderType" placeholder="请选择业务类型">
              <el-option label="整车销售" value="vehicle_sales" />
              <el-option label="配件销售" value="parts_sales" />
              <el-option label="维修服务" value="repair_service" />
              <el-option label="保养服务" value="maintenance_service" />
            </el-select>
          </el-form-item>

          <el-form-item label="销售顾问" prop="salesman">
            <el-select v-model="form.salesman" placeholder="请选择销售顾问" :loading="salesmanLoading">
              <el-option v-for="person in salesmanOptions" :key="person.id" :label="person.salesman"
                :value="person.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="关联车型">
            <el-cascader 
              v-model="form.carModel" 
              :options="carOptions" 
              :props="{ checkStrictly: false, emitPath: false }"
              placeholder="请选择车型" 
              clearable 
              style="width: 100%" 
            />
          </el-form-item>

          <el-form-item label="订单金额" prop="totalAmount">
            <el-input-number v-model="form.totalAmount" :min="0" :max="999999999" placeholder="输入金额" />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" rows="3" placeholder="输入备注" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" :loading="submitLoading" @click="submitForm">
            <el-icon style="margin-right: 4px">
              <Upload />
            </el-icon> 提交
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog v-model="exportVisible" title="导出选项" width="400px" class="chinese-dialog">
      <el-form :model="{ exportType }" label-width="80px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportType">
            <el-radio label="all">全部订单</el-radio>
            <el-radio label="current">当前页</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="exportVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" :loading="exportLoading" @click="confirmExport">
            <el-icon style="margin-right: 4px">
              <Download />
            </el-icon> 确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Refresh, Plus, Download, Upload, Select, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, addOrder, exportOrder, delOrder, getLinkCarModels, getSalesmanList, updateOrder } from '../utils/order'

const route = useRoute()

const loading = ref(false)
const exportLoading = ref(false)
const submitLoading = ref(false)
const carLoading = ref(false)
const salesmanLoading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref(null)

const isEdit = ref(false)
const dialogTitle = ref('新增订单登记')

const exportVisible = ref(false)
const exportType = ref('all')

const tableData = ref([])
const carOptions = ref([])
const salesmanOptions = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  orderNo: undefined,
  customer: undefined,
  status: undefined
})

const searchForm = reactive({
  orderNo: '',
  customer: '',
  status: ''
})

const form = reactive({
  id: null,
  customerName: '',
  orderType: '',
  salesman: '',
  carModel: '',
  totalAmount: 0,
  remark: ''
})

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  orderType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  salesman: [{ required: true, message: '请选择接待人员', trigger: 'change' }],
  totalAmount: [{ required: true, message: '金额不能为空', trigger: 'blur' }]
}

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  servicing: '服务中',
  done: '已完成',
  refunded: '已退款'
}

onMounted(async () => {
  const initPromises = [
    getList(),
    fetchSalesmanList(),
    fetchCarModels()
  ]
  
  await Promise.all(initPromises)

  if (route.query.autoModel) {
    const targetModelName = route.query.autoModel
    console.log("检测到自动生成订单请求，车型：", targetModelName)
    
    openCreateDialog()
    
    const matchedId = findCarIdByName(targetModelName)
    
    if (matchedId) {
      form.carModel = matchedId
      form.remark = `[系统] 由库存车型 ${targetModelName} 自动生成`
    } else {
      ElMessage.warning(`未在关联车型库中找到: ${targetModelName}`)
    }
  }
})

const formatTimeArray = (timeArr) => {
  if (!Array.isArray(timeArr) || timeArr.length < 3) return timeArr
  const pad = (n) => String(n).padStart(2, '0')
  const [y, m, d, h = 0, min = 0] = timeArr
  return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}`
}

const getList = () => {
  loading.value = true
  const params = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    orderNo: searchForm.orderNo || undefined,
    customerName: searchForm.customer || undefined,
    status: searchForm.status || undefined
  }

  return getOrderList(params).then(res => {
    if (res.code === 200) {
      const pageData = res.data || {}
      tableData.value = pageData.records || []
      total.value = Number(pageData.total) || 0
    }
  }).catch(err => {
    console.error(err)
    ElMessage.error('获取订单列表失败')
  }).finally(() => {
    loading.value = false
  })
}

const fetchCarModels = async () => {
  carLoading.value = true
  try {
    const res = await getLinkCarModels()
    if (res.code === 200) {
      const rawData = res.data || []
      carOptions.value = rawData.map(item => ({
        ...item,
        disabled: false,
        label: item.label || item.brand,
        value: String(item.id),
        children: (item.children || []).map(car => ({
          ...car,
          label: car.model || car.carModel,
          value: String(car.id)
        }))
      }))
    }
  } catch (err) {
    console.error("获取车型失败", err)
  } finally {
    carLoading.value = false
  }
}

const fetchSalesmanList = async () => {
  salesmanLoading.value = true
  try {
    const res = await getSalesmanList()
    if (res.code === 200) {
      salesmanOptions.value = res.data || []
    }
  } finally {
    salesmanLoading.value = false
  }
}

const handleSizeChange = (val) => { queryParams.pageSize = val; queryParams.pageNum = 1; getList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; getList() }
const handleSearch = () => { queryParams.pageNum = 1; getList() }
const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.customer = ''
  searchForm.status = ''
  handleSearch()
}

const findCarIdByName = (name) => {
  if (!name) return ''
  const cleanName = String(name).trim().replace(/\s+/g, '')

  for (const brand of carOptions.value) {
    if (brand.children) {
      for (const car of brand.children) {
        const carLabel = String(car.label || '').trim().replace(/\s+/g, '')
        const carModel = String(car.model || '').trim().replace(/\s+/g, '')
        const carCarModel = String(car.carModel || '').trim().replace(/\s+/g, '')

        if (cleanName === carLabel || cleanName === carModel || cleanName === carCarModel) {
          return String(car.value)
        }
      }
    }
  }
  return ''
}

const openCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增订单登记'
  form.id = null
  form.customerName = ''
  form.orderType = 'vehicle_sales'
  form.salesman = ''
  form.carModel = ''
  form.totalAmount = 0
  form.remark = ''
  dialogVisible.value = true
}

const viewDetail = async (row) => {
  isEdit.value = true
  dialogTitle.value = '订单详情'

  if (carOptions.value.length === 0) await fetchCarModels()
  if (salesmanOptions.value.length === 0) await fetchSalesmanList()

  form.id = row.id
  form.customerName = row.customerName
  form.orderType = row.orderType
  form.salesman = row.salesman
  form.totalAmount = row.totalAmount
  form.remark = row.remark
  form.carModel = findCarIdByName(row.carModel)

  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      const requestApi = isEdit.value ? updateOrder : addOrder
      const successMsg = isEdit.value ? '订单更新成功' : '订单创建成功'

      requestApi(form).then(() => {
        ElMessage.success(successMsg)
        dialogVisible.value = false
        getList()
      }).finally(() => {
        submitLoading.value = false
      })
    }
  })
}

const handleExport = () => { exportVisible.value = true }
const confirmExport = () => {
  exportLoading.value = true
  const params = {
    orderNo: searchForm.orderNo || undefined,
    customerName: searchForm.customer || undefined,
    status: searchForm.status || undefined
  }
  if (exportType.value === 'current') {
    params.pageNum = queryParams.pageNum
    params.pageSize = queryParams.pageSize
  }
  exportOrder(params).then(res => {
    if (res.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = () => { const error = JSON.parse(reader.result); ElMessage.error(error.message || '导出失败') }
        reader.readAsText(res)
        return
    }
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `订单报表_${new Date().getTime()}.xlsx`
    link.click()
    ElMessage.success('导出成功')
    exportVisible.value = false
  }).finally(() => { exportLoading.value = false })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除订单 "${row.orderNo}" 吗？`, '警告', { confirmButtonText: '确定删除', type: 'warning' }).then(() => {
    delOrder(row.id).then(() => { ElMessage.success('删除成功'); getList() })
  })
}

const formatMoney = (val) => {
  if (!val) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$border-color: #E5E0D5;

.order-list-view {
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

  .price-text {
    color: $vermilion;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;

    &.pending {
      background-color: #F39C12;
    }

    &.paid {
      background-color: $imperial-gold;
      box-shadow: 0 0 3px $imperial-gold;
    }

    &.servicing {
      background-color: #2980B9;
    }

    &.done {
      background-color: #27AE60;
    }

    &.refunded {
      background-color: #7F8C8D;
    }
  }

  .chinese-tag {
    background-color: transparent;
    border-color: #D6DBDF;
    color: #5D6D7E;
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

  .btn-link-danger {
    color: #E74C3C;
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

.chinese-popper,
.chinese-cascader-popper {
  .el-select-dropdown__item.selected,
  .el-cascader-node.is-active {
    color: $vermilion !important;
    font-weight: bold;
    font-family: 'Noto Serif SC', serif;
  }

  .el-select-dropdown__item,
  .el-cascader-node {
    font-family: 'Noto Serif SC', serif;
    color: $ink-black;
  }
}
</style>
