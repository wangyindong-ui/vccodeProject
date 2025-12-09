<template>
  <div class="chinese-style-container">
    <!-- 背景装饰：水墨山水纹理 -->
    <div class="ink-bg"></div>

    <!-- 1. 顶部统计卡片 (仿古匾额风格) -->
    <el-row :gutter="24" style="margin-bottom: 25px; position: relative; z-index: 1;">
      <el-col :span="6">
        <div class="stat-panel">
          <div class="stat-icon gold-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">今日销售额</div>
            <div class="stat-value num-font text-ink">¥ {{ stats.sales.toLocaleString() }}</div>
            <div class="stat-trend">
              较昨日 <span class="trend-up"><el-icon><Top /></el-icon> 12%</span>
            </div>
          </div>
          <!-- 四角装饰 -->
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-panel">
          <div class="stat-icon ink-icon"><el-icon><Tools /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">待维修车辆</div>
            <div class="stat-value num-font text-ink">{{ stats.serviceWait }} 辆</div>
            <div class="stat-trend">工位饱和度 85%</div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-panel">
          <div class="stat-icon blue-icon"><el-icon><User /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">本月客流量</div>
            <div class="stat-value num-font text-ink">{{ stats.visitors }} 人</div>
            <div class="stat-trend">
              较上月 <span class="trend-up"><el-icon><Top /></el-icon> 5%</span>
            </div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-panel warning-panel">
          <div class="stat-icon red-icon"><el-icon><Bell /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">库存预警</div>
            <div class="stat-value num-font text-red">{{ stats.stockWarning }} 项</div>
            <div class="stat-trend text-red">需紧急补货</div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 2. 左侧：销售趋势图表 -->
      <el-col :span="16">
        <el-card class="chinese-card chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <div class="stamp-box small">
                  <span class="stamp-text">趋势</span>
                </div>
                <span class="title-text">销售走势 · 览胜</span>
              </div>
              
              <!-- 切换按钮 -->
              <el-radio-group v-model="timeRange" size="small" @change="handleTimeChange" class="chinese-radio-group">
                <el-radio-button label="近7天" />
                <el-radio-button label="近30天" />
              </el-radio-group>
            </div>
          </template>

          <!-- ECharts 挂载点 -->
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 3. 右侧：快捷操作 -->
      <el-col :span="8">
        <el-card class="chinese-card chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <div class="stamp-box small">
                  <span class="stamp-text">捷径</span>
                </div>
                <span class="title-text">常用操作</span>
              </div>
              <div class="decoration-line"></div>
            </div>
          </template>
          
          <div class="quick-actions">
            <div class="action-tile" @click="$router.push('/cars')">
              <div class="tile-icon icon-blue"><el-icon><Van /></el-icon></div>
              <span class="tile-text">入库新车</span>
              <div class="tile-bg"></div>
            </div>
            <div class="action-tile" @click="$router.push('/service')">
              <div class="tile-icon icon-gold"><el-icon><SetUp /></el-icon></div>
              <span class="tile-text">维修登记</span>
              <div class="tile-bg"></div>
            </div>
            <div class="action-tile" @click="$router.push('/test-drive')">
              <div class="tile-icon icon-ink"><el-icon><Timer /></el-icon></div>
              <span class="tile-text">试驾预约</span>
              <div class="tile-bg"></div>
            </div>
            <div class="action-tile" @click="$router.push('/inventory')">
              <div class="tile-icon icon-red"><el-icon><Files /></el-icon></div>
              <span class="tile-text">库存盘点</span>
              <div class="tile-bg"></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import request from '../utils/request'
import * as echarts from 'echarts'
// 引入图标
import { Money, Tools, User, Bell, TrendCharts, Van, SetUp, Timer, Files, Top } from '@element-plus/icons-vue'

// --- 统计数据 ---
const stats = ref({
  sales: 0,
  serviceWait: 0,
  visitors: 0,
  stockWarning: 0
})

