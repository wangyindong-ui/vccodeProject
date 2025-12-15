<template>
  <div class="role-list-view">
    <!-- 1. 顶部搜索区 -->
    <div class="chinese-card filter-section">
      <div class="card-title-bar">
        <span class="title-text">:: 角色检索 ::</span>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" class="chinese-input" clearable
            style="width: 180px;" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model="searchForm.status" placeholder="请选择角色状态" class="chinese-select" clearable
            style="width: 180px;" @change="handleSearch">
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="chinese-btn-vermilion" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon> 寻找
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
          <span class="section-title">角色列表</span>
        </div>
        <div class="right-panel">
          <el-button type="primary" class="chinese-btn-gold" @click="openCreateDialog">
            <el-icon>
              <Plus />
            </el-icon> 新增角色
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" class="chinese-table"
        header-cell-class-name="chinese-th" stripe>
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleKey" label="权限字符串" width="150" />
        <el-table-column prop="status" label="角色状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'" effect="plain">
              {{ scope.row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: #999;">{{ scope.row.remark || '无备注' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link class="btn-link-primary" @click="editRole(scope.row)">编辑</el-button>
            <el-button link class="btn-link-danger" @click="deleteRole(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      class="chinese-dialog"
    >
      <el-form :model="roleForm" label-width="100px" class="chinese-form-layout">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="roleForm.roleKey" placeholder="请输入权限字符" clearable />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model="roleForm.status" placeholder="请选择角色状态" style="width: 100%;">
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="roleForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn-vermilion-solid" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import request from '../utils/request'

// 搜索表单
const searchForm = ref({
  roleName: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const isEdit = ref(false)
const roleForm = ref({
  id: null,
  roleName: '',
  roleKey: '',
  status: 0,
  remark: ''
})

// 格式化时间
const formatTime = (timeArr) => {
  if (!Array.isArray(timeArr) || timeArr.length < 5) return '--'
  const pad = (n) => String(n).padStart(2, '0')
  return `${timeArr[0]}-${pad(timeArr[1])}-${pad(timeArr[2])} ${pad(timeArr[3])}:${pad(timeArr[4])}`
}

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const res = await request.get('/role/roleList', {
      params: {
        pageNo: currentPage.value,
        pageSize: pageSize.value,
        roleName: searchForm.value.roleName,
        status: searchForm.value.status !== '' ? searchForm.value.status : undefined
      }
    })

    if (res && res.code === 200) {
      const data = res.data || {}
      tableData.value = data.records || []
      total.value = data.total || 0
    } else {
      ElMessage.error(res?.message || '加载数据失败')
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRoleList()
}

// 重置
const resetSearch = () => {
  searchForm.value = {
    roleName: '',
    status: ''
  }
  currentPage.value = 1
  fetchRoleList()
}

// 分页变化
const handlePageChange = () => {
  fetchRoleList()
}

// 新增角色
const openCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  roleForm.value = {
    id: null,
    roleName: '',
    roleKey: '',
    status: 0,
    remark: ''
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!roleForm.value.roleName || !roleForm.value.roleKey) {
    ElMessage.warning('请填写角色名称和权限字符')
    return
  }

  try {
    const url = isEdit.value ? '/role/roleEdit' : '/role/roleAdd'
    const res = await request.post(url, roleForm.value)
    if (res && res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchRoleList()
    } else {
      ElMessage.error(res?.message)
    }
  } catch (error) {
    console.error(error)
  }
}

// 编辑角色
const editRole = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  roleForm.value = {
    id: row.id,
    roleName: row.roleName,
    roleKey: row.roleKey,
    status: row.status,
    remark: row.remark || ''
  }
  dialogVisible.value = true
}

// 删除角色
const deleteRole = (row) => {
  ElMessageBox.confirm(
    `确认删除角色 "${row.roleName}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await request.get('/role/roleDelete', { params: { id: row.id } })
      if (res && res.code === 200) {
        ElMessage.success('删除成功')
        fetchRoleList()
      } else {
        ElMessage.error(res?.message)
      }
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 页面加载
onMounted(() => {
  fetchRoleList()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$border-color: #E5E0D5;

.role-list-view {
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
    :deep(.el-input__wrapper) {
      padding: 1px 11px;
      height: 32px;
      box-sizing: border-box;
    }

    :deep(.el-input__inner) {
      font-size: 14px;
      line-height: 30px;
      height: 30px;
      font-family: inherit;
      color: #606266;
      font-weight: 400;
    }

    :deep(.el-input__inner::placeholder) {
      font-size: 14px;
      color: #a8abb2;
      font-weight: 400;
      font-family: inherit;
    }
  }

  .chinese-select {
    :deep(.el-input__wrapper) {
      padding: 1px 11px;
      height: 32px;
      box-sizing: border-box;
    }

    :deep(.el-input__inner) {
      font-size: 14px;
      line-height: 30px;
      height: 30px;
      font-family: inherit;
      color: #606266;
      font-weight: 400;
    }

    :deep(.el-input__inner::placeholder) {
      font-size: 14px;
      color: #a8abb2;
      font-weight: 400;
      font-family: inherit;
    }
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

  .btn-link-primary {
    color: #34495E;
    font-weight: bold;

    &:hover {
      color: $vermilion;
    }
  }

  .btn-link-danger {
    color: $vermilion;
    font-weight: bold;

    &:hover {
      color: darken($vermilion, 10%);
    }
  }

  .pagination-container {
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
    :deep(.el-textarea__inner) {
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
</style>
