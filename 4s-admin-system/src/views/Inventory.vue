<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <!-- 顶部统计区域：改为中式匾额风格 -->
    <el-row :gutter="20" style="margin-bottom: 25px; position: relative; z-index: 1;">
      <el-col :span="8">
        <div class="stat-panel">
          <div class="stat-icon ink-icon"><el-icon><Box /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">库存总件数</div>
            <div class="stat-value num-font">1,520</div>
          </div>
          <div class="corner-pattern"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-panel">
          <div class="stat-icon gold-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">库存总金额(元)</div>
            <div class="stat-value num-font text-gold">560,000</div>
          </div>
          <div class="corner-pattern"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-panel">
          <div class="stat-icon red-icon"><el-icon><Warning /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">缺货预警项</div>
            <div class="stat-value num-font text-red">
              {{ tableData.filter(i => i.stock < 10).length }}
            </div>
          </div>
          <div class="corner-pattern"></div>
        </div>
      </el-col>
    </el-row>

    <el-card class="chinese-card">
      <!-- 顶部标题区 -->
      <div class="card-header">
        <div class="header-left">
          <!-- 模拟印章 -->
          <div class="stamp-box">
            <span class="stamp-text">配件</span>
          </div>
          <span class="title-text">库存典籍 · 雅集</span>
        </div>
        <!-- 回纹装饰线 -->
        <div class="header-right decoration-line"></div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="search-group">
          <el-input 
            v-model="searchKey" 
            placeholder="输入配件名称或编号" 
            class="chinese-input"
            style="width: 260px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <!-- 按钮组：固定颜色，无悬停变色 -->
          <el-button class="chinese-btn primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 检索
          </el-button>
          
          <el-button class="chinese-btn plain" @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </div>

        <div class="btn-group">
          <el-button class="chinese-btn gold" icon="Plus" @click="openDialog">
            <el-icon><EditPen /></el-icon> 配件入库
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        class="chinese-table"
        header-row-class-name="chinese-header"
      >
        <el-table-column prop="code" label="编号" width="140">
          <template #default="scope">
            <span class="num-font" style="font-weight: bold;">{{ scope.row.code }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="配件名称" min-width="150">
          <template #default="scope">
            <span class="ink-text font-song">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <span class="category-text">{{ scope.row.category }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="location" label="库位" width="120">
           <template #default="scope">
             <span class="num-font">{{ scope.row.location }}</span>
           </template>
        </el-table-column>

        <el-table-column prop="price" label="单价(元)" width="130" sortable>
           <template #default="scope">
             <span class="num-font">¥ {{ scope.row.price }}</span>
           </template>
        </el-table-column>

        <el-table-column prop="stock" label="当前库存" width="160" sortable>
          <template #default="scope">
            <div class="stock-info">
              <span :class="['num-font', scope.row.stock < 10 ? 'text-red' : 'text-ink']" style="font-size: 16px;">
                {{ scope.row.stock }}
              </span>
              <span class="unit-text">{{ scope.row.unit }}</span>
              <!-- 如果缺货，显示一个小印章 -->
              <span v-if="scope.row.stock < 10" class="warning-seal">缺</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button link class="action-btn confirm">出库</el-button>
            <el-button link class="action-btn finish">补货</el-button>
            <el-button link class="action-btn edit">修缮</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Search, Plus, Box, Money, Warning, EditPen, Refresh } from '@element-plus/icons-vue'

const searchKey = ref('')
const tableData = ref([])

// 模拟数据
const mockData = [
  { code: 'P-2023001', name: '机油滤清器', category: '保养件', location: 'A-01-02', price: 35.00, stock: 150, unit: '个' },
  { code: 'P-2023002', name: '刹车片(前)', category: '易损件', location: 'B-02-11', price: 280.00, stock: 8, unit: '套' },
  { code: 'P-2023005', name: '火花塞', category: '点火系', location: 'A-03-05', price: 45.00, stock: 4, unit: '支' },
  { code: 'P-2023008', name: '全合成机油', category: '油液', location: 'C-01-01', price: 420.00, stock: 45, unit: '桶' },
]

const loadData = async () => {
  try {
    const res = await request.get('/inventory')
    tableData.value = res.data
  } catch (e) {
    // 接口未通时使用模拟数据
    tableData.value = mockData
  }
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchKey.value = ''
  loadData()
}

const openDialog = () => {
  // 这里可以复用之前的弹窗逻辑，暂时省略
  console.log("打开入库弹窗")
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
.text-gold { color: var(--chinese-gold); font-weight: bold; }
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

/* 统计面板样式 (仿古匾额) */
.stat-panel {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--chinese-border);
  padding: 20px;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.05);
  transition: all 0.3s;
}
.stat-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(44, 62, 80, 0.1);
  border-color: var(--chinese-gold);
}

.stat-icon {
  width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  font-size: 24px;
  margin-right: 15px;
}
.ink-icon { background-color: rgba(44, 62, 80, 0.1); color: var(--chinese-ink); }
.gold-icon { background-color: rgba(212, 172, 13, 0.1); color: var(--chinese-gold); }
.red-icon { background-color: rgba(192, 57, 43, 0.1); color: var(--chinese-red); }

.stat-content { flex: 1; }
.stat-label { font-size: 14px; color: #7f8c8d; margin-bottom: 5px; font-family: 'Noto Serif SC', serif; }
.stat-value { font-size: 28px; font-weight: bold; color: var(--chinese-ink); }

.corner-pattern {
  position: absolute;
  top: 0; right: 0;
  width: 20px; height: 20px;
  border-top: 2px solid var(--chinese-gold);
  border-right: 2px solid var(--chinese-gold);
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

/* 操作栏布局 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-group { display: flex; align-items: center; }

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

/* ================================================= */

/* 输入框样式覆盖 (底部横线) */
:deep(.chinese-input .el-input__wrapper) {
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

/* 表格内容细节 */
.category-text {
  background-color: rgba(44, 62, 80, 0.05);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 13px;
  color: var(--chinese-ink);
}

.stock-info { display: flex; align-items: center; gap: 5px; }
.unit-text { font-size: 13px; color: #7f8c8d; }

.warning-seal {
  display: inline-block;
  font-size: 12px;
  color: var(--chinese-red);
  border: 1px solid var(--chinese-red);
  padding: 0 4px;
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
  margin-left: 5px;
}

/* 操作链接 */
.action-btn { font-family: 'Noto Serif SC', serif; font-weight: 600; }
.action-btn.confirm { color: var(--chinese-ink); }
.action-btn.finish { color: var(--chinese-gold); }
.action-btn.edit { color: #7F8C8D; }
.action-btn:hover { text-decoration: underline; text-underline-offset: 4px; }

</style>