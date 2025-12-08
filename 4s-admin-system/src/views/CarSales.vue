<template>
  <el-card>
    <!-- 搜索栏保持不变 -->
    <div class="search-bar">
      <el-input 
        v-model="queryParams.brand" 
        placeholder="搜索品牌" 
        style="width: 150px; margin-right: 10px" 
        clearable
      />
      <el-input 
        v-model="queryParams.model" 
        placeholder="搜索车型" 
        style="width: 150px; margin-right: 10px" 
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openDialog">新增车型</el-button>
    </div>

    <!-- 表格修改部分 -->
    <el-table :data="tableData" style="width: 100%; margin-top: 20px" border stripe>
      <!-- 1. 品牌：去掉 width，改为 min-width，让其自动撑开 -->
      <el-table-column prop="brand" label="品牌" min-width="125" />
      
      <!-- 2. 车型名称：去掉 width，改为 min-width，作为主要内容，它通常最长，让其自动撑开 -->
      <el-table-column prop="model" label="车型名称" min-width="150" />
      
      <!-- 其他属性列保持固定宽度，因为内容长度可控，固定宽度更美观 -->
      <el-table-column prop="color" label="颜色" width="130" />
      <el-table-column prop="price" label="指导价(万)" width="125" />
      <el-table-column prop="stock" label="库存" width="125" />
      <el-table-column prop="status" label="状态" width="125">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 3. 操作列：建议加上 fixed="right"，并保持固定宽度 -->
      <!-- fixed="right" 确保如果屏幕很窄出现滚动条时，操作栏永远固定在最右侧 -->
      <el-table-column label="操作" width="190" fixed="right">
        <template #default>
          <el-button link type="primary" size="small">详情</el-button>
          <el-button link type="primary" size="small">生成订单</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 弹窗部分保持不变... -->
  <el-dialog v-model="dialogVisible" title="新车入库" width="500px">
    <!-- ...省略内容... -->
    <el-form :model="form" label-width="100px">
      <el-form-item label="车辆品牌">
        <el-input v-model="form.brand" placeholder="例如：奥迪" />
      </el-form-item>
      <el-form-item label="车型名称">
        <el-input v-model="form.model" placeholder="例如：A4L" />
      </el-form-item>
      <el-form-item label="车辆颜色">
        <el-input v-model="form.color" placeholder="例如：传奇黑" />
      </el-form-item>
      <el-form-item label="指导价(万)">
        <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="库存数量">
        <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="销售状态">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="在售" value="在售" />
          <el-option label="缺货" value="缺货" />
          <el-option label="停售" value="停售" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAdd">确定入库</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const queryParams = ref({
  brand: '',
  model: ''
})

const dialogVisible = ref(false)
const tableData = ref([])

const form = ref({ 
  brand: '',
  model: '', 
  price: 0, 
  color: '', 
  stock: 1, 
  status: '在售' 
})

const loadData = async () => {
  try {
    const reqVO = {
      brand: queryParams.value.brand || null,
      model: queryParams.value.model || null
    }
    const res = await request.post('/cars', reqVO)
    
    if (res && res.data) {
      tableData.value = res.data
    } else {
      tableData.value = []
    }
  } catch (e) {
    ElMessage.error('加载车辆数据失败')
  }
}

const handleSearch = () => {
  loadData()
}

const openDialog = () => {
  form.value = { brand: '', model: '', price: 0, color: '', stock: 1, status: '在售' }
  dialogVisible.value = true
}

const handleAdd = async () => {
  if(!form.value.brand || !form.value.model) {
    ElMessage.warning('请填写品牌和车型')
    return
  }
  try {
    await request.post('/carKindAdd', form.value)
    ElMessage.success('入库成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
  }
}

const getStatusType = (status) => {
  if (status === '在售') return 'success'
  if (status === '缺货') return 'warning'
  return 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-bar { display: flex; align-items: center; }
</style>