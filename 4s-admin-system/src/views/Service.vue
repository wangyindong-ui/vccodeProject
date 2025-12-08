<template>
  <el-card>
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-form :inline="true" :model="filters" class="demo-form-inline">
        <el-form-item label="车牌号">
          <el-input v-model="filters.plate" placeholder="例如：京A88888" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" style="width: 120px">
            <el-option label="全部" value="" />
            <!-- 修改：value 使用数字 -->
            <el-option label="待维修" :value="1" />
            <el-option label="维修中" :value="2" />
            <el-option label="已完工" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="warning" icon="Plus" @click="dialogVisible = true">登记工单</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <el-table :data="filteredData" border style="width: 100%">
      <el-table-column prop="orderNo" label="工单编号" width="140" />
      <el-table-column prop="plate" label="车牌号" width="120" />
      <el-table-column prop="owner" label="车主" width="100" />
      <el-table-column prop="issue" label="故障描述" show-overflow-tooltip />
      
      <!-- 修改：使用自定义模板格式化时间数组 -->
      <el-table-column label="进厂时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.entryTime) }}
        </template>
      </el-table-column>

      <!-- 修改：状态映射处理 -->
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <!-- 修改：判断逻辑改为数字 -->
          <el-button 
            v-if="scope.row.status === 1" 
            size="small" type="primary" 
            @click="updateStatus(scope.row, 2)"
          >开始维修</el-button>
          <el-button 
            v-if="scope.row.status === 2" 
            size="small" type="success" 
            @click="updateStatus(scope.row, 3)"
          >完工结算</el-button>
          <el-button size="small" link type="primary">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 登记弹窗 -->
  <el-dialog v-model="dialogVisible" title="登记新维修工单" width="500px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="车牌号">
        <el-input v-model="form.plate" />
      </el-form-item>
      <el-form-item label="车主姓名">
        <el-input v-model="form.owner" />
      </el-form-item>
      <el-form-item label="故障描述">
        <el-input v-model="form.issue" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAdd">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const dialogVisible = ref(false)
const filters = ref({ plate: '', status: '' })
const form = ref({ plate: '', owner: '', issue: '' })
const tableData = ref([])

// 核心修改 1：时间格式化工具函数
// 将 [2025, 12, 6, 15, 11, 2] 转换为 "2025-12-06 15:11:02"
const formatTime = (timeArray) => {
  if (!Array.isArray(timeArray) || timeArray.length < 6) return '-'
  const [y, m, d, h, min, s] = timeArray
  const pad = (num) => String(num).padStart(2, '0')
  return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${pad(s)}`
}

// 核心修改 2：状态码映射
const getStatusText = (status) => {
  const map = { 1: '待维修', 2: '维修中', 3: '已完工' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  if (status === 3) return 'success' // 已完工
  if (status === 2) return 'warning' // 维修中
  return 'info' // 待维修
}

// 获取数据
const loadData = async () => {
  try {
    const res = await request.get('/services')
    // 接口返回结构是 { code: 200, data: [...] }
    if (res && res.data) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error("加载失败", error)
  }
}

// 前端过滤逻辑 (因为你希望简单起见前端做过滤)
const filteredData = computed(() => {
  return tableData.value.filter(item => {
    // 过滤车牌
    const matchPlate = !filters.value.plate || item.plate.includes(filters.value.plate)
    // 过滤状态 (注意类型转换，filters.value.status 可能是空字符串)
    const matchStatus = filters.value.status === '' || item.status === filters.value.status
    return matchPlate && matchStatus
  })
})

const handleSearch = () => {
  // 实际上只需要触发 computed 重新计算，这里留空或者重新请求都可以
  // 如果是前端过滤，这里不需要做任何事，输入框变化会自动触发 filteredData 更新
  // 如果想模拟“点击查询才生效”，可以将 filters 复制一份给 computed 使用
}

// 更新状态 (发送数字状态码)
const updateStatus = async (row, newStatusInt) => {
  try {
    const updatedRow = { ...row, status: newStatusInt }
    await request.put('/services', updatedRow)
    row.status = newStatusInt
    const statusText = getStatusText(newStatusInt)
    ElMessage.success(`状态已更新为：${statusText}`)
  } catch (e) {
    // request.js 会处理错误提示
  }
}

// 新增工单
const handleAdd = async () => {
  const newOrder = {
    plate: form.value.plate,
    owner: form.value.owner,
    issue: form.value.issue,
    orderNo: 'T-' + Date.now().toString().slice(-4), // 模拟生成类似 T-01 的编号
    status: 1 // 默认为待维修(1)
  }
  
  await request.post('/services', newOrder)
  ElMessage.success('登记成功')
  dialogVisible.value = false
  form.value = { plate: '', owner: '', issue: '' } // 清空表单
  loadData() // 重新加载数据
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.action-bar { margin-bottom: 20px; }
</style>