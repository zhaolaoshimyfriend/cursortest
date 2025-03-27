<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
:root {
  --primary-color: #000000;
  --dark-color: #000000;
  --light-color: #000000;
  --text-color: #FFFFFF;
  --text-secondary: #CCCCCC;
  --card-bg-color: #000000;
  --section-bg-color: #000000;
  --border-color: #333333;
  --border-hover: #666666;
  --bg-primary: #000000;
  --bg-secondary: #000000;
  --bg-tertiary: #1A1A1A;
  --bg-card: #000000;
  --text-primary: #FFFFFF;
  --text-secondary: #CCCCCC;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
}

body {
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-primary);
}

#app {
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
}

/* 更新 Ant Design Vue 组件样式 */
.ant-btn-primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: var(--text-color) !important;
}

.ant-btn-primary:hover,
.ant-btn-primary:focus {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  opacity: 0.8;
}

.ant-tabs-tab {
  color: var(--text-secondary) !important;
}

.ant-tabs-tab-active {
  color: var(--text-color) !important;
}

.ant-tabs-ink-bar {
  background-color: var(--text-color) !important;
}

.ant-menu {
  background-color: var(--bg-secondary) !important;
  border-right: 1px solid var(--border-color) !important;
}

.ant-menu-item {
  color: var(--text-secondary) !important;
  margin: 4px 0 !important;
  border-radius: 4px !important;
}

.ant-menu-item:hover {
  color: var(--text-color) !important;
  background-color: var(--bg-tertiary) !important;
}

.ant-menu-item-selected {
  color: var(--text-color) !important;
  background-color: var(--bg-tertiary) !important;
}

.ant-input-search {
  background-color: var(--bg-tertiary) !important;
  border-radius: 4px !important;
  padding: 8px !important;
}

.ant-input-search .ant-input {
  background-color: var(--bg-tertiary) !important;
  border: none !important;
  color: var(--text-color) !important;
}

.ant-input-search .ant-input::placeholder {
  color: var(--text-secondary) !important;
}

.ant-card {
  background-color: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.ant-card:hover {
  border-color: var(--border-hover) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ant-card-meta-title {
  color: var(--text-color) !important;
  font-size: 16px !important;
  font-weight: 500 !important;
}

.ant-card-meta-description {
  color: var(--text-secondary) !important;
  font-size: 14px !important;
}

/* 覆盖 Ant Design Vue 的默认样式 */
.ant-layout {
  background-color: var(--bg-primary) !important;
}

.ant-layout-header {
  background-color: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color);
}

.ant-layout-footer {
  background-color: var(--bg-secondary) !important;
  border-top: 1px solid var(--border-color);
}

.ant-input {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-color) !important;
}

.ant-input:hover {
  border-color: var(--border-hover) !important;
}

.ant-input:focus {
  border-color: var(--text-color) !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
}

.ant-tabs-nav {
  color: var(--text-secondary) !important;
}

.ant-carousel .slick-dots li button {
  background: var(--text-secondary) !important;
}

.ant-carousel .slick-dots li.slick-active button {
  background: var(--text-color) !important;
}
</style> 