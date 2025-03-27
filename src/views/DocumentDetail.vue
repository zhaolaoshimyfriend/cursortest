<template>
  <div class="document-detail">
    <app-header />
    
    <div class="document-container">
      <!-- 侧边栏导航 -->
      <div class="document-sidebar">
        <div class="sidebar-search">
          <a-input-search
            v-model="searchQuery"
            placeholder="搜索文档..."
            @search="handleSearch"
            style="width: 100%"
          />
        </div>
        
        <div class="sidebar-nav">
          <a-menu
            v-model="selectedKeys"
            mode="inline"
            :style="{ height: '100%', borderRight: 0 }"
          >
            <a-menu-item v-for="category in categories" :key="category.id" @click="handleCategoryClick(category)">
              <a-icon :type="category.icon" />
              <span>{{ category.name }}</span>
            </a-menu-item>
          </a-menu>
        </div>
      </div>

      <!-- 文档内容区 -->
      <div class="document-content">
        <div class="content-header">
          <div class="breadcrumb">
            <a-breadcrumb>
              <a-breadcrumb-item @click="$router.push('/documents')">文档中心</a-breadcrumb-item>
              <a-breadcrumb-item>{{ currentCategory?.name }}</a-breadcrumb-item>
              <a-breadcrumb-item>{{ document.title }}</a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          
          <div class="header-actions">
            <a-button type="primary" @click="handleFeedback">
              <a-icon type="message" /> 反馈
            </a-button>
            <a-button @click="handleShare">
              <a-icon type="share-alt" /> 分享
            </a-button>
          </div>
        </div>

        <div class="markdown-content" v-html="renderedContent"></div>
      </div>

      <!-- 右侧目录 -->
      <div class="document-toc">
        <div class="toc-title">目录</div>
        <div class="toc-content" v-html="renderedToc"></div>
      </div>
    </div>
    
    <app-footer />
  </div>
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
import marked from 'marked'
import DOMPurify from 'dompurify'
import tocbot from 'tocbot'

export default {
  name: 'DocumentDetailView',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      searchQuery: '',
      selectedKeys: [],
      currentCategory: null,
      document: {
        id: '',
        title: '',
        content: '',
        category: '',
        updateTime: '',
        views: 0
      },
      categories: [
        { id: 'getting-started', name: '快速入门', icon: 'rocket' },
        { id: 'features', name: '功能特性', icon: 'star' },
        { id: 'api', name: 'API 文档', icon: 'code' },
        { id: 'tutorials', name: '教程', icon: 'book' },
        { id: 'faq', name: '常见问题', icon: 'question-circle' }
      ]
    }
  },
  computed: {
    renderedContent() {
      if (!this.document.content) return '';
      const rawHtml = marked(this.document.content);
      return DOMPurify.sanitize(rawHtml);
    },
    renderedToc() {
      if (!this.document.content) return '';
      const rawHtml = marked(this.document.content);
      const sanitizedHtml = DOMPurify.sanitize(rawHtml);
      return tocbot.refresh();
    }
  },
  methods: {
    async fetchDocument() {
      try {
        const docId = this.$route.params.id;
        const response = await this.$http.get(`/api/documents/${docId}`);
        this.document = response.data;
        this.currentCategory = this.categories.find(c => c.id === this.document.category);
        this.selectedKeys = [this.document.category];
        
        // 初始化目录
        this.$nextTick(() => {
          tocbot.init({
            tocSelector: '.toc-content',
            contentSelector: '.markdown-content',
            headingSelector: 'h1, h2, h3, h4, h5, h6',
            hasInnerContainers: true,
            scrollSmooth: true,
            scrollSmoothDuration: 35,
            scrollSmoothOffset: 0
          });
        });
      } catch (error) {
        this.$message.error('获取文档内容失败');
      }
    },
    
    handleSearch(value) {
      this.$router.push({
        path: '/documents',
        query: { search: value }
      });
    },
    
    handleCategoryClick(category) {
      this.$router.push(`/documents?category=${category.id}`);
    },
    
    handleFeedback() {
      this.$message.info('反馈功能开发中');
    },
    
    handleShare() {
      this.$message.info('分享功能开发中');
    }
  },
  created() {
    this.fetchDocument();
  },
  beforeDestroy() {
    tocbot.destroy();
  }
}
</script>

<style scoped>
.document-container {
  display: flex;
  min-height: calc(100vh - 64px - 60px);
  background-color: var(--dark-color);
}

.document-sidebar {
  width: 280px;
  background-color: var(--card-bg-color);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.sidebar-search {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  padding: 16px 0;
}

.document-content {
  flex: 1;
  margin-left: 280px;
  margin-right: 280px;
  padding: 40px;
  background-color: var(--dark-color);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.breadcrumb {
  color: var(--text-color);
}

.header-actions {
  display: flex;
  gap: 16px;
}

.markdown-content {
  color: var(--text-color);
  line-height: 1.8;
}

.markdown-content :deep(h1) {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.markdown-content :deep(h2) {
  font-size: 2rem;
  color: var(--primary-color);
  margin: 2rem 0 1rem;
}

.markdown-content :deep(h3) {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 1.5rem 0 1rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.document-toc {
  width: 280px;
  background-color: var(--card-bg-color);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  right: 0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 20px;
}

.toc-title {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: 16px;
  font-weight: bold;
}

.toc-content {
  color: var(--text-color);
}

.toc-content :deep(.toc-link) {
  color: var(--text-color);
  text-decoration: none;
}

.toc-content :deep(.toc-link:hover) {
  color: var(--primary-color);
}

.toc-content :deep(.toc-link.is-active-link) {
  color: var(--primary-color);
}

@media screen and (max-width: 1200px) {
  .document-toc {
    display: none;
  }
  
  .document-content {
    margin-right: 0;
  }
}

@media screen and (max-width: 768px) {
  .document-sidebar {
    display: none;
  }
  
  .document-content {
    margin-left: 0;
    padding: 20px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}
</style> 