const fetchStats = async () => {
  try {
    const res = await request.get('/dashboard/stats')
    // 假设返回结构 {code:200, data: {...}}
    if(res && res.data) stats.value = res.data
  } catch (error) {
    // 模拟数据用于展示效果
    stats.value = { sales: 128500, serviceWait: 8, visitors: 45, stockWarning: 3 }
  }
}

// --- 图表逻辑 ---
const timeRange = ref('近7天')
const chartRef = ref(null)
let myChart = null

const initChart = async (days = 7) => {
  let chartData = { dates: [], values: [] }
  
  try {
    const res = await request.get('/dashboard/trend', { params: { days } })
    if (res && res.data && res.data.dates) {
      chartData = res.data
    } else {
      // 模拟数据
      chartData = {
        dates: ['初一', '初二', '初三', '初四', '初五', '初六', '初七'],
        values: [8200, 9320, 9010, 9340, 12900, 13300, 13200]
      }
    }
  } catch(e) {
     chartData = {
        dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        values: [12000, 15000, 14000, 18000, 22000, 25000, 30000]
     }
  }

  if (chartRef.value) {
    if (!myChart) {
      myChart = echarts.init(chartRef.value)
    }

    const option = {
      backgroundColor: 'transparent', // 透明背景以显示宣纸
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#D4AC0D',
        textStyle: { color: '#2C3E50', fontFamily: 'Noto Serif SC' },
        formatter: '{b} <br/> 销售额: <span style="color:#C0392B;font-weight:bold">¥ {c}</span>'
      },
      grid: {
        left: '2%', right: '4%', bottom: '0%', top: '15%', containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.dates,
        axisLine: { lineStyle: { color: '#2C3E50' } }, // 轴线颜色
        axisTick: { show: false },
        axisLabel: { color: '#2C3E50', fontFamily: 'Noto Serif SC', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#E5E0D5', type: 'dashed' } }, // 虚线网格
        axisLabel: { color: '#7F8C8D', fontFamily: 'Times New Roman' }
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          // 线条颜色：朱砂红
          itemStyle: { color: '#C0392B', borderColor: '#fff', borderWidth: 2 },
          lineStyle: { width: 3, color: '#C0392B', shadowColor: 'rgba(192, 57, 43, 0.3)', shadowBlur: 5 },
          areaStyle: {
            // 渐变填充：红色淡出
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(192, 57, 43, 0.2)' },
              { offset: 1, color: 'rgba(192, 57, 43, 0.01)' }
            ])
          }
        }
      ]
    }
    myChart.setOption(option)
  }
}

const handleTimeChange = () => {
  const days = timeRange.value === '近30天' ? 30 : 7
  initChart(days)
}

const handleResize = () => {
  myChart && myChart.resize()
}

onMounted(() => {
  fetchStats()
  nextTick(() => {
    initChart(7)
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) myChart.dispose()
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

.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: bold; }
.num-font { font-family: 'Times New Roman', serif; letter-spacing: 0.5px; }
.text-ink { color: var(--chinese-ink); }
.text-gold { color: var(--chinese-gold); }
.text-red { color: var(--chinese-red); }

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

/* --- 顶部统计卡片 (匾额风格) --- */
.stat-panel {
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--chinese-border);
  padding: 20px;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.05);
  transition: all 0.3s;
  height: 100px;
  border-radius: 2px;
}
.stat-panel:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(44, 62, 80, 0.1);
  border-color: var(--chinese-gold);
}

