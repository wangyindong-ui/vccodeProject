<template>
  <div class="mechanic-workbench">
    <!-- 顶部标题 -->
    <div class="chinese-card header-section">
      <div class="card-title-bar">
        <span class="title-text">:: 维修师傅工作台 ::</span>
        <span class="subtitle">我的维修任务管理</span>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="chinese-card main-content">
      <el-tabs v-model="activeTab" class="work-tabs" @tab-click="handleTabClick">
        <!-- 待完成任务 -->
        <el-tab-pane label="待完成任务" name="pending">
          <template #label>
            <span class="tab-label">
              <el-icon><Clock /></el-icon>
              待完成任务 ({{ pendingTasks.length }})
            </span>
          </template>
          
          <!-- 搜索条件 -->
          <div class="search-bar">
            <el-input
              v-model="pendingFilters.plate"
              placeholder="车牌号搜索"
              clearable
              class="search-input"
              @input="handlePendingSearch"
              @clear="handlePendingSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-date-picker
              v-model="pendingFilters.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
              class="search-date"
              @change="handlePendingSearch"
            />
            <el-button class="reset-btn" @click="resetPendingFilters">
              <el-icon><Refresh /></el-icon>
              <span class="reset-text">重置</span>
            </el-button>
          </div>
          
          <div v-loading="pendingLoading" class="task-list">
            <el-empty v-if="pendingTasks.length === 0" description="暂无待完成任务" />
            
            <div v-else class="task-grid">
              <div
                v-for="task in pendingTasks"
                :key="task.id"
                class="task-card pending"
                :class="{ 'expanded': isTaskExpanded(task.id) }"
              >
                <!-- 默认收起状态：只显示车牌号 -->
                <div 
                  class="task-summary"
                  @click="toggleTaskExpand(task.id)"
                >
                  <div class="summary-left">
                    <el-tag :type="task.status === 3 ? 'warning' : 'primary'" effect="dark" size="small">
                      {{ task.status === 3 ? '已派工' : '维修中' }}
                    </el-tag>
                    <el-icon class="car-icon"><Van /></el-icon>
                    <span class="plate-text">{{ task.plate }}</span>
                  </div>
                  <div class="summary-right">
                    <span class="expand-hint">{{ isTaskExpanded(task.id) ? '收起' : '点击展开' }}</span>
                    <el-icon class="expand-icon" :class="{ 'rotated': isTaskExpanded(task.id) }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
                
                <!-- 展开状态：显示详细信息 -->
                <div v-show="isTaskExpanded(task.id)" class="task-detail">
                  <div class="task-header">
                    <span class="order-no">{{ task.orderNo }}</span>
                  </div>
                  
                  <div class="task-body">
                    <div class="info-row">
                      <el-icon class="info-icon"><User /></el-icon>
                      <span class="label">车主：</span>
                      <span class="value">{{ task.owner }}</span>
                    </div>
                    
                    <div class="info-row">
                      <el-icon class="info-icon"><Document /></el-icon>
                      <span class="label">车型：</span>
                      <span class="value">{{ task.carModel || '-' }}</span>
                    </div>
                    
                    <div class="info-row issue-row">
                      <el-icon class="info-icon"><WarningFilled /></el-icon>
                      <span class="label">故障：</span>
                      <span class="value issue-text">{{ task.issue }}</span>
                    </div>
                    
                    <div class="info-row">
                      <el-icon class="info-icon"><Calendar /></el-icon>
                      <span class="label">派工时间：</span>
                      <span class="value">{{ formatTime(task.sendUserTime) }}</span>
                    </div>
                    
                    <div v-if="task.status === 2 && task.startRepairTime" class="info-row">
                      <el-icon class="info-icon"><Calendar /></el-icon>
                      <span class="label">开始维修：</span>
                      <span class="value highlight-time">{{ formatTime(task.startRepairTime) }}</span>
                    </div>
                  </div>
                  
                  <div class="task-footer">
                    <el-button
                      v-if="task.status === 3"
                      type="primary"
                      :icon="VideoPlay"
                      @click.stop="handleStartTask(task)"
                      class="action-btn"
                    >
                      开始维修
                    </el-button>
                    <el-button
                      v-if="task.status === 2"
                      type="success"
                      :icon="CircleCheck"
                      @click.stop="handleCompleteTask(task)"
                      class="action-btn"
                    >
                      完成维修
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 已完成任务 -->
        <el-tab-pane label="已完成任务" name="completed">
          <template #label>
            <span class="tab-label">
              <el-icon><CircleCheck /></el-icon>
              已完成任务 ({{ completedTasks.length }})
            </span>
          </template>
          
          <!-- 搜索条件 -->
          <div class="search-bar">
            <el-input
              v-model="completedFilters.plate"
              placeholder="车牌号搜索"
              clearable
              class="search-input"
              @input="handleCompletedSearch"
              @clear="handleCompletedSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-date-picker
              v-model="completedFilters.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
              class="search-date"
              @change="handleCompletedSearch"
            />
            <el-button class="reset-btn" @click="resetCompletedFilters">
              <el-icon><Refresh /></el-icon>
              <span class="reset-text">重置</span>
            </el-button>
          </div>
          
          <div v-loading="completedLoading" class="task-list">
            <el-empty v-if="completedTasks.length === 0" description="暂无已完成任务" />
            
            <div v-else class="task-grid">
              <div
                v-for="task in completedTasks"
                :key="task.id"
                class="task-card completed"
                :class="{ 'expanded': isTaskExpanded('completed-' + task.id) }"
              >
                <!-- 默认收起状态：只显示车牌号 -->
                <div 
                  class="task-summary"
                  @click="toggleTaskExpand('completed-' + task.id)"
                >
                  <div class="summary-left">
                    <el-tag :type="getStatusType(task.status)" effect="dark" size="small">
                      {{ getStatusText(task.status) }}
                    </el-tag>
                    <el-icon class="car-icon"><Van /></el-icon>
                    <span class="plate-text">{{ task.plate }}</span>
                  </div>
                  <div class="summary-right">
                    <span class="expand-hint">{{ isTaskExpanded('completed-' + task.id) ? '收起' : '点击展开' }}</span>
                    <el-icon class="expand-icon" :class="{ 'rotated': isTaskExpanded('completed-' + task.id) }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
                
                <!-- 展开状态：显示详细信息 -->
                <div v-show="isTaskExpanded('completed-' + task.id)" class="task-detail">
                  <div class="task-header">
                    <span class="order-no">{{ task.orderNo }}</span>
                  </div>
                  
                  <div class="task-body">
                    <div class="info-row">
                      <el-icon class="info-icon"><User /></el-icon>
                      <span class="label">车主：</span>
                      <span class="value">{{ task.owner }}</span>
                    </div>
                    
                    <div class="info-row">
                      <el-icon class="info-icon"><Document /></el-icon>
                      <span class="label">车型：</span>
                      <span class="value">{{ task.carModel || '-' }}</span>
                    </div>
                    
                    <div class="info-row issue-row">
                      <el-icon class="info-icon"><WarningFilled /></el-icon>
                      <span class="label">故障：</span>
                      <span class="value issue-text">{{ task.issue }}</span>
                    </div>
                    
                    <div class="info-row">
                      <el-icon class="info-icon"><Calendar /></el-icon>
                      <span class="label">开始维修：</span>
                      <span class="value">{{ formatTime(task.startRepairTime) }}</span>
                    </div>
                    
                    <div class="info-row">
                      <el-icon class="info-icon"><Calendar /></el-icon>
                      <span class="label">维修结束：</span>
                      <span class="value highlight-time">{{ formatTime(task.endRepairTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  CircleCheck,
  Van,
  User,
  Document,
  WarningFilled,
  Calendar,
  VideoPlay,
  Search,
  Refresh,
  ArrowDown
} from '@element-plus/icons-vue'
import request from '../utils/request'

// 数据定义
const activeTab = ref('pending')
const pendingLoading = ref(false)
const completedLoading = ref(false)
const pendingTasks = ref([])
const completedTasks = ref([])

// 展开的任务卡片ID集合
const expandedTasks = ref(new Set())

// 切换任务卡片展开/折叠状态
const toggleTaskExpand = (taskId) => {
  if (expandedTasks.value.has(taskId)) {
    expandedTasks.value.delete(taskId)
  } else {
    expandedTasks.value.add(taskId)
  }
  // 触发响应式更新
  expandedTasks.value = new Set(expandedTasks.value)
}

// 判断任务是否展开
const isTaskExpanded = (taskId) => {
  return expandedTasks.value.has(taskId)
}

// 搜索条件
const pendingFilters = ref({
  plate: '',
  date: ''
})
const completedFilters = ref({
  plate: '',
  date: ''
})

// 搜索防抖定时器
let pendingSearchTimer = null
let completedSearchTimer = null

// 标记是否已初始化加载
let initialized = false

// 自动刷新定时器
let autoRefreshTimer = null
const AUTO_REFRESH_INTERVAL = 6000 // 6秒自动刷新一次

// 获取待完成任务
const fetchPendingTasks = async () => {
  pendingLoading.value = true
  try {
    const params = {}
    if (pendingFilters.value.plate) {
      params.plate = pendingFilters.value.plate
    }
    if (pendingFilters.value.date) {
      params.date = pendingFilters.value.date
    }
    const res = await request({
      url: '/mechanic/pendingTasks',
      method: 'get',
      params
    })
    if (res.code === 200) {
      pendingTasks.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取待完成任务失败')
    }
  } catch (error) {
    console.error('获取待完成任务失败:', error)
    ElMessage.error('获取待完成任务失败')
  } finally {
    pendingLoading.value = false
  }
}

// 获取已完成任务
const fetchCompletedTasks = async () => {
  completedLoading.value = true
  try {
    const params = {}
    if (completedFilters.value.plate) {
      params.plate = completedFilters.value.plate
    }
    if (completedFilters.value.date) {
      params.date = completedFilters.value.date
    }
    const res = await request({
      url: '/mechanic/completed-tasks',
      method: 'get',
      params
    })
    if (res.code === 200) {
      completedTasks.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取已完成任务失败')
    }
  } catch (error) {
    console.error('获取已完成任务失败:', error)
    ElMessage.error('获取已完成任务失败')
  } finally {
    completedLoading.value = false
  }
}

// 待完成任务搜索（防抖300ms）
const handlePendingSearch = () => {
  if (pendingSearchTimer) {
    clearTimeout(pendingSearchTimer)
  }
  pendingSearchTimer = setTimeout(() => {
    fetchPendingTasks()
  }, 300)
}

// 已完成任务搜索（防抖300ms）
const handleCompletedSearch = () => {
  if (completedSearchTimer) {
    clearTimeout(completedSearchTimer)
  }
  completedSearchTimer = setTimeout(() => {
    fetchCompletedTasks()
  }, 300)
}

// 重置待完成任务搜索条件
const resetPendingFilters = () => {
  pendingFilters.value.plate = ''
  pendingFilters.value.date = ''
  fetchPendingTasks()
}

// 重置已完成任务搜索条件
const resetCompletedFilters = () => {
  completedFilters.value.plate = ''
  completedFilters.value.date = ''
  fetchCompletedTasks()
}

// 开始维修任务
const handleStartTask = (task) => {
  ElMessageBox.confirm(
    `确定开始维修工单 "${task.orderNo}" 吗？`,
    '开始维修',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const res = await request({
        url: `/mechanic/start/${task.id}`,
        method: 'post'
      })
      if (res.code === 200) {
        ElMessage.success('已开始维修')
        await fetchPendingTasks()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('开始维修失败:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 完成维修任务
const handleCompleteTask = (task) => {
  ElMessageBox.confirm(
    `确定完成工单 "${task.orderNo}" 的维修吗？`,
    '完成维修',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      const res = await request({
        url: `/mechanic/complete/${task.id}`,
        method: 'post'
      })
      if (res.code === 200) {
        ElMessage.success('维修任务已完成')
        await fetchPendingTasks()
        await fetchCompletedTasks()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('完成任务失败:', error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 标签页切换
const handleTabClick = (tab) => {
  // 切换时刷新对应数据
  if (tab.props.name === 'completed') {
    fetchCompletedTasks()
  } else if (tab.props.name === 'pending') {
    fetchPendingTasks()
  }
}

// 格式化时间（兼容数组格式和字符串格式）
const formatTime = (timeData) => {
  if (!timeData) return '-'
  
  // 如果是数组格式 [y, m, d, h, min, s]
  if (Array.isArray(timeData)) {
    if (timeData.length < 5) return '-'
    const [y, m, d, h, min, s] = timeData
    const pad = (num) => String(num).padStart(2, '0')
    const sec = (s === undefined || s === null) ? '00' : pad(s)
    return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${sec}`
  }
  
  // 如果是字符串或 Date 对象格式
  const date = new Date(timeData)
  if (isNaN(date.getTime())) return '-'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 状态文字映射
const getStatusText = (status) => {
  const map = { 1: '待维修', 2: '维修中', 3: '已派工', 4: '已完成' }
  return map[status] || '未知'
}

// 状态标签类型映射
const getStatusType = (status) => {
  const map = { 1: 'warning', 2: 'primary', 3: 'info', 4: 'success' }
  return map[status] || 'info'
}

// 初始化数据加载
const initData = () => {
  // 并行获取两个列表，确保标签页数量显示正确
  fetchPendingTasks()
  fetchCompletedTasks()
}

// 静默刷新待完成任务（不显示loading，避免干扰用户）
const silentRefreshPendingTasks = async () => {
  try {
    const params = {}
    if (pendingFilters.value.plate) {
      params.plate = pendingFilters.value.plate
    }
    if (pendingFilters.value.date) {
      params.date = pendingFilters.value.date
    }
    const res = await request({
      url: '/mechanic/pendingTasks',
      method: 'get',
      params
    })
    if (res.code === 200) {
      const newTasks = res.data || []
      // 检查是否有新任务
      const oldIds = new Set(pendingTasks.value.map(t => t.id))
      const hasNewTask = newTasks.some(t => !oldIds.has(t.id))
      
      pendingTasks.value = newTasks
      
      // 如果有新任务，给用户一个提示
      if (hasNewTask && newTasks.length > pendingTasks.value.length) {
        ElMessage.success('收到新的维修任务！')
      }
    }
  } catch (error) {
    console.error('自动刷新待完成任务失败:', error)
  }
}

// 静默刷新已完成任务（不显示loading，避免干扰用户）
const silentRefreshCompletedTasks = async () => {
  try {
    const params = {}
    if (completedFilters.value.plate) {
      params.plate = completedFilters.value.plate
    }
    if (completedFilters.value.date) {
      params.date = completedFilters.value.date
    }
    const res = await request({
      url: '/mechanic/completed-tasks',
      method: 'get',
      params
    })
    if (res.code === 200) {
      completedTasks.value = res.data || []
    }
  } catch (error) {
    console.error('自动刷新已完成任务失败:', error)
  }
}

// 启动自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh() // 先清除已有的定时器
  autoRefreshTimer = setInterval(() => {
    silentRefreshPendingTasks()
    silentRefreshCompletedTasks()
  }, AUTO_REFRESH_INTERVAL)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// 页面首次加载时获取数据
onMounted(() => {
  initData()
  initialized = true
  startAutoRefresh() // 启动自动刷新
})

// keep-alive 缓存激活时刷新数据（从其他页面返回时）
onActivated(() => {
  if (initialized) {
    // 已经初始化过，刷新数据
    initData()
  }
  startAutoRefresh() // 重新启动自动刷新
})

// keep-alive 缓存停用时停止自动刷新
onDeactivated(() => {
  stopAutoRefresh()
})

// 组件卸载时停止自动刷新
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$border-color: #E5E0D5;

.mechanic-workbench {
  padding: 20px;

  .chinese-card {
    background: #fff;
    border: 1px solid $border-color;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    position: relative;
    background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');

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

  .header-section {
    .card-title-bar {
      text-align: center;
      position: relative;
      z-index: 1;

      .title-text {
        font-weight: bold;
        color: $ink-black;
        font-family: 'Noto Serif SC', serif;
        font-size: 20px;
        display: block;
        margin-bottom: 8px;
      }

      .subtitle {
        color: #7f8c8d;
        font-size: 14px;
        display: block;
      }
    }
  }

  .main-content {
    min-height: 70vh;
    padding: 30px;
    position: relative;
    z-index: 1;
  }

  .work-tabs {
    :deep(.el-tabs__item) {
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      font-weight: 500;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .search-bar {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding: 18px 24px;
    background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
    border-radius: 12px;
    border: 1px solid rgba($imperial-gold, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    align-items: center;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 20px;
      right: 20px;
      height: 2px;
      background: linear-gradient(90deg, transparent, $imperial-gold, $vermilion, $imperial-gold, transparent);
      border-radius: 2px;
    }

    .search-input {
      flex: 1;
      max-width: 260px;

      :deep(.el-input__wrapper) {
        border-radius: 10px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(255, 255, 255, 0.8);
        border: 1px solid #ddd6c8;
        background: linear-gradient(180deg, #fff 0%, #fdfcfa 100%);
        padding: 4px 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: rgba($imperial-gold, 0.5);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 8px rgba($imperial-gold, 0.12);
        }
        
        &:focus-within {
          border-color: $imperial-gold;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 3px rgba($imperial-gold, 0.1), 0 4px 12px rgba($imperial-gold, 0.15);
        }
      }

      :deep(.el-input__prefix) {
        color: $imperial-gold;
        font-size: 14px;
      }

      :deep(.el-input__inner) {
        font-family: 'Noto Serif SC', serif;
        font-size: 13px;
        color: $ink-black;
        
        &::placeholder {
          color: #aaa69d;
          font-size: 13px;
        }
      }

      :deep(.el-input__suffix) {
        .el-input__clear {
          color: #bbb;
          
          &:hover {
            color: $vermilion;
          }
        }
      }
    }

    .search-date {
      width: 200px;

      :deep(.el-input__wrapper) {
        border-radius: 10px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(255, 255, 255, 0.8);
        border: 1px solid #ddd6c8;
        background: linear-gradient(180deg, #fff 0%, #fdfcfa 100%);
        padding: 4px 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: rgba($imperial-gold, 0.5);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 8px rgba($imperial-gold, 0.12);
        }
        
        &:focus-within {
          border-color: $imperial-gold;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 3px rgba($imperial-gold, 0.1), 0 4px 12px rgba($imperial-gold, 0.15);
        }
      }

      :deep(.el-input__prefix) {
        color: $imperial-gold;
        font-size: 14px;
      }

      :deep(.el-input__inner) {
        font-family: 'Noto Serif SC', serif;
        font-size: 13px;
        color: $ink-black;
        
        &::placeholder {
          color: #aaa69d;
          font-size: 13px;
        }
      }

      :deep(.el-input__suffix) {
        .el-input__clear {
          color: #bbb;
          
          &:hover {
            color: $vermilion;
          }
        }
      }
    }

    .reset-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 24px;
      background: linear-gradient(180deg, #fff 0%, #f8f6f2 100%);
      border: 1px solid #ddd6c8;
      border-radius: 10px;
      color: $ink-black;
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);

      .el-icon {
        font-size: 15px;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      &:hover {
        background: linear-gradient(180deg, $imperial-gold 0%, #c9a00c 100%);
        border-color: $imperial-gold;
        color: #fff;
        box-shadow: 0 4px 16px rgba($imperial-gold, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);

        .el-icon {
          transform: rotate(360deg);
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba($imperial-gold, 0.25), inset 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .task-list {
    padding: 20px 0;
  }

  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
  }

  .task-card {
    border: 2px solid $border-color;
    border-radius: 8px;
    padding: 0;
    transition: all 0.3s;
    background: #fff;
    overflow: hidden;

    &.pending {
      border-left: 4px solid $imperial-gold;

      &:hover {
        box-shadow: 0 4px 16px rgba($imperial-gold, 0.3);
      }
      
      &.expanded:hover {
        transform: translateY(-4px);
      }
    }

    &.completed {
      border-left: 4px solid #67C23A;
      opacity: 0.9;

      &:hover {
        box-shadow: 0 4px 16px rgba(#67C23A, 0.2);
      }
    }

    // 收起状态的摘要行
    .task-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      cursor: pointer;
      transition: all 0.3s;
      background: linear-gradient(135deg, #fdfcfa 0%, #f8f6f2 100%);

      &:hover {
        background: linear-gradient(135deg, #fff 0%, #faf8f5 100%);
      }

      .summary-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .car-icon {
          color: $imperial-gold;
          font-size: 18px;
        }

        .plate-text {
          font-family: 'Microsoft YaHei', sans-serif;
          font-weight: bold;
          font-size: 16px;
          color: $vermilion;
          letter-spacing: 1px;
        }
      }

      .summary-right {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #999;
        font-size: 12px;

        .expand-hint {
          transition: opacity 0.3s;
        }

        .expand-icon {
          font-size: 14px;
          transition: transform 0.3s;

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }
    }

    // 展开后的详情区域
    .task-detail {
      padding: 0 20px 20px;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 12px;
      border-bottom: 1px dashed $border-color;

      .order-no {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: $ink-black;
        font-size: 14px;
      }
    }

    .task-body {
      .info-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        font-size: 14px;

        .info-icon {
          color: $imperial-gold;
          margin-right: 8px;
          margin-top: 2px;
        }

        .label {
          color: #7f8c8d;
          font-weight: 500;
          min-width: 80px;
        }

        .value {
          flex: 1;
          color: $ink-black;
          font-weight: 500;

          &.plate-number {
            color: $vermilion;
            font-family: 'Microsoft YaHei', sans-serif;
            font-weight: bold;
            font-size: 15px;
          }
          
          &.highlight-time {
            color: #409EFF;
            font-weight: bold;
          }
        }

        &.issue-row {
          .issue-text {
            color: #E6A23C;
            line-height: 1.6;
          }
        }
      }
    }

    .task-footer {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed $border-color;
      display: flex;
      justify-content: center;

      .action-btn {
        width: 100%;
        font-family: 'Noto Serif SC', serif;
        font-weight: 500;
      }
    }
  }
}

/* 手机端响应式样式 */
@media screen and (max-width: 768px) {
  .mechanic-workbench {
    padding: 8px;

    .main-content {
      padding: 10px;
    }

    .search-bar {
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      margin-bottom: 12px;

      &::before {
        height: 2px;
      }

      .search-input {
        max-width: none;
        width: 100%;
      }

      .search-date {
        width: 100%;
      }

      .reset-btn {
        width: 100%;
        padding: 12px;
        font-size: 14px;
        
        .reset-text {
          display: inline;
        }
      }
    }

    .task-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .task-card {
      padding: 0;

      .task-summary {
        padding: 10px 12px;

        .summary-left {
          gap: 8px;

          .el-tag {
            font-size: 10px;
            padding: 2px 4px;
          }

          .car-icon {
            font-size: 16px;
          }

          .plate-text {
            font-size: 14px;
          }
        }

        .summary-right {
          .expand-hint {
            display: none;
          }

          .expand-icon {
            font-size: 16px;
          }
        }
      }

      .task-detail {
        padding: 0 12px 12px;
      }

      .task-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 10px;
        padding-bottom: 8px;

        .el-tag {
          font-size: 11px;
          padding: 2px 6px;
          height: auto;
        }

        .order-no {
          font-size: 12px;
        }
      }

      .task-body {
        .info-row {
          flex-direction: row;
          align-items: center;
          margin-bottom: 6px;
          font-size: 13px;

          .info-icon {
            margin-right: 4px;
            font-size: 14px;
            display: none; /* 移动端隐藏图标节省空间 */
          }

          .label {
            min-width: 70px;
            font-size: 12px;
            color: #95a5a6;
          }

          .value {
            flex: 1;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.plate-number {
              font-size: 14px;
            }
          }
        }

        /* 故障描述特殊处理 - 保持多行但紧凑 */
        .issue-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          margin-bottom: 8px;
          
          .label {
            margin-bottom: 4px;
          }

          .issue-text {
            display: block !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            overflow: visible !important;
            max-height: none !important;
            width: 100%;
            background: #fffaf0;
            padding: 6px 8px;
            border-radius: 4px;
            border-left: 3px solid #E6A23C;
            font-size: 12px;
            line-height: 1.4;
          }
        }
      }

      .task-footer {
        margin-top: 10px;
        padding-top: 8px;

        .action-btn {
          padding: 8px 0;
          font-size: 14px;
        }
      }
    }

    /* 标签页样式调整 */
    .work-tabs {
      :deep(.el-tabs__item) {
        font-size: 13px;
        padding: 0 10px;
      }

      .tab-label {
        gap: 3px;
        
        .el-icon {
          font-size: 14px;
        }
      }
    }

    /* 头部样式调整 */
    .header-section {
      padding: 12px !important;
      margin-bottom: 10px !important;
      
      .card-title-bar {
        .title-text {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .subtitle {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
