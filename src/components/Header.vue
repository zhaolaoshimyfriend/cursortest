<template>
  <header class="header">
    <div class="logo-container">
      <img src="https://via.placeholder.com/120x32/000000/FFFFFF?text=Logo" alt="Logo" class="logo">
    </div>
    <div class="nav-container">
      <a-menu mode="horizontal" :selectedKeys="[current]" class="nav-menu">
        <a-menu-item key="home">
          <router-link to="/">首页</router-link>
        </a-menu-item>
        <a-menu-item key="documents">
          <router-link to="/documents">资料文档</router-link>
        </a-menu-item>
      </a-menu>
    </div>
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-button" :style="{display: isMobile ? 'block' : 'none'}">
      <a-button type="text" style="color: white;" @click="toggleMobileMenu">
        <a-icon type="menu" />
      </a-button>
    </div>
    <!-- 移动端菜单 -->
    <a-drawer
      placement="right"
      :closable="false"
      :visible="drawerVisible"
      @close="drawerVisible = false"
    >
      <a-menu mode="vertical" :selectedKeys="[current]">
        <a-menu-item key="home">
          <router-link to="/" @click.native="drawerVisible = false">首页</router-link>
        </a-menu-item>
        <a-menu-item key="documents">
          <router-link to="/documents" @click.native="drawerVisible = false">资料文档</router-link>
        </a-menu-item>
      </a-menu>
    </a-drawer>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      current: 'home',
      isMobile: false,
      drawerVisible: false
    }
  },
  mounted() {
    // 设置当前激活的菜单项
    this.current = this.$route.path === '/' ? 'home' : 'documents';
    
    // 监听路由变化
    this.$router.afterEach((to) => {
      this.current = to.path === '/' ? 'home' : 'documents';
    });
    
    // 初始化和监听窗口大小变化
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.drawerVisible = false;
      }
    },
    toggleMobileMenu() {
      this.drawerVisible = !this.drawerVisible;
    }
  }
}
</script>

<style scoped>
.header {
  background-color: var(--dark-color);
  color: var(--light-color);
  padding: 16px 50px;
  position: fixed;
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.logo {
  height: 32px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.nav-menu {
  background: transparent;
  border: none;
}

.nav-menu :deep(.ant-menu-item) {
  color: var(--light-color);
}

.nav-menu :deep(.ant-menu-item-selected) {
  background-color: transparent;
  color: var(--primary-color);
}

.nav-menu :deep(a) {
  color: inherit;
}

@media screen and (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }
}
</style> 