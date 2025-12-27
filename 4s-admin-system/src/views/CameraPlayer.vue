<template>
  <div class="camera-grid-wrapper">
    <!-- 4宫格布局 -->
    <div class="camera-grid">
      <div v-for="camera in cameras" :key="camera.id" class="camera-item">
        <div class="monitor-frame">
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
          
          <!-- 摄像头标题 -->
          <div class="camera-title">{{ camera.name }}</div>
          
          <!-- 视频播放区 -->
          <div class="video-box">
            <video 
              :ref="el => { if (el) videoRefs[camera.id] = el }"
              class="video-player" 
              controls 
              autoplay 
              muted
            ></video>
            
            <!-- 直播状态标 -->
            <div class="live-badge" :class="{ 'is-offline': !camera.isPlaying }">
              <div class="dot"></div> {{ camera.isPlaying ? 'LIVE' : 'OFFLINE' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制栏 -->
    <div class="controls-bar">
      <div class="status-text">
        <el-icon class="icon-spin"><Loading /></el-icon>
        {{ globalStatus }}
      </div>
      <div class="btn-group">
        <el-button type="success" size="small" class="chinese-btn" @click="startAllCameras">
          <el-icon><VideoPlay /></el-icon> 启动录制
        </el-button>
        <el-button type="danger" size="small" class="chinese-btn" @click="stopAllCameras">
          <el-icon><VideoPause /></el-icon> 停止录制
        </el-button>
        <el-button type="info" size="small" class="chinese-btn" @click="checkAllStatus">
          <el-icon><View /></el-icon> 检查状态
        </el-button>
        <el-button type="primary" size="small" class="chinese-btn" @click="reconnectAll">
          <el-icon><RefreshRight /></el-icon> 重连播放
        </el-button>
        <el-button type="warning" size="small" class="chinese-btn" @click="restartAll">
          <el-icon><RefreshRight /></el-icon> 重启全部
        </el-button>
        <el-button type="danger" size="small" class="chinese-btn" @click="destroyAll">
          <el-icon><SwitchButton /></el-icon> 断开播放
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import Hls from 'hls.js';
import { RefreshRight, SwitchButton, Loading, View, VideoPlay, VideoPause } from '@element-plus/icons-vue';

const videoRefs = reactive({});
const hlsInstances = reactive({});
const liveEdgeTimers = reactive({});
const globalStatus = ref('初始化中...');

// 使用后端接口地址（动态从接口获取）
let cameras = reactive([
  { id: 'camera1', name: '摄像头 1', url: 'http://localhost:8091/api/stream/camera1/stream.m3u8', isPlaying: false },
  { id: 'camera2', name: '摄像头 2', url: 'http://localhost:8091/api/stream/camera2/stream.m3u8', isPlaying: false },
  { id: 'camera3', name: '摄像头 3', url: 'http://localhost:8091/api/stream/camera3/stream.m3u8', isPlaying: false },
  { id: 'camera4', name: '摄像头 4', url: 'http://localhost:8091/api/stream/camera4/stream.m3u8', isPlaying: false }
]);

// 从后端接口动态获取可用的摄像头列表
const loadAvailableCameras = async () => {
  try {
    const response = await fetch('http://localhost:8091/api/stream/list');
    const data = await response.json();
    
    if (data.streams && data.streams.length > 0) {
      // 根据后端返回的流列表更新摄像头信息
      cameras.splice(0, cameras.length);
      data.streams.forEach((stream, index) => {
        cameras.push({
          id: stream.cameraId,
          name: `摄像头 ${index + 1} (${stream.cameraId})`,
          url: `http://localhost:8091${stream.url}`,
          isPlaying: false
        });
      });
      console.log('已加载摄像头列表:', cameras);
    }
  } catch (error) {
    console.error('获取摄像头列表失败:', error);
  }
};
// 播放单个摄像头（带自动重试）
const playCamera = (camera, retryCount = 0) => {
  const video = videoRefs[camera.id];
  if (!video) return;

  if (Hls.isSupported()) {
    // 如果已存在实例，先销毁
    if (hlsInstances[camera.id]) {
      hlsInstances[camera.id].destroy();
      delete hlsInstances[camera.id];
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      liveSyncDurationCount: 2,
      liveMaxLatencyDurationCount: 4,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      backBufferLength: 5,
      maxBufferSize: 5 * 1000 * 1000,
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 2
    });

    hls.loadSource(camera.url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log(`📺 ${camera.name} HLS 清单已解析，开始播放`);
      video.play().catch(err => {
        console.log(`${camera.name} 自动播放被拦截`);
      });
      camera.isPlaying = true;
      startLiveEdgeSync(camera);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error(`${camera.name} HLS 播放错误:`, data.type, data.details);
      if (data.fatal) {
        camera.isPlaying = false;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log(`${camera.name} 网络错误，尝试恢复...`);
            // 如果是404错误且重试次数少于5次，说明HLS文件可能还没生成好
            if (data.details === 'manifestLoadError' && retryCount < 5) {
              console.log(`${camera.name} 文件未就绪，${3}秒后重试 (${retryCount + 1}/5)...`);
              destroyCamera(camera);
              setTimeout(() => {
                playCamera(camera, retryCount + 1);
              }, 3000);
            } else {
              setTimeout(() => {
                if (hls) hls.startLoad();
              }, 1000);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log(`${camera.name} 媒体错误，尝试恢复...`);
            hls.recoverMediaError();
            break;
          default:
            destroyCamera(camera);
            break;
        }
      }
    });

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      console.log(`📦 ${camera.name} 片段已加载:`, {
        序号: data.frag.sn,
        时长: `${data.frag.duration.toFixed(2)}s`,
        大小: `${(data.frag.stats.total / 1024).toFixed(2)} KB`
      });
    });

    hlsInstances[camera.id] = hls;

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = camera.url;
    video.addEventListener('loadedmetadata', () => {
      video.play();
      camera.isPlaying = true;
    });
  } else {
    console.error(`${camera.name} 浏览器不支持 HLS 播放`);
  }
};

