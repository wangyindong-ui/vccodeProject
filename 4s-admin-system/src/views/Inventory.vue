<template>
  <el-row :gutter="20" style="margin-bottom: 20px">
    <el-col :span="6">
      <el-statistic title="库存配件总数" :value="1520" />
    </el-col>
    <el-col :span="6">
      <el-statistic title="库存总金额(元)" :value="560000" />
    </el-col>
    <el-col :span="6">
      <el-statistic title="缺货预警项" :value="tableData.filter(i => i.stock < 10).length" value-style="color: red" />
    </el-col>
  </el-row>

  <el-card>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <div style="display: flex; gap: 10px;">
        <el-input v-model="searchKey" placeholder="输入配件名称或编号" prefix-icon="Search" style="width: 250px" />
        <el-button type="primary">搜索</el-button>
      </div>
      <el-button type="primary" icon="Plus">配件入库</el-button>
    </div>

    <el-table :data="tableData" border stripe>
      <el-table-column prop="code" label="配件编号" width="120" />
      <el-table-column prop="name" label="配件名称" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="location" label="库位" width="100" />
      <el-table-column prop="price" label="单价(元)" width="100" sortable />
      <el-table-column prop="stock" label="当前库存" width="120" sortable>
        <template #default="scope">
          <span :style="{ color: scope.row.stock < 10 ? 'red' : 'inherit', fontWeight: scope.row.stock < 10 ? 'bold' : 'normal' }">
            {{ scope.row.stock }} {{ scope.row.unit }}
          </span>
          <el-tag v-if="scope.row.stock < 10" size="small" type="danger" style="margin-left: 5px">库存低</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default>
          <el-button size="small" type="primary" link>出库</el-button>
          <el-button size="small" type="primary" link>补货</el-button>
          <el-button size="small" type="info" link>编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const tableData = ref([])

const loadData = async () => {
  const res = await request.get('/inventory')
  tableData.value = res.data
}

onMounted(() => {
  loadData()
})
// ... (保留模板中的 filter 逻辑，例如 item.stock < 10)
</script>