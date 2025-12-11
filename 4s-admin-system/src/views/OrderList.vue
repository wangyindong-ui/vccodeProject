<template>
  <div class="order-list-view">
    <!-- 1. 顶部搜索区 (保持不变) -->
    <div class="chinese-card filter-section">
      <div class="card-title-bar">
        <span class="title-text">:: 订单检索 ::</span>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="输入单号..." class="chinese-input" clearable
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="客户雅称">
          <el-input v-model="searchForm.customer" placeholder="客户姓名" class="chinese-input" clearable
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" class="chinese-select" clearable
            style="width: 140px;" @change="handleSearch">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="服务中" value="servicing" />
            <el-option label="已完成" value="done" />
            <el-option label="已退单" value="refunded" />
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
            <span class="price-text">¥ {{ formatMoney(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesperson" label="销售顾问" width="110" align="center">
          <template #default="scope">
            <span style="color: #7f8c8d;">{{ scope.row.salesmanName || '—' }}</span>
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link class="btn-link-primary" @click="viewDetail(scope.row)">详情</el-button>
            <el-button link class="btn-link-gold" v-if="scope.row.status === 'paid'"
              @click="handleDispatch(scope.row)">派工</el-button>
            <el-button link class="btn-link-danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 3. 弹窗 (复用：新增/详情) -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" class="chinese-dialog"
      :close-on-click-modal="false">
      <div class="cloud-pattern top"></div>

      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" class="chinese-form-layout">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>

        <el-form-item label="业务类型" prop="orderType">
          <el-select v-model="form.orderType" placeholder="请选择" style="width: 100%" popper-class="chinese-popper">
            <el-option label="整车销售" value="vehicle_sales" />
            <el-option label="维修保养" value="maintenance" />
            <el-option label="配件购买" value="accessories" />
          </el-select>
        </el-form-item>

        <el-form-item label="接待人员" prop="salesman">
          <el-select v-model="form.salesman" placeholder="请选择接待顾问" style="width: 100%" popper-class="chinese-popper"
            :loading="salesmanLoading">
            <el-option v-for="item in salesmanOptions" :key="item.id" :label="item.salesman" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联车型" prop="carModel">
          <el-cascader v-model="form.carModel" :options="carOptions" :props="{
            value: 'value',       /* 👈 修改点：必须对应 JS 中处理后的 key */
            label: 'label',       /* 👈 修改点：必须对应 JS 中处理后的 key */
            children: 'children',
            emitPath: false
          }" placeholder="请选择品牌 / 车型" style="width: 100%" filterable clearable :show-all-levels="false"
            :loading="carLoading" popper-class="chinese-cascader-popper">
            <template #default="{ node, data }">
              <!-- 这里也要改用 data.label -->
              <span style="font-family: 'Noto Serif SC', serif">{{ data.label }}</span>
              <span v-if="node.isLeaf && data.price"
                style="color: #999; float: right; margin-left: 10px; font-size: 12px; font-family: Arial">
                ¥{{ data.price }}万
              </span>
            </template>
          </el-cascader>
        </el-form-item>

        <el-form-item label="订单金额" prop="totalAmount">
          <el-input-number v-model="form.totalAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>

        <el-form-item label="备注信息">
          <el-input v-model="form.remark" type="textarea" placeholder="填写备注..." />
        </el-form-item>
      </el-form>

      <div class="cloud-pattern bottom"></div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" :loading="submitLoading" @click="submitForm">
            <el-icon style="margin-right: 4px"><Select /></el-icon>
            {{ isEdit ? '确认' : '确认登记' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 4. 导出选项弹窗 (新增) -->
    <el-dialog
      v-model="exportVisible"
      title="导出数据选项"
      width="400px"
      class="chinese-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div style="padding: 20px 10px;">
        <el-form label-width="80px">
          <el-form-item label="导出范围">
            <el-radio-group v-model="exportType" class="chinese-radio-group">
              <el-radio label="all">导出全部数据</el-radio>
              <el-radio label="current">仅导出当前页</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="tip-text" style="margin-left: 80px; color: #999; font-size: 12px;">
            <span v-if="exportType === 'all'">将导出符合搜索条件的所有数据</span>
            <span v-else>仅导出当前表格显示的 {{ queryParams.pageSize }} 条数据</span>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="exportVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" :loading="exportLoading" @click="confirmExport">
             <el-icon style="margin-right: 4px"><Download /></el-icon> 确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download, Select } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, addOrder, exportOrder, delOrder, dispatchOrder, getLinkCarModels, getSalesmanList, updateOrder } from '../utils/order'
// ... 保持其他 import 不变
// ...

// 新增：导出相关的状态
const exportVisible = ref(false)
const exportType = ref('all') // 默认导出全部

// ... 

// 1. 点击“导出数据”按钮：只负责打开弹窗
const handleExport = () => {
  exportVisible.value = true
}

// 2. 弹窗中点击“确认导出”：执行真正的请求
const confirmExport = () => {
  exportLoading.value = true
  
  // 基础搜索参数 (搜索框里的内容)
  const params = {
    orderNo: searchForm.orderNo || undefined,
    customerName: searchForm.customer || undefined, // 注意后端接收的字段名是 customerName
    status: searchForm.status || undefined
  }
  
  // 核心逻辑：根据用户选择，决定是否传分页参数
  if (exportType.value === 'current') {
    // 【当前页导出】：带上分页参数
    params.pageNum = queryParams.pageNum
    params.pageSize = queryParams.pageSize
  } else {
    // 【全部导出】：不传分页，或传特殊标记告诉后端不要分页
    // 根据您的后端逻辑：如果 param 为空，就进 else 分支查全部
    // 这里我们可以显式不传 pageNum/pageSize
  }
  
  // 发送请求 (响应类型在 order.js 中已设置为 blob)
  exportOrder(params).then(res => {
    // 兼容处理：有时候后端抛异常会返回 JSON 而不是 Blob
    if (res.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = () => {
            const error = JSON.parse(reader.result)
            ElMessage.error(error.message || '导出无数据或失败')
        }
        reader.readAsText(res)
        return
    }

    // 正常的 Blob 文件流处理
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // 生成文件名
    const typeStr = exportType.value === 'all' ? '全部数据' : `第${queryParams.pageNum}页`
    const fileName = `订单报表_${typeStr}_${new Date().getTime()}.xlsx`
    
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    
    // 释放资源
    window.URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
    exportVisible.value = false // 关闭弹窗
    
  }).catch(err => {
    console.error("导出错误", err)
    ElMessage.error('导出请求失败')
  }).finally(() => {
    exportLoading.value = false
  })
}

// --- 状态定义 ---
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
  refunded: '已退单'
}

onMounted(() => {
  getList()
  fetchCarModels()
  fetchSalesmanList()
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

  getOrderList(params).then(res => {
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

// 获取车型
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
      // console.log("车型数据加载完成:", carOptions.value)
    }
  } catch (err) {
    console.error("获取车型失败", err)
  } finally {
    carLoading.value = false
  }
}

// 获取人员
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

// --- 查找 ID 逻辑 (带调试日志) ---
const findCarIdByName = (name) => {
  if (!name) {
    console.log("❌ 传入的车型名称为空")
    return ''
  }

  const cleanName = String(name).trim().replace(/\s+/g, '')

  for (const brand of carOptions.value) {
    if (brand.children) {
      for (const car of brand.children) {
        // 尝试匹配所有可能的名称字段
        const carLabel = String(car.label || '').trim().replace(/\s+/g, '')
        const carModel = String(car.model || '').trim().replace(/\s+/g, '')
        const carCarModel = String(car.carModel || '').trim().replace(/\s+/g, '')

        if (cleanName === carLabel || cleanName === carModel || cleanName === carCarModel) {
          console.log(`✅ 匹配成功! 找到 ID: ${car.value}`)
          return String(car.value)
        }
      }
    }
  }

  console.warn(`⚠️ 未找到匹配项。当前下拉数据总品牌数: ${carOptions.value.length}`)
  return ''
}

const openCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增订单登记'
  form.id = null
  form.customerName = ''
  form.orderType = ''
  form.salesman = ''
  form.carModel = ''
  form.totalAmount = 0
  form.remark = ''
  dialogVisible.value = true
}

const viewDetail = async (row) => {
  isEdit.value = true
  dialogTitle.value = '订单详情'

  console.log("👉 点击详情，当前行数据:", row)

  if (carOptions.value.length === 0) await fetchCarModels()
  if (salesmanOptions.value.length === 0) await fetchSalesmanList()

  form.id = row.id
  form.customerName = row.customerName
  form.orderType = row.orderType
  form.salesman = row.salesman
  form.totalAmount = row.totalAmount
  form.remark = row.remark

  // 尝试查找 ID
  const foundId = findCarIdByName(row.carModel)

  // 无论是否找到，都赋值。如果没有找到，赋值为空，级联框将显示“请选择”
  form.carModel = foundId

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

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除订单 "${row.orderNo}" 吗？`, '警告', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }).then(() => {
    delOrder(row.id).then(() => { ElMessage.success('删除成功'); getList() })
  })
}

const handleDispatch = (row) => {
  ElMessageBox.confirm('确认对此订单进行派工服务吗？', '提示', { confirmButtonText: '确认派工', type: 'info' }).then(() => {
    dispatchOrder({ id: row.id, status: 'servicing' }).then(() => { ElMessage.success('派工成功'); getList() })
  })
}

const viewDetailLog = (row) => {
  // 调试用
}

const formatMoney = (val) => {
  if (!val) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
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

  .chinese-btn-gold {
    background-color: $imperial-gold;
    border-color: $imperial-gold;
    border-radius: 2px;
    font-family: 'Noto Serif SC';

    &:hover {
      background-color: darken($imperial-gold, 8%);
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

 /* 
   * 表格区域样式 + 鼠标悬停动态交互效果
   */
  :deep(.chinese-table) {
    --el-table-header-bg-color: #F9F7F0;
    --el-table-border-color: #EAECEE;
    z-index: 1;
    
    /* 默认单元格内容添加过渡动画，防止悬停时跳变 */
    .cell {
        transition: all 0.3s ease-out;
        /* 防止字体加粗时导致列宽抖动，设置固定行高和间距 */
        display: inline-block;
    }

    .chinese-th {
      color: $ink-black;
      font-weight: bold;
      font-family: 'Noto Serif SC', serif;
      border-bottom: 2px solid $imperial-gold !important;
      font-size: 15px;
    }
    
    /* 普通行背景透明 (与条纹 stripe 配合) */
    .el-table__body tr {
        background-color: transparent;
        transition: transform 0.3s ease, background-color 0.3s; /* 给整行加个轻微过渡 */
    }

    /* --------------------------------- */
    /* === 重点修改：鼠标悬停交互效果 === */
    /* --------------------------------- */
    .el-table__body tr:hover > td {
      /* 背景色变成极淡的米黄色 (接近宣纸)，不刺眼 */
      background-color: rgba(254, 249, 231, 0.8) !important;
      cursor: pointer;
    }

    /* 文字动态效果：加粗并稍微变色 */
    .el-table__body tr:hover .cell {
        color: $ink-black;
        font-weight: 600;      /* 字体微微加粗 */
        transform: scale(1.02); /* 文字本身轻微放大，产生“浮起”感 */
        text-shadow: 0 0 1px rgba(0,0,0,0.1); /* 加一点点文字阴影，增强质感 */
    }

    /* 单独给第一列（订单编号）加更强的提示色 */
    .el-table__body tr:hover > td:first-child .cell {
        color: $vermilion;     /* 鼠标移上去，订单号变朱砂红 */
        font-weight: bold;
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

    :deep(.el-pagination.is-background .el-pager li.is-active) {
      background-color: $vermilion !important;
    }
  }

  /* 
   * =========================================
   *  新增：弹窗内部的“新中式”表单样式覆盖 
   * =========================================
   */
  .chinese-form-layout {
    padding: 0 20px;

    /* 输入框去边框，留底线 */
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper),
    :deep(.el-textarea__inner) {
      box-shadow: none !important;
      border-bottom: 1px solid $ink-black !important;
      border-radius: 0;
      background-color: transparent;
      padding-left: 0;
      transition: border-color 0.3s;

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

  /* 祥云纹饰 */
  .cloud-pattern {
    height: 20px;
    background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;

    &.top {
      margin-bottom: 20px;
      transform: rotate(180deg);
    }

    &.bottom {
      margin-top: 20px;
    }
  }

  /* 弹窗底部按钮样式 */
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

<!-- 全局样式覆盖：弹窗和下拉框 -->
<style lang="scss">
$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$rice-paper: #F9F7F0;

/* 1. 弹窗整体风格 */
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

/* 2. 下拉框选中样式 */
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