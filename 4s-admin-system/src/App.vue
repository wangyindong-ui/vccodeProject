<template>
  <router-view />
</template>

<style>
/* 全局重置与字体优化 */
:root {
  --el-color-primary: #3b82f6; /* 更现代的蓝色 */
  --el-menu-bg-color: #1e293b;
  --el-menu-text-color: #94a3b8;
  --el-menu-active-color: #fff;
  --el-menu-hover-bg-color: #334155;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f1f5f9; /* 浅灰蓝背景，比纯白更护眼 */
  -webkit-font-smoothing: antialiased;
}

/* 优化 Element Plus 卡片 */
.el-card {
  border: none !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

/* 优化表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #475569;
}
.el-table th.el-table__cell {
  font-weight: 600;
}

/* 优化按钮圆角 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>