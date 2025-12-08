<template>
  <el-card>
    <div class="search-bar">
      <!-- 修改点 1：增加品牌搜索框 -->
      <el-input 
        v-model="queryParams.brand" 
        placeholder="搜索品牌" 
        style="width: 150px; margin-right: 10px" 
        clearable
      />
      <!-- 修改点 2：绑定对象中的 model -->
      <el-input 
        v-model="queryParams.model" 
        placeholder="搜索车型" 
        style="width: 150px; margin-right: 10px" 
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openDialog">新增车型</el-button>
    </div>

    <!-- 修改点 3：直接绑定 tableData，不再使用前端过滤的 filteredData -->
    <el-table :data="tableData" style="width: 100%; margin-top: 20px" border stripe>
      <el-table-column prop="brand" label="品牌" width="125" />
      <el-table-column prop="model" label="车型名称" width="150" />
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
      <el-table-column label="操作" width="190">
        <template #default>
          <el-button link type="primary" size="small">详情</el-button>
          <el-button link type="primary" size="small">生成订单</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增车辆弹窗 -->
  <el-dialog v-model="dialogVisible" title="新车入库" width="500px">
    <el-form :model="form" label-width="100px">
      <!-- 补充：新增时也需要填写品牌，否则无法搜索 -->
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

// 修改点 4：将原来的 search 字符串改为 queryParams 对象
const queryParams = ref({
  brand: '',
  model: ''
})

const dialogVisible = ref(false)
const tableData = ref([])

// 表单数据初始化 (增加了 brand)
const form = ref({ 
  brand: '',
  model: '', 
  price: 0, 
  color: '', 
  stock: 1, 
  status: '在售' 
})

// 获取数据
const loadData = async () => {
  try {
    // 1. 构造查询参数对象 (对应后端的 CarReqVO)
    // 注意：后端使用了 @RequestBody，所以这里直接传对象，不需要再包一层 params
    const reqVO = {
      brand: queryParams.value.brand || null, // 如果为空串则传null，或者后端有处理空串逻辑亦可
      model: queryParams.value.model || null
    }

    // 2. 发送 POST 请求
    // 注意：这里必须用 post，因为 GET 请求无法携带 @RequestBody
    // 假设你后端的地址改为了 /cars/list 或者保持 /cars 但改成 PostMapping
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

// 点击查询按钮
const handleSearch = () => {
  loadData()
}

// 打开弹窗（重置表单）
const openDialog = () => {
  form.value = { brand: '', model: '', price: 0, color: '', stock: 1, status: '在售' }
  dialogVisible.value = true
}

// 新增数据
const handleAdd = async () => {
  // 简单校验
  if(!form.value.brand || !form.value.model) {
    ElMessage.warning('请填写品牌和车型')
    return
  }

  try {
    await request.post('/carKindAdd', form.value)
    
    ElMessage.success('入库成功')
    dialogVisible.value = false
    loadData() // 刷新列表
  } catch (e) {
    // 错误由拦截器处理
  }
}

// 修改点 6：删除了 filteredData computed 属性
// 因为现在是靠后端返回筛选后的数据，不需要前端再过滤了

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