// 启动延迟追赶逻辑
const startLiveEdgeSync = (camera) => {
  clearLiveEdgeSync(camera);
  
  liveEdgeTimers[camera.id] = setInterval(() => {
    const video = videoRefs[camera.id];
    const hls = hlsInstances[camera.id];
    if (!video || !hls || video.paused) return;
    
    const buffered = video.buffered;
    if (buffered.length > 0) {
      const bufferEnd = buffered.end(buffered.length - 1);
      const currentTime = video.currentTime;
      const latency = bufferEnd - currentTime;
      
      console.log(`⏱ ${camera.name} 当前延迟: ${latency.toFixed(2)}秒`);
      
      if (latency > 10) {
        console.log(`🚀 ${camera.name} 延迟过大，温和跳转`);
        const targetTime = bufferEnd - 2;
        if (targetTime > currentTime) {
          video.currentTime = targetTime;
        }
      }
    }
  }, 5000);
};

const clearLiveEdgeSync = (camera) => {
  if (liveEdgeTimers[camera.id]) {
    clearInterval(liveEdgeTimers[camera.id]);
    delete liveEdgeTimers[camera.id];
  }
};

// 销毁单个摄像头
const destroyCamera = (camera) => {
  clearLiveEdgeSync(camera);
  if (hlsInstances[camera.id]) {
    hlsInstances[camera.id].destroy();
    delete hlsInstances[camera.id];
  }
  camera.isPlaying = false;
};

// 播放全部
const playAll = () => {
  globalStatus.value = '正在启动全部摄像头...';
  cameras.forEach(camera => {
    playCamera(camera);
  });
  setTimeout(() => {
    const playingCount = cameras.filter(c => c.isPlaying).length;
    globalStatus.value = `${playingCount}/${cameras.length} 个摄像头在线`;
  }, 2000);
};

// 重连全部
const reconnectAll = () => {
  globalStatus.value = '重连全部摄像头...';
  cameras.forEach(camera => {
    destroyCamera(camera);
    setTimeout(() => playCamera(camera), 500);
  });
};

// 销毁全部
const destroyAll = () => {
  cameras.forEach(camera => {
    destroyCamera(camera);
  });
  globalStatus.value = '全部已断开';
};

// 检查全部状态（从后端获取FFmpeg进程状态）
const checkAllStatus = async () => {
  try {
    const response = await fetch('http://localhost:8091/api/camera/status');
    const data = await response.json();
    if (data.status) {
      const activeCount = data.totalActive;
      globalStatus.value = `✅ ${activeCount} 个摄像头进程运行中 (${cameras.filter(c => c.isPlaying).length} 个播放中)`;
    } else {
      globalStatus.value = '❌ 未找到摄像头进程';
    }
  } catch (error) {
    globalStatus.value = '❌ 无法获取状态';
    console.error('检查状态失败:', error);
  }
};

