<template>
  <div class="chinese-style-container">
    <!-- 背景装饰 -->
    <div class="ink-bg"></div>

    <!-- 1. 顶部统计卡片 -->
    <el-row :gutter="24" style="margin-bottom: 20px; position: relative; z-index: 1;">
      <!-- 今日销售额 -->
      <el-col :span="6">
        <div class="stat-panel">
          <div class="stat-icon gold-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">今日销售额</div>
            <div class="stat-value num-font text-ink">¥ {{ (stats.sales || 0).toLocaleString() }}</div>
            <div class="stat-trend">
              较昨日 
              <span :class="parseFloat(stats.salesGrowth) >= 0 ? 'trend-up' : 'trend-down'">
                <el-icon>
                  <Top v-if="parseFloat(stats.salesGrowth) >= 0" />
                  <Bottom v-else />
                </el-icon> 
                {{ Math.abs(parseFloat(stats.salesGrowth || 0)) }}%
              </span>
            </div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>

      <!-- 待维修车辆 -->
      <el-col :span="6">
        <div class="stat-panel">
          <div class="stat-icon ink-icon"><el-icon><Tools /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">待维修车辆</div>
            <div class="stat-value num-font text-ink">{{ stats.serviceWait || 0 }} 辆</div>
            <div class="stat-trend">工位饱和度 {{ stats.workload || '0%' }}</div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>

      <!-- 本月客流量 -->
      <el-col :span="6">
        <div class="stat-panel">
          <div class="stat-icon blue-icon"><el-icon><User /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">本月客流量</div>
            <div class="stat-value num-font text-ink">{{ stats.visitors || 0 }} 人</div>
            <div class="stat-trend">
              较上月 
              <span :class="parseFloat(stats.visitorGrowth) >= 0 ? 'trend-up' : 'trend-down'">
                <el-icon>
                  <Top v-if="parseFloat(stats.visitorGrowth) >= 0" />
                  <Bottom v-else />
                </el-icon> 
                {{ Math.abs(parseFloat(stats.visitorGrowth || 0)) }}%
              </span>
            </div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>

      <!-- 库存预警 -->
      <el-col :span="6">
        <div class="stat-panel warning-panel">
          <div class="stat-icon red-icon"><el-icon><Bell /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">库存预警</div>
            <div class="stat-value num-font text-red">{{ stats.stockWarning || 0 }} 项</div>
            <div class="stat-trend text-red">需紧急补货</div>
          </div>
          <div class="corner top-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 2. 中间行：销售趋势 + 快捷操作 -->
    <el-row :gutter="24" style="margin-bottom: 20px;">
      <!-- 左侧：销售趋势图表 -->
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
              <el-radio-group v-model="timeRange" size="small" @change="handleTimeChange" class="chinese-radio-group">
                <el-radio-button label="近7天" />
                <el-radio-button label="近30天" />
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧：快捷操作 -->
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

    <!-- 3. 底部详细数据区 -->
    <el-row :gutter="24" style="height: 300px;">
      
      <!-- 左下：最新成交订单列表 -->
      <el-col :span="16">
        <el-card class="chinese-card table-card" :body-style="{ padding: '0 20px 10px 20px', height: '100%', boxSizing: 'border-box' }">
          <template #header>
            <div class="card-header compact-header" style="margin-bottom: 5px; border-bottom: none;">
              <div class="header-left">
                <div class="stamp-box small"><span class="stamp-text">流水</span></div>
                <span class="title-text">最新成交记录</span>
              </div>
              <!-- 修改点：添加跳转事件 -->
              <el-button link class="more-btn" @click="router.push('/orders')">
                查看更多 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="decoration-line" style="margin: 0 0 10px 0; opacity: 0.3;"></div>
          </template>
          
          <div class="custom-table">
            <div class="table-header-row">
              <div class="col-time">成交时间</div>
              <div class="col-customer">客户</div>
              <div class="col-car">车型</div>
              <div class="col-salesman">销售顾问</div>
              <div class="col-amount">成交价</div>
              <div class="col-status">状态</div>
            </div>

            <div class="order-scroll-container" @mouseenter="pauseOrderScroll" @mouseleave="startOrderScroll">
              <TransitionGroup name="list" tag="div" class="table-body">
                <div v-for="item in latestOrders" :key="item.id" class="table-row-item">
                  <div class="col-time num-font">{{ formatTime(item.createTime) }}</div>
                  <div class="col-customer font-song">{{ item.customerName }}</div>
                  <div class="col-car" :title="item.carModel">{{ item.carModel || '配件/服务' }}</div>
                  <div class="col-salesman">{{ item.salesmanName }}</div>
                  <div class="col-amount num-font text-red" style="font-weight: bold;">¥ {{ (item.totalAmount || 0).toLocaleString() }}</div>
                  <div class="col-status">
                    <el-tag size="small" :type="getStatusType(item.status)" effect="plain" style="border-color: var(--chinese-gold); color: var(--chinese-ink)">
                      {{ getStatusText(item.status) }}
                    </el-tag>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右下：门店公告 -->
      <el-col :span="8">
        <el-card class="chinese-card list-card" :body-style="{ padding: '0 20px', height: '100%', boxSizing: 'border-box' }">
          <template #header>
            <div class="card-header compact-header" style="margin-bottom: 5px; border-bottom: none;">
              <div class="header-left">
                <div class="stamp-box small"><span class="stamp-text">简讯</span></div>
                <span class="title-text">门店公告</span>
              </div>
            </div>
            <div class="decoration-line" style="margin: 0 0 15px 0; opacity: 0.3;"></div>
          </template>
          
          <div class="notice-scroll-container" @mouseenter="pauseNoticeScroll" @mouseleave="startNoticeScroll">
            <TransitionGroup name="list" tag="div" class="notice-list">
              <div v-for="(item) in notices" :key="item.id" class="notice-item">
                <div class="notice-left">
                  <span class="notice-tag" :class="item.tagType">{{ item.tagName }}</span>
                  <span class="notice-content text-ink" :title="item.content">{{ item.content }}</span>
                </div>
                <span class="notice-time num-font">{{ formatNoticeTime(item.publishTime) }}</span>
              </div>
            </TransitionGroup>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router' // 1. 引入 useRouter
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import * as echarts from 'echarts'
import { Money, Tools, User, Bell, Van, SetUp, Timer, Files, Top, Bottom, ArrowRight } from '@element-plus/icons-vue'

