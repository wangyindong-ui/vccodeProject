<template>
  <!-- 统计卡片区 (保持不变) -->
  <el-row :gutter="24">
    <el-col :span="6">
      <div class="stat-card blue-gradient">
        <div class="stat-icon"><el-icon>
            <Money />
          </el-icon></div>
        <div class="stat-info">
          <div class="label">今日销售额</div>
          <div class="value">¥ {{ stats.sales.toLocaleString() }}</div>
          <div class="trend">较昨日 <el-icon>
              <Top />
            </el-icon> 12%</div>
        </div>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="stat-card orange-gradient">
        <div class="stat-icon"><el-icon>
            <Tools />
          </el-icon></div>
        <div class="stat-info">
          <div class="label">待维修车辆</div>
          <div class="value">{{ stats.serviceWait }} 辆</div>
          <div class="trend">工位饱和度 85%</div>
        </div>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="stat-card green-gradient">
        <div class="stat-icon"><el-icon>
            <User />
          </el-icon></div>
        <div class="stat-info">
          <div class="label">本月客流量</div>
          <div class="value">{{ stats.visitors }} 人</div>
          <div class="trend">较上月 <el-icon>
              <Top />
            </el-icon> 5%</div>
        </div>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="stat-card purple-gradient">
        <div class="stat-icon"><el-icon>
            <Bell />
          </el-icon></div>
        <div class="stat-info">
          <div class="label">库存预警</div>
          <div class="value">{{ stats.stockWarning }} 项</div>
          <div class="trend">需紧急补货</div>
        </div>
      </div>
    </el-col>
  </el-row>

  <el-row :gutter="24" style="margin-top: 24px;">
    <!-- 左侧：销售趋势图表 -->
    <el-col :span="16">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="card-header">
            <span class="header-title"><el-icon>
                <TrendCharts />
              </el-icon> 销售趋势分析</span>
            <el-radio-group v-model="timeRange" size="small" @change="handleTimeChange">
              <el-radio-button label="近7天" />
              <el-radio-button label="近30天" />
            </el-radio-group>
          </div>
        </template>

        <!-- ECharts 挂载点 -->
        <div ref="chartRef" class="chart-container"></div>
      </el-card>
    </el-col>

    <!-- 右侧：快捷操作 (样式微调) -->
    <el-col :span="8">
      <el-card shadow="never" class="chart-card">
        <template #header><span class="header-title">快捷操作</span></template>
        <div class="quick-actions">
          <div class="action-item" @click="$router.push('/cars')">
            <div class="icon-box bg-blue"><el-icon>
                <Van />
              </el-icon></div>
            <span>入库新车</span>
          </div>
          <div class="action-item" @click="$router.push('/service')">
            <div class="icon-box bg-green"><el-icon>
                <SetUp />
              </el-icon></div>
            <span>维修登记</span>
          </div>
          <div class="action-item" @click="$router.push('/test-drive')">
            <div class="icon-box bg-orange"><el-icon>
                <Timer />
              </el-icon></div>
            <span>试驾预约</span>
          </div>
          <div class="action-item" @click="$router.push('/inventory')">
            <div class="icon-box bg-purple"><el-icon>
                <Files />
              </el-icon></div>
            <span>库存盘点</span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import request from '../utils/request'
import * as echarts from 'echarts' // 引入 ECharts

// --- 顶部统计数据 ---
const stats = ref({
  sales: 0,
  serviceWait: 0,
  visitors: 0,
  stockWarning: 0
})

const fetchStats = async () => {
  try {
    const res = await request.get('/dashboard/stats')
    // 根据拦截器不同，这里可能是 res 或 res.data，根据你之前的 request.js，这里通常直接是 res
    stats.value = res.data
  } catch (error) {
    console.error("获取统计失败", error)
  }
}

// ... 其他 import 保持不变
// ... 其他 import 保持不变

// --- 图表相关逻辑 ---
const timeRange = ref('近7天')
const chartRef = ref(null)
let myChart = null

// 修改 initChart：接收 days 参数，默认为 7
const initChart = async (days = 7) => {
  // 1. 发送请求时带上参数
  // 注意：params 会自动拼接到 URL 后面，变成 /dashboard/trend?days=30
  const res = await request.get('/dashboard/trend', {
    params: { days: days }
  })

  // 校验数据结构 (适配 {code:200, data: {...}} )
  if (!res || !res.data || !res.data.dates) {
    return
  }

  const chartData = res.data

  // 2. 初始化或更新 ECharts
  if (chartRef.value) {
    // 如果实例已存在，不需要 dispose 销毁，直接 setOption 更新数据即可，这样动画更丝滑
    if (!myChart) {
      myChart = echarts.init(chartRef.value)
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b} <br/> 销售额: <span style="color:#3b82f6;font-weight:bold">¥ {c}</span>'
      },
      grid: {
        left: '2%', right: '4%', bottom: '0%', top: '10%', containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.dates, // 数据更新
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', margin: 15 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          showSymbol: false,
          symbolSize: 8,
          data: chartData.values, // 数据更新
          itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 2 },
          lineStyle: { width: 3, shadowColor: 'rgba(59, 130, 246, 0.3)', shadowBlur: 10, shadowOffsetY: 5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
            ])
          }
        }
      ]
    }
    // setOption(option, true) 的第二个参数 true 表示不合并，强制重绘，防止数据残留
    myChart.setOption(option)
  }
}

// 修改切换事件
const handleTimeChange = () => {
  // 根据选中的标签判断天数
  const days = timeRange.value === '近30天' ? 30 : 7
  // 调用加载函数
  initChart(days)
}

// 监听窗口
const handleResize = () => {
  myChart && myChart.resize()
}

onMounted(() => {
  fetchStats()
  nextTick(() => {
    // 默认加载 7 天
    initChart(7)
    window.addEventListener('resize', handleResize)
  })
})

// ... onUnmounted 保持不变

// ... onUnmounted 保持不变
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) myChart.dispose()
})
</script>

<style scoped>
/* 保持原有的卡片样式 */
.stat-card {
  border-radius: 16px;
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
  cursor: pointer;
  height: 100px;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.blue-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.purple-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  font-size: 24px;
}

.stat-info {
  text-align: right;
}

.stat-info .value {
  font-size: 28px;
  font-weight: 700;
  margin: 4px 0;
}

.stat-info .label {
  font-size: 14px;
  opacity: 0.9;
}

.stat-info .trend {
  font-size: 12px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

/* --- 新增：图表容器样式 --- */
.chart-card {
  display: flex;
  flex-direction: column;
  min-height: 420px;
  /* 增加高度以容纳图表 */
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 340px;
  /* 设定图表高度 */
  width: 100%;
}

/* 快捷操作区微调 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.action-item:hover {
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bg-blue {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.bg-green {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.bg-orange {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.bg-purple {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
}
</style>