// 重启全部流（调用后端重启FFmpeg进程）
const restartAll = async () => {
  try {
    globalStatus.value = '正在重启全部摄像头...';
    destroyAll();
    
    // 调用后端重启FFmpeg进程
    const response = await fetch('http://localhost:8091/api/camera/restart/all', {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      globalStatus.value = '摄像头进程已重启，等待视频流生成...';
      // 等待FFmpeg生成HLS文件
      setTimeout(async () => {
        await loadAvailableCameras();
        playAll();
      }, 5000);
    } else {
      globalStatus.value = '❌ 重启失败: ' + data.message;
    }
  } catch (error) {
    globalStatus.value = '❌ 重启失败';
    console.error('重启失败:', error);
  }
};

// 启动全部摄像头进程（后端FFmpeg）
const startAllCameras = async () => {
  try {
    globalStatus.value = '正在启动摄像头进程...';
    const response = await fetch('http://localhost:8091/api/camera/start/all', {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      globalStatus.value = '摄像头进程已启动，等待视频流生成...';
      setTimeout(async () => {
        await loadAvailableCameras();
        playAll();
      }, 5000);
    } else {
      globalStatus.value = '❌ 启动失败: ' + data.message;
    }
  } catch (error) {
    globalStatus.value = '❌ 启动失败';
    console.error('启动失败:', error);
  }
};

// 停止全部摄像头进程（后端FFmpeg）
const stopAllCameras = async () => {
  try {
    globalStatus.value = '正在停止摄像头进程...';
    destroyAll();
    
    const response = await fetch('http://localhost:8091/api/camera/stop/all', {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      globalStatus.value = '全部摄像头进程已停止';
    } else {
      globalStatus.value = '❌ 停止失败: ' + data.message;
    }
  } catch (error) {
    globalStatus.value = '❌ 停止失败';
    console.error('停止失败:', error);
  }
};

onMounted(async () => {
  // 页面加载时先检查后端状态
  globalStatus.value = '正在连接后端...';
  try {
    // 先检查摄像头状态
    const statusResponse = await fetch('http://localhost:8091/api/camera/status');
    const statusData = await statusResponse.json();
    
    if (statusData.totalActive === 0) {
      // 没有活跃进程，提示用户点击启动录制
      globalStatus.value = '📹 请点击"启动录制"按钮开始监控';
      await loadAvailableCameras(); // 尝试加载现有列表
    } else {
      // 有活跃进程，等待HLS文件生成后再播放
      globalStatus.value = `发现 ${statusData.totalActive} 个活跃进程，等待视频流就绪...`;
      await loadAvailableCameras();
      // 延迟3秒再播放，给FFmpeg时间生成HLS文件
      setTimeout(() => {
        playAll();
      }, 3000);
    }
  } catch (error) {
    console.error('初始化失败:', error);
    globalStatus.value = '❌ 后端连接失败，请确认后端服务已启动';
  }
});

onBeforeUnmount(() => {
  destroyAll();
});
</script>

<style scoped>
.camera-grid-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  flex: 1;
  min-height: 0;
}

.camera-item {
  position: relative;
  min-height: 0;
}

.monitor-frame {
  position: relative;
  border: 1px solid #2C3E50;
  padding: 4px;
  background-color: #000;
  border-radius: 2px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.camera-title {
  position: absolute;
  top: 8px;
  left: 8px;
  color: #D4AC0D;
  font-size: 14px;
  font-weight: bold;
  z-index: 3;
  background: rgba(0,0,0,0.7);
  padding: 2px 8px;
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
}

.corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: #D4AC0D;
  z-index: 2;
  transition: all 0.3s;
}
.top-left { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
.top-right { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
.bottom-left { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
.bottom-right { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

.video-box {
  position: relative;
  width: 100%;
  flex: 1;
  background: #1a1a1a;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.live-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(39, 174, 96, 0.9);
  color: white;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: bold;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  transition: background-color 0.3s;
  z-index: 3;
}

.live-badge.is-offline {
  background-color: rgba(192, 57, 43, 0.9);
}

.dot {
  width: 5px;
  height: 5px;
  background-color: #fff;
  border-radius: 50%;
  animation: blink 1s infinite;
}

.live-badge.is-offline .dot {
  animation: none;
  opacity: 0.5;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(44, 62, 80, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(44, 62, 80, 0.1);
}

.status-text {
  font-size: 12px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-spin {
  animation: rotate 2s linear infinite;
}
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.btn-group {
  display: flex;
  gap: 10px;
}

.chinese-btn {
  border-radius: 2px;
  font-family: 'Noto Serif SC', serif;
}

/* ============================================
   响应式样式 - 监控页面
   ============================================ */

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .camera-grid-wrapper {
    padding: 10px;
  }
  
  /* 摄像头网格改为单列 */
  .camera-grid {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
    gap: 15px !important;
  }
  
  .camera-item {
    height: 220px;
  }
  
  .camera-title {
    font-size: 12px !important;
  }
  
  .live-badge {
    font-size: 10px !important;
    padding: 2px 6px !important;
  }
  
  /* 控制栏垂直布局 */
  .controls-bar {
    flex-direction: column !important;
    gap: 10px;
    padding: 12px !important;
  }
  
  .status-text {
    width: 100%;
    justify-content: center;
    font-size: 11px !important;
  }
  
  .btn-group {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px !important;
  }
  
  .btn-group .el-button {
    flex: 1 1 calc(50% - 8px);
    min-width: 120px;
    font-size: 12px !important;
    padding: 8px 12px !important;
  }
}

/* 平板端适配 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .camera-grid {
    gap: 12px !important;
  }
  
  .camera-title {
    font-size: 13px !important;
  }
  
  .btn-group .el-button {
    font-size: 13px !important;
    padding: 8px 12px !important;
  }
}

/* 横屏移动设备 */
@media screen and (max-width: 768px) and (orientation: landscape) {
  .camera-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .camera-item {
    height: 180px;
  }
  
  .btn-group .el-button {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 100px;
  }
}
</style>