// 2. 初始化 Router
const router = useRouter()

// --- 统计数据 ---
const stats = ref({})

// --- 底部数据 ---
const latestOrders = ref([])
const notices = ref([])

let noticeScrollTimer = null
let orderScrollTimer = null

// --- 工具函数 ---
const formatTime = (timeArr) => {
  if (!Array.isArray(timeArr) || timeArr.length < 5) return '--'
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(timeArr[1])}-${pad(timeArr[2])} ${pad(timeArr[3])}:${pad(timeArr[4])}`
}

const formatNoticeTime = (timeStrOrArr) => {
    if (Array.isArray(timeStrOrArr)) {
        return `${String(timeStrOrArr[1]).padStart(2,'0')}-${String(timeStrOrArr[2]).padStart(2,'0')}`
    }
    if (!timeStrOrArr) return ''
    return new Date(timeStrOrArr).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
}

const getStatusType = (status) => {
    const map = { 'paid': 'success', 'pending': 'warning', 'servicing': 'primary', 'done': 'success', 'refunded': 'danger' }
    return map[status] || 'info'
}
const getStatusText = (status) => {
    const map = { 'paid': '已付款', 'pending': '待处理', 'servicing': '服务中', 'done': '已完成', 'refunded': '已退款' }
    return map[status] || status
}

// 1. 获取统计数据
const fetchStats = async () => {
  try {
    const res = await request.get('/dashboard/stats')
    const data = (res.data || res) || {}
    stats.value = { ...stats.value, ...data }
  } catch (error) { console.error(error) }
}

// 2. 获取订单并开启滚动
const fetchLatestOrders = async () => {
  try {
    const res = await request.get('/dashboard/latestOrders')
    const list = (res.data || res) || []
    if (Array.isArray(list)) {
        latestOrders.value = list
        if (latestOrders.value.length > 4) startOrderScroll()
    }
  } catch (error) { console.error(error) }
}

// 3. 获取公告并开启滚动
const fetchNotices = async () => {
  try {
    const res = await request.get('/dashboard/notices')
    const list = (res.data || res) || []
    if (Array.isArray(list)) {
        notices.value = list
        if (list.length > 5) startNoticeScroll()
    }
  } catch (error) { console.error(error) }
}

// --- 滚动逻辑 ---
const startNoticeScroll = () => {
    if (noticeScrollTimer) clearInterval(noticeScrollTimer)
    noticeScrollTimer = setInterval(() => {
        if (notices.value.length > 1) {
            const first = notices.value.shift()
            notices.value.push(first)
        }
    }, 3000)
}
const pauseNoticeScroll = () => clearInterval(noticeScrollTimer)

const startOrderScroll = () => {
    if (orderScrollTimer) clearInterval(orderScrollTimer)
    orderScrollTimer = setInterval(() => {
        if (latestOrders.value.length > 1) {
            const first = latestOrders.value.shift()
            latestOrders.value.push(first)
        }
    }, 3500)
}
const pauseOrderScroll = () => clearInterval(orderScrollTimer)

// --- 图表逻辑 ---
const timeRange = ref('近7天')
const chartRef = ref(null)
let myChart = null

const initChart = async (days = 7) => {
  if (!chartRef.value) return
  if (!myChart) myChart = echarts.init(chartRef.value)

  myChart.showLoading({ text: '加载中...', color: '#C0392B', textColor: '#2C3E50', maskColor: 'rgba(255,255,255,0.8)', zlevel: 0 })

  try {
    const typeParam = days === 7 ? 1 : 2 
    const res = await request.get('/dashboard/trend', { params: { type: typeParam } })
    const payload = (res.data || res) || {}
    let dateData = [], valueData = []
    if (payload.dates && payload.values) {
        dateData = payload.dates
        valueData = payload.values.map(item => Number(item))
    }
    myChart.hideLoading()

    const option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#D4AC0D', textStyle: { color: '#2C3E50' } },
      grid: { left: '2%', right: '4%', bottom: '0%', top: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dateData, axisLine: { lineStyle: { color: '#2C3E50' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#E5E0D5', type: 'dashed' } } },
      series: [{
        name: '销售额', type: 'line', smooth: true, showSymbol: true, symbol: 'circle', symbolSize: 8,
        data: valueData,
        itemStyle: { color: '#C0392B', borderColor: '#fff', borderWidth: 2 },
        lineStyle: { width: 3, color: '#C0392B', shadowColor: 'rgba(192, 57, 43, 0.3)', shadowBlur: 5 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(192, 57, 43, 0.2)' }, { offset: 1, color: 'rgba(192, 57, 43, 0.01)' }]) }
      }]
    }
    // 使用更高级的动画选项：notMerge=false 平滑过渡，lazyUpdate=false 即时更新
    myChart.setOption(option, { replaceMerge: ['series'], lazyUpdate: false })
    
    // 添加图表进场动画
    myChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: 0
    })
  } catch(e) { if(myChart) myChart.hideLoading() }
}

const handleTimeChange = () => {
  // 添加图表淡出效果
  if (myChart) {
    myChart.setOption({
      series: [{
        data: []
      }]
    })
  }
  // 300ms 后开始加载新数据
  setTimeout(() => {
    initChart(timeRange.value === '近30天' ? 30 : 7)
  }, 300)
}
const handleResize = () => myChart && myChart.resize()

onMounted(() => {
  fetchStats()
  fetchLatestOrders()
  fetchNotices()
  nextTick(() => {
    setTimeout(() => initChart(7), 200)
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) myChart.dispose()
  pauseNoticeScroll()
  pauseOrderScroll()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.chinese-style-container {
  --chinese-red: #C0392B; --chinese-gold: #D4AC0D; --chinese-ink: #2C3E50; --chinese-border: #E5E0D5;
  min-height: 100vh; padding: 20px; position: relative; background-color: #F5F2EA;
  animation: dashboardBgGradient 15s ease infinite;
  background-size: 400% 400%;
}

@keyframes dashboardBgGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.font-song { font-family: 'Noto Serif SC', 'SimSun', serif; font-weight: bold; }
.num-font { font-family: 'Times New Roman', serif; letter-spacing: 0.5px; }
.text-ink { color: var(--chinese-ink); }
.text-gold { color: var(--chinese-gold); }
.text-red { color: var(--chinese-red); }

.ink-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-image: linear-gradient(rgba(245, 242, 234, 0.9), rgba(245, 242, 234, 0.9)), url('https://www.transparenttextures.com/patterns/rice-paper-2.png'); 
  z-index: 0; pointer-events: none;
}

/* 顶部统计面板 */
.stat-panel {
  background-color: rgba(255, 255, 255, 0.85); border: 1px solid var(--chinese-border); padding: 20px;
  display: flex; align-items: center; position: relative; box-shadow: 0 4px 12px rgba(44, 62, 80, 0.05);
  transition: all 0.3s; height: 100px; border-radius: 2px;
  animation: statPanelEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes statPanelEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

:nth-child(1) { animation-delay: 0s; }
:nth-child(2) { animation-delay: 0.1s; }
:nth-child(3) { animation-delay: 0.2s; }
:nth-child(4) { animation-delay: 0.3s; }

.stat-panel:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(44, 62, 80, 0.1);
  border-color: var(--chinese-gold);
}
.stat-icon {
  width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;
  border-radius: 4px; font-size: 28px; margin-right: 15px; background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.05);
}
.gold-icon { color: var(--chinese-gold); border-color: var(--chinese-gold); background-color: rgba(212, 172, 13, 0.05); }
.ink-icon { color: var(--chinese-ink); border-color: var(--chinese-ink); background-color: rgba(44, 62, 80, 0.05); }
.blue-icon { color: #2980B9; border-color: #2980B9; background-color: rgba(41, 128, 185, 0.05); }
.red-icon { color: var(--chinese-red); border-color: var(--chinese-red); background-color: rgba(192, 57, 43, 0.05); }
.stat-info { flex: 1; }
.stat-label { font-size: 14px; color: #7f8c8d; font-family: 'Noto Serif SC', serif; letter-spacing: 1px; }
.stat-value { font-size: 28px; font-weight: bold; margin: 4px 0; animation: countUp 1s ease-out 0.3s both; }

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.stat-trend { font-size: 12px; color: #95a5a6; display: flex; align-items: center; gap: 4px; }
.trend-up { color: var(--chinese-red); display: flex; align-items: center; font-weight: bold; gap: 2px; }
.trend-down { color: #2E8B57; display: flex; align-items: center; font-weight: bold; gap: 2px; }
.corner { position: absolute; width: 15px; height: 15px; border-color: var(--chinese-border); transition: all 0.3s; animation: cornerAppear 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); animation-delay: 0.5s; animation-fill-mode: both; }

@keyframes cornerAppear {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.stat-panel:hover .corner { border-color: var(--chinese-gold); }
.top-left { top: 4px; left: 4px; border-top: 2px solid; border-left: 2px solid; }
.bottom-right { bottom: 4px; right: 4px; border-bottom: 2px solid; border-right: 2px solid; }

/* 基础卡片样式 */
.chinese-card {
  position: relative; z-index: 1; border: 1px solid var(--chinese-border);
  background: rgba(255, 255, 255, 0.9); box-shadow: 0 4px 20px rgba(44, 62, 80, 0.08);
  border-radius: 4px; display: flex; flex-direction: column;
  animation: cardEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.chart-card { min-height: 450px; display: flex; flex-direction: column; }
.table-card, .list-card { height: 300px; display: flex; flex-direction: column; }
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 15px; border-bottom: 2px solid var(--chinese-gold); margin-bottom: 10px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.stamp-box.small {
  width: 36px; height: 36px; border: 2px solid var(--chinese-red);
  display: flex; align-items: center; justify-content: center; border-radius: 4px; background-color: rgba(192, 57, 43, 0.05);
}
.stamp-text { color: var(--chinese-red); font-family: 'LiSu', 'SimSun', serif; font-size: 16px; font-weight: bold; }
.title-text { font-size: 18px; color: var(--chinese-ink); font-family: 'Noto Serif SC', serif; font-weight: 700; letter-spacing: 1px; animation: titleSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.decoration-line { height: 20px; flex-grow: 1; margin-left: 30px; background-image: linear-gradient(90deg, transparent 50%, var(--chinese-border) 50%); background-size: 8px 100%; opacity: 0.5; animation: lineGlow 3s infinite; }

@keyframes lineGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
.chart-container { width: 100%; height: 350px; }

/* Radio Button */
:deep(.chinese-radio-group .el-radio-button__inner) {
  background: transparent; border: 1px solid var(--chinese-border); color: var(--chinese-ink);
  font-family: 'Noto Serif SC', serif; box-shadow: none !important; border-radius: 0 !important;
}
:deep(.chinese-radio-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--chinese-ink); border-color: var(--chinese-ink); color: #fff; box-shadow: none;
}

/* 快捷操作区 (修改：图标统一为红色) */
.quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 10px; }
.action-tile {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 25px; border: 1px solid var(--chinese-border); background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer; transition: all 0.3s; overflow: hidden;
  animation: actionTileEnter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes actionTileEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.action-tile:nth-child(1) { animation-delay: 0.1s; }
.action-tile:nth-child(2) { animation-delay: 0.2s; }
.action-tile:nth-child(3) { animation-delay: 0.3s; }
.action-tile:nth-child(4) { animation-delay: 0.4s; }

.tile-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(45deg, var(--chinese-border) 25%, transparent 25%, transparent 75%, var(--chinese-border) 75%, var(--chinese-border)),
    linear-gradient(45deg, var(--chinese-border) 25%, transparent 25%, transparent 75%, var(--chinese-border) 75%, var(--chinese-border));
  background-size: 20px 20px; background-position: 0 0, 10px 10px; opacity: 0; transition: opacity 0.3s; z-index: 0;
}
.action-tile:hover { border-color: var(--chinese-gold); transform: translateY(-2px) scale(1.02); box-shadow: 0 4px 12px rgba(212, 172, 13, 0.2); }
.action-tile:hover .tile-bg { opacity: 0.05; }
.tile-icon {
  font-size: 28px; margin-bottom: 12px; z-index: 1; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid;
  transition: all 0.3s;
  animation: iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes iconBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-45deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.action-tile:hover .tile-icon {
  transform: scale(1.2) rotate(10deg);
}

/* 统一红色风格图标 */
.icon-blue, .icon-gold, .icon-ink, .icon-red {
  color: var(--chinese-red); border-color: var(--chinese-red); background: rgba(192, 57, 43, 0.05);
}
.tile-text { z-index: 1; font-family: 'Noto Serif SC', serif; font-weight: bold; color: var(--chinese-ink); font-size: 16px; }

/* 列表通用 */
.more-btn { font-size: 12px; color: #999; }
.more-btn:hover { color: var(--chinese-gold); }

/* 自定义表格样式 (Flex) */
.custom-table { width: 100%; height: 220px; display: flex; flex-direction: column; font-size: 14px; color: var(--chinese-ink); animation: tableEnter 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

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

.table-header-row {
  display: flex; align-items: center; padding: 10px 0; background: rgba(212, 172, 13, 0.05);
  font-family: 'Noto Serif SC', serif; font-weight: bold; border-bottom: 1px solid rgba(229, 224, 213, 0.8); margin-bottom: 5px;
  animation: headerEnter 0.5s ease-out;
}

@keyframes headerEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row-item {
  display: flex; align-items: center; padding: 12px 0; border-bottom: 1px dashed rgba(44, 62, 80, 0.1); transition: all 0.3s;
  animation: rowEnter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

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

.table-row-item:nth-child(1) { animation-delay: 0.1s; }
.table-row-item:nth-child(2) { animation-delay: 0.2s; }
.table-row-item:nth-child(3) { animation-delay: 0.3s; }
.table-row-item:nth-child(n+4) { animation-delay: 0.4s; }

.table-row-item:hover { background-color: rgba(255, 255, 255, 0.8); transform: translateX(5px) scale(1.02); box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08); }

/* 列宽定义 */
.col-time { width: 140px; padding-left: 10px; color: #666; }
.col-customer { width: 80px; }
.col-car { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px; }
.col-salesman { width: 80px; text-align: center; }
.col-amount { width: 120px; text-align: right; padding-right: 15px; }
.col-status { width: 80px; text-align: center; padding-right: 10px; }

/* 滚动区域 */
.order-scroll-container, .notice-scroll-container { overflow: hidden; flex: 1; position: relative; }
.notice-list { display: flex; flex-direction: column; gap: 12px; padding-top: 5px; }

/* 动画 */
.list-move, .list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-leave-active { position: absolute; width: 100%; }
.list-enter-from { opacity: 0; transform: translateY(30px); }
.list-leave-to { opacity: 0; transform: translateY(-30px); }

/* 公告列表项修改：添加内边距以便hover背景色生效 */
.notice-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 10px; /* 增加内边距 */
  border-bottom: 1px dashed rgba(44, 62, 80, 0.1); cursor: pointer;
  border-radius: 4px;
  animation: noticeItemEnter 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition: all 0.3s ease;
}

@keyframes noticeItemEnter {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notice-item:nth-child(1) { animation-delay: 0.2s; }
.notice-item:nth-child(2) { animation-delay: 0.3s; }
.notice-item:nth-child(3) { animation-delay: 0.4s; }
.notice-item:nth-child(n+4) { animation-delay: 0.5s; }

.notice-item:hover {
  transform: translateX(5px);
  background-color: rgba(255, 255, 255, 0.8); /* 添加背景高亮 */
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
}
.notice-item:last-child { border-bottom: none; }

.notice-left { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.notice-tag { font-size: 12px; padding: 2px 6px; border-radius: 2px; color: #fff; flex-shrink: 0; font-family: 'Noto Serif SC', serif; }
.tag-red { background-color: var(--chinese-red); }
.tag-gold { background-color: var(--chinese-gold); }
.tag-blue { background-color: #2980B9; }
.tag-gray { background-color: #7f8c8d; }
.notice-content { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Noto Serif SC', serif; }
.notice-time { font-size: 12px; color: #999; flex-shrink: 0; }
</style>