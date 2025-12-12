<template>
  <div class="camera-player-wrapper">
    <!-- 装饰外框 -->
    <div class="monitor-frame">
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>
      
      <!-- 视频播放区 -->
      <div class="video-box">
        <video 
          ref="videoElement" 
          class="video-player" 
          controls 
          autoplay 
          muted
        ></video>
        
        <!-- 直播状态标 -->
        <div class="live-badge">
          <div class="dot"></div> LIVE
        </div>
      </div>
    </div>

    <!-- 控制栏 -->
    <div class="controls-bar">
      <div class="status-text">
        <el-icon class="icon-spin"><Loading /></el-icon> 信号接收中...
      </div>
      <div class="btn-group">
        <el-button type="primary" size="small" class="chinese-btn" @click="play">
          <el-icon><RefreshRight /></el-icon> 重连
        </el-button>
        <el-button type="danger" size="small" class="chinese-btn" @click="destroy">
          <el-icon><SwitchButton /></el-icon> 断开
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
// 确保你已经运行了 npm install flv.js
import flvjs from 'flv.js'; 
import { RefreshRight, SwitchButton, Loading } from '@element-plus/icons-vue';

const videoElement = ref(null);
let flvPlayer = null;

const play = () => {
  if (flvjs.isSupported()) {
    if (flvPlayer) {
      destroy();
    }

    // 创建 flv.js 实例
    // 注意：这里的 url 需要是你真实的后端 WebSocket 地址
    // 如果你在本地测试，确保后端已启动且端口对应
    flvPlayer = flvjs.createPlayer({
      type: 'flv',
      isLive: true,
      hasAudio: false,
      url: 'ws://localhost:8091/live/camera' // 请确认端口是 8080 还是 8091
    }, {
      enableWorker: false, 
      enableStashBuffer: false,
      stashInitialSize: 128
    });

    flvPlayer.attachMediaElement(videoElement.value);
    
    flvPlayer.load();
    flvPlayer.play().catch(err => {
      console.log("自动播放被拦截，需要用户交互");
    });

    flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
      console.error('播放错误:', errorType, errorDetail);
    });
  } else {
    console.error("您的浏览器不支持 FLV 播放");
  }
};

const destroy = () => {
  if (flvPlayer) {
    flvPlayer.pause();
    flvPlayer.unload();
    flvPlayer.detachMediaElement();
    flvPlayer.destroy();
    flvPlayer = null;
  }
};

onMounted(() => {
  play();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style scoped>
.camera-player-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monitor-frame {
  position: relative;
  border: 1px solid #2C3E50;
  padding: 4px;
  background-color: #000;
  border-radius: 2px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

/* 四角装饰 */
.corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: #D4AC0D; /* 帝王金 */
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
  height: 0;
  padding-bottom: 56.25%; /* 16:9 比例 */
  background: #1a1a1a;
  overflow: hidden;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.live-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(192, 57, 43, 0.8); /* 朱红 */
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
  pointer-events: none;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: #fff;
  border-radius: 50%;
  animation: blink 1s infinite;
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
</style>