/* 图标样式 */
.stat-icon {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  font-size: 28px;
  margin-right: 15px;
  /* 传统的底纹圆角方块 */
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.05);
}
.gold-icon { color: var(--chinese-gold); border-color: var(--chinese-gold); background-color: rgba(212, 172, 13, 0.05); }
.ink-icon { color: var(--chinese-ink); border-color: var(--chinese-ink); background-color: rgba(44, 62, 80, 0.05); }
.blue-icon { color: #2980B9; border-color: #2980B9; background-color: rgba(41, 128, 185, 0.05); }
.red-icon { color: var(--chinese-red); border-color: var(--chinese-red); background-color: rgba(192, 57, 43, 0.05); }

.stat-info { flex: 1; }
.stat-label { font-size: 14px; color: #7f8c8d; font-family: 'Noto Serif SC', serif; letter-spacing: 1px; }
.stat-value { font-size: 28px; font-weight: bold; margin: 4px 0; }
.stat-trend { font-size: 12px; color: #95a5a6; display: flex; align-items: center; gap: 4px; }
.trend-up { color: var(--chinese-red); display: flex; align-items: center; font-weight: bold; }

/* 边角装饰 (回纹) */
.corner {
  position: absolute; width: 15px; height: 15px;
  border-color: var(--chinese-border);
  transition: all 0.3s;
}
.stat-panel:hover .corner { border-color: var(--chinese-gold); }
.top-left { top: 4px; left: 4px; border-top: 2px solid; border-left: 2px solid; }
.bottom-right { bottom: 4px; right: 4px; border-bottom: 2px solid; border-right: 2px solid; }

/* --- 卡片通用 --- */
.chinese-card {
  position: relative;
  z-index: 1;
  border: 1px solid var(--chinese-border);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.08);
  border-radius: 4px;
}
.chart-card { min-height: 450px; display: flex; flex-direction: column; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--chinese-gold);
  margin-bottom: 10px;
}

.header-left { display: flex; align-items: center; gap: 12px; }

/* 小印章 */
.stamp-box.small {
  width: 36px; height: 36px;
  border: 2px solid var(--chinese-red);
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  background-color: rgba(192, 57, 43, 0.05);
}
.stamp-text {
  color: var(--chinese-red);
  font-family: 'LiSu', 'SimSun', serif;
  font-size: 16px;
  font-weight: bold;
}

.title-text {
  font-size: 18px;
  color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  letter-spacing: 1px;
}

.decoration-line {
  height: 20px; flex-grow: 1; margin-left: 30px;
  background-image: linear-gradient(90deg, transparent 50%, var(--chinese-border) 50%);
  background-size: 8px 100%; opacity: 0.5;
}

/* 图表容器 */
.chart-container { width: 100%; height: 350px; }

/* 覆盖 Element Radio Button */
:deep(.chinese-radio-group .el-radio-button__inner) {
  background: transparent;
  border: 1px solid var(--chinese-border);
  color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif;
  box-shadow: none !important;
  border-radius: 0 !important;
}
:deep(.chinese-radio-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--chinese-ink);
  border-color: var(--chinese-ink);
  color: #fff;
  box-shadow: none;
}

/* --- 快捷操作 (窗棂风格) --- */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 10px;
}

.action-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px;
  border: 1px solid var(--chinese-border);
  background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

/* 窗格背景纹理 */
.tile-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(45deg, var(--chinese-border) 25%, transparent 25%, transparent 75%, var(--chinese-border) 75%, var(--chinese-border)),
    linear-gradient(45deg, var(--chinese-border) 25%, transparent 25%, transparent 75%, var(--chinese-border) 75%, var(--chinese-border));
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.3s;
  z-index: 0;
}

.action-tile:hover {
  border-color: var(--chinese-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 172, 13, 0.2);
}
.action-tile:hover .tile-bg { opacity: 0.05; }

.tile-icon {
  font-size: 28px;
  margin-bottom: 12px;
  z-index: 1;
  width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; /* 圆形图标底 */
  border: 1px solid;
}
.icon-blue { color: #2980B9; border-color: #2980B9; background: rgba(41, 128, 185, 0.05); }
.icon-gold { color: var(--chinese-gold); border-color: var(--chinese-gold); background: rgba(212, 172, 13, 0.05); }
.icon-ink { color: var(--chinese-ink); border-color: var(--chinese-ink); background: rgba(44, 62, 80, 0.05); }
.icon-red { color: var(--chinese-red); border-color: var(--chinese-red); background: rgba(192, 57, 43, 0.05); }

.tile-text {
  z-index: 1;
  font-family: 'Noto Serif SC', serif;
  font-weight: bold;
  color: var(--chinese-ink);
  font-size: 16px;
}
</style>