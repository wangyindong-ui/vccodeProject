<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <el-card class="chinese-card">
      <!-- 顶部标题区 (仿古匾额风格) -->
      <div class="card-header">
        <div class="header-left">
          <!-- 模拟印章 -->
          <div class="stamp-box">
            <span class="stamp-text">字典</span>
          </div>
          <span class="title-text">数据典籍 · 统筹</span>
        </div>
        <!-- 回纹装饰线 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <div class="search-group">
          <el-input 
            v-model="queryParams.dictName" 
            placeholder="搜索字典名称" 
            class="chinese-input"
            style="width: 200px; margin-right: 15px" 
            clearable 
            @clear="handleSearch" 
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <el-input 
            v-model="queryParams.dictType" 
            placeholder="搜索字典类型" 
            class="chinese-input"
            style="width: 200px; margin-right: 15px" 
            clearable 
            @clear="handleSearch" 
          >
            <template #prefix><el-icon><Collection /></el-icon></template>
          </el-input>
          
          <!-- 查询按钮 (水墨黑) -->
          <el-button class="chinese-btn primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 检索
          </el-button>
        </div>
        
        <!-- 新增按钮 (帝王金) -->
        <el-button class="chinese-btn gold" icon="Plus" @click="openDialog()">
          <el-icon><EditPen /></el-icon> 新增字典
        </el-button>
      </div>

      <!-- 表格区域 -->
      <el-table 
        :data="tableData" 
        style="width: 100%; margin-top: 20px"
        class="chinese-table"
        header-row-class-name="chinese-header"
      >
        <el-table-column prop="dictName" label="字典名称" min-width="120">
          <template #default="scope">
            <span class="ink-text font-song" style="font-weight: bold;">{{ scope.row.dictName }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="dictType" label="字典类型" min-width="150">
          <template #default="scope">
            <span class="code-text">{{ scope.row.dictType }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="dictCode" label="字典编码" min-width="100">
          <template #default="scope">
            <span class="num-font">{{ scope.row.dictCode }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <!-- 状态改为印章风格 -->
            <div :class="['status-seal', scope.row.status === '1' ? 'seal-blue' : 'seal-red']">
              {{ scope.row.status === '1' ? '启用' : '停用' }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="ink-text" style="color: #7f8c8d;">{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link class="action-btn edit" @click="openDialog(scope.row)">修缮</el-button>
            <el-button link class="action-btn delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="form.id ? '修缮字典' : '新增字典'" 
      width="500px"
      append-to-body
      class="chinese-dialog"
    >
      <!-- 上方云纹 -->
      <div class="cloud-pattern top"></div>

      <el-form :model="form" label-width="100px" class="chinese-form-layout">
        
        <el-form-item label="字典层级">
          <el-radio-group v-model="categoryType" @change="handleCategoryTypeChange" class="chinese-radio">
            <el-radio label="general">总类</el-radio>
            <el-radio label="sub">分类</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="选择父类" v-if="categoryType === 'sub'">
          <el-select 
            v-model="form.fatherId" 
            placeholder="请选择父类字典" 
            style="width: 100%"
            popper-class="chinese-popper"
            class="chinese-select"
          >
            <el-option 
              v-for="item in fatherDictList" 
              :key="item.id" 
              :label="item.dictName" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="字典名称">
          <el-input v-model="form.dictName" placeholder="例如：用户性别" />
        </el-form-item>

        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" placeholder="例如：sys_user_sex" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="form.status" class="chinese-radio">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注信息" :rows="2" />
        </el-form-item>
      </el-form>

      <!-- 下方云纹 -->
      <div class="cloud-pattern bottom"></div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn vermilion" @click="handleSubmit">
            <el-icon style="margin-right: 4px"><Select /></el-icon> 确认落款
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
// 引入图标
import { Search, Plus, EditPen, Delete, Select, Collection } from '@element-plus/icons-vue'

// --- 状态定义 ---
const queryParams = ref({ dictName: '', dictType: '' })
const dialogVisible = ref(false)
const tableData = ref([])
const fatherDictList = ref([])
const categoryType = ref('general') 

const form = ref({ 
  id: null, 
  fatherId: 0,
  dictName: '', 
  dictType: '', 
  dictCode: '', 
  status: '1', 
  remark: '' 
})

// --- 方法定义 ---

const loadData = async () => {
  try {
    const res = await request.post('/dict/list', queryParams.value)
    if (res && res.data) {
      tableData.value = res.data
    } else {
      tableData.value = []
    }
  } catch (error) {
    ElMessage.error('获取字典列表失败')
  }
}

const loadFatherDicts = async () => {
  try {
    const res = await request.get('/dict/fatherList') 
    if (res && res.data) {
      fatherDictList.value = res.data
    }
  } catch (error) {
    console.error("加载父类字典失败", error)
  }
}

const handleSearch = () => {
  loadData()
}

const openDialog = async (row = null) => {
  await loadFatherDicts()

  if (row) {
    form.value = { ...row }
    form.value.status = String(row.status)
    
    // 判断层级 (注意: fatherId 可能是字符串 '0' 或 数字 0)
    if (!row.fatherId || String(row.fatherId) === '0') {
      categoryType.value = 'general'
      form.value.fatherId = 0
    } else {
      categoryType.value = 'sub'
      // 必须转为字符串以匹配下拉框 (因为 request.js 配置了 json-bigint 转 string)
      form.value.fatherId = String(row.fatherId)
    }
    
  } else {
    categoryType.value = 'general'
    form.value = { 
      id: null, 
      fatherId: 0,
      dictName: '', 
      dictType: '', 
      dictCode: '', 
      status: '1', 
      remark: '' 
    }
  }
  dialogVisible.value = true
}

const handleCategoryTypeChange = (val) => {
  if (val === 'general') {
    form.value.fatherId = 0
  } else {
    form.value.fatherId = null 
  }
}

const handleSubmit = async () => {
  if (!form.value.dictName || !form.value.dictType) {
    ElMessage.warning('名称和类型为必填项')
    return
  }
  
  if (categoryType.value === 'general') {
    form.value.fatherId = 0
  } else {
    if (!form.value.fatherId) {
      ElMessage.warning('请选择父类')
      return
    }
  }

  try {
    if (form.value.id) {
      await request.post('/dict/update', form.value)
      ElMessage.success('更新成功')
    } else {
      await request.post('/dict/add', form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData() 
  } catch (error) { }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除【${row.dictName}】吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.post('/dict/delete', { id: row.id })
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {}
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 引入衬线字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.chinese-style-container {
  --chinese-red: #C0392B;    /* 朱砂红 */
  --chinese-gold: #D4AC0D;   /* 帝王金 */
  --chinese-ink: #2C3E50;    /* 水墨黑 */
  --chinese-border: #E5E0D5; /* 边框色 */
  
  min-height: 100vh;
  padding: 20px;
  position: relative;
  background-color: #F5F2EA; /* 米色底 */
}

/* 字体工具类 */
.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: bold; }
.num-font { font-family: 'Times New Roman', serif; letter-spacing: 0.5px; }
.code-text { font-family: 'Courier New', Courier, monospace; color: #2980B9; font-weight: bold; }
.ink-text { color: var(--chinese-ink); }

/* 宣纸纹理背景 */
.ink-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
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

.header-left { display: flex; align-items: center; gap: 15px; }

/* 印章样式 */
.stamp-box {
  width: 48px; height: 48px;
  border: 3px solid var(--chinese-red);
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  background-color: rgba(192, 57, 43, 0.05);
}
.stamp-text {
  color: var(--chinese-red);
  font-family: 'LiSu', 'SimSun', serif; /* 隶书 */
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

/* 顶部操作区 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-group { display: flex; align-items: center; }

/* ================================================= */
/* 按钮样式 */
/* ================================================= */

.chinese-btn {
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
  font-weight: 600;
  transition: none;
  opacity: 1 !important;
}

/* 1. 查询按钮 (水墨黑) */
.chinese-btn.primary, .chinese-btn.primary:hover, .chinese-btn.primary:focus {
  background-color: #2C3E50 !important;
  border-color: #2C3E50 !important;
  color: #fff !important;
  opacity: 1 !important;
}

/* 2. 新增按钮 (帝王金) */
.chinese-btn.gold, .chinese-btn.gold:hover, .chinese-btn.gold:focus {
  background-color: #D4AC0D !important;
  border-color: #D4AC0D !important;
  color: #fff !important;
}

/* 3. 取消按钮 (空心黑字) */
.chinese-btn.plain, .chinese-btn.plain:hover, .chinese-btn.plain:focus {
  background-color: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
}

/* 4. 确认按钮 (朱砂红) */
.chinese-btn.vermilion, .chinese-btn.vermilion:hover, .chinese-btn.vermilion:focus {
  background-color: #C0392B !important;
  border-color: #C0392B !important;
  color: #fff !important;
  letter-spacing: 2px;
  padding-left: 25px; padding-right: 25px;
  box-shadow: none !important;
}

/* ================================================= */

.dialog-footer { text-align: center; padding-bottom: 10px; }

/* 输入框样式覆盖 (底部横线) */
:deep(.chinese-input .el-input__wrapper),
:deep(.chinese-select .el-input__wrapper) {
  box-shadow: none !important;
  border-bottom: 1px solid var(--chinese-ink) !important;
  border-radius: 0;
  background: transparent;
  padding-left: 0;
}
:deep(.el-input__inner), :deep(.el-textarea__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
  background: transparent !important;
}
:deep(.el-textarea__inner) {
  border: 1px solid var(--chinese-border) !important;
  border-radius: 0;
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
.seal-blue { color: #2980B9; border-color: #2980B9; }
.seal-red  { color: #7F8C8D; border-color: #7F8C8D; border-style: dashed; } /* 停用用灰色虚线 */

/* 操作链接 */
.action-btn { font-family: 'Noto Serif SC', serif; font-weight: 600; }
.action-btn.edit { color: var(--chinese-ink); }
.action-btn.delete { color: var(--chinese-red); }
.action-btn:hover { text-decoration: underline; text-underline-offset: 4px; }

/* 弹窗样式 */
.cloud-pattern {
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
}
.cloud-pattern.top { margin-bottom: 20px; transform: rotate(180deg); }
.cloud-pattern.bottom { margin-top: 20px; }

/* 弹窗单选框美化 */
:deep(.chinese-radio .el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--chinese-ink);
  background: var(--chinese-ink);
}
:deep(.chinese-radio .el-radio__label) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
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
</style>