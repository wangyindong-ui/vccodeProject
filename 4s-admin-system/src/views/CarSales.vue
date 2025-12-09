<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <el-card class="chinese-card">
      <!-- 顶部标题区 -->
      <div class="card-header">
        <div class="header-left">
          <!-- 模拟印章 -->
          <div class="stamp-box">
            <span class="stamp-text">库存</span>
          </div>
          <span class="title-text">车辆典藏 · 雅集</span>
        </div>
        <!-- 回纹装饰线 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <el-form :inline="true" :model="queryParams" class="chinese-form">
          <el-form-item label="品牌">
            <el-input 
              v-model="queryParams.brand" 
              placeholder="如：奥迪" 
              class="chinese-input"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="车型">
            <el-input 
              v-model="queryParams.model" 
              placeholder="如：A4L" 
              class="chinese-input"
            >
              <template #prefix><el-icon><Van /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <!-- 按钮组：固定颜色，无悬停变色 -->
            <el-button class="chinese-btn primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            
            <el-button class="chinese-btn plain" @click="handleReset">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
            
            <el-button class="chinese-btn gold" icon="Plus" @click="openDialog">
              <el-icon><EditPen /></el-icon> 新车入库
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        class="chinese-table"
        header-row-class-name="chinese-header"
      >
        <el-table-column prop="brand" label="品牌" min-width="125">
          <template #default="scope">
            <span class="ink-text font-song">{{ scope.row.brand }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="model" label="车型名称" min-width="150">
          <template #default="scope">
            <span class="ink-text">{{ scope.row.model }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="color" label="颜色" width="130">
           <template #default="scope">
             <div class="color-tag">
               <!-- 动态计算颜色背景 -->
               <span class="dot" :style="{background: getColorCode(scope.row.color)}"></span>
               <span class="ink-text">{{ scope.row.color }}</span>
             </div>
           </template>
        </el-table-column>

        <el-table-column prop="price" label="指导价(万)" width="125">
           <template #default="scope">
             <span class="num-font">¥ {{ scope.row.price }}</span>
           </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存" width="125">
          <template #default="scope">
            <span :class="['num-font', scope.row.stock < 3 ? 'text-red' : 'text-ink']">
              {{ scope.row.stock }} 辆
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="125">
          <template #default="scope">
            <!-- 倾斜印章样式 -->
            <div :class="['status-seal', getStatusClass(scope.row.status)]">
              {{ scope.row.status }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default>
            <el-button link class="action-btn confirm">详情</el-button>
            <el-button link class="action-btn finish">生成订单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="新车入库登记" 
      width="500px" 
      class="chinese-dialog"
    >
      <div class="cloud-pattern top"></div>
      
      <el-form :model="form" label-width="100px" class="chinese-form-layout">
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
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%" popper-class="chinese-popper">
            <el-option label="在售" value="在售" />
            <el-option label="缺货" value="缺货" />
            <el-option label="停售" value="停售" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <div class="cloud-pattern bottom"></div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn plain" @click="dialogVisible = false">取消</el-button>
          <el-button class="chinese-btn vermilion" @click="handleAdd">
            <el-icon style="margin-right: 4px"><Select /></el-icon> 确认入库
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
// 引入图标
import { Search, Plus, Van, EditPen, Select, Refresh } from '@element-plus/icons-vue'

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

const handleReset = () => {
  queryParams.value.brand = ''
  queryParams.value.model = ''
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

const getStatusClass = (status) => {
  if (status === '在售') return 'seal-blue'
  if (status === '缺货') return 'seal-red'
  return 'seal-gray'
}

// 核心修复：扩展颜色匹配逻辑
const getColorCode = (name) => {
  if(!name) return 'transparent'
  const n = name; 
  // 常见基础色
  if(n.includes('黑')) return '#2C3E50'  // 水墨黑
  if(n.includes('白')) return '#FFFFFF'  // 纯白
  if(n.includes('红')) return '#C0392B'  // 中国红
  if(n.includes('蓝')) return '#2980B9'  // 靛蓝
  if(n.includes('绿') || n.includes('青')) return '#27AE60' // 翡翠绿
  
  // 扩展车身颜色
  if(n.includes('黄') || n.includes('金') || n.includes('香槟')) return '#F1C40F' // 金色/香槟色
  if(n.includes('银')) return '#BDC3C7'  // 银色
  if(n.includes('灰') || n.includes('钛')) return '#7F8C8D'  // 灰色/钛灰
  if(n.includes('棕') || n.includes('褐') || n.includes('咖')) return '#6E2C00' // 棕色/咖啡色
  if(n.includes('紫')) return '#8E44AD'  // 紫色
  if(n.includes('橙') || n.includes('橘')) return '#E67E22'  // 橙色
  
  // 默认返回中性灰，避免误导
  return '#95A5A6'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 引入衬线字体 (系统回退) */
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
.text-red { color: var(--chinese-red); font-weight: bold; }
.text-ink { color: var(--chinese-ink); }

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

/* ================================================= */
/* 按钮样式：强制不透明，强制无悬停变色 */
/* ================================================= */

.chinese-btn {
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
  font-weight: 600;
  margin-left: 12px !important;
  opacity: 1 !important;
  transition: none;
}
.chinese-btn:first-child { margin-left: 0 !important; }

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

/* 3. 重置按钮 (空心黑字) */
.chinese-btn.plain, .chinese-btn.plain:hover, .chinese-btn.plain:focus {
  background-color: transparent !important;
  border: 1px solid #2C3E50 !important;
  color: #2C3E50 !important;
}

/* 4. 确认入库按钮 (朱砂红) */
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
:deep(.el-input__inner) {
  font-family: 'Noto Serif SC', serif;
  color: var(--chinese-ink);
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

.ink-text { color: var(--chinese-ink); font-size: 15px; }
.color-tag { display: flex; align-items: center; gap: 6px; }

/* 圆点样式，增加边框以适应白色圆点 */
.dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.2);
  display: inline-block;
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
.seal-gold { color: var(--chinese-gold); border-color: var(--chinese-gold); }
.seal-blue { color: #2980B9; border-color: #2980B9; }
.seal-red  { color: var(--chinese-red); border-color: var(--chinese-red); }
.seal-gray { color: #7F8C8D; border-color: #7F8C8D; border-style: dashed;}

/* 操作链接 */
.action-btn { font-family: 'Noto Serif SC', serif; font-weight: 600; }
.action-btn.confirm { color: var(--chinese-ink); }
.action-btn.finish { color: var(--chinese-red); }
.action-btn:hover { text-decoration: underline; text-underline-offset: 4px; }

/* 弹窗祥云纹饰 */
.cloud-pattern {
  height: 20px;
  background: url('data:image/svg+xml;utf8,<svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><path d="M20 20c-5 0-8-5-10-10S5 0 0 0h40c-5 0-8 5-10 10s-5 10-10 10z" fill="%23D4AC0D" fill-opacity="0.2"/></svg>') repeat-x;
}
.cloud-pattern.top { margin-bottom: 20px; transform: rotate(180deg); }
.cloud-pattern.bottom { margin-top: 20px; }

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