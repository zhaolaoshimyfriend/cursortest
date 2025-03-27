<template>
  <div class="documents">
    <app-header />
    
    <div class="documents-container">
      <!-- 侧边栏导航 -->
      <div class="documents-sidebar">
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
            <a-menu-item v-for="doc in documents" :key="doc.id" @click="handleDocumentClick(doc)">
              <a-icon type="file-text" />
              <span>{{ doc.title }}</span>
            </a-menu-item>
          </a-menu>
        </div>
      </div>

      <!-- 文档内容区 -->
      <div class="documents-content">
        <div class="content-header">
          <h1 class="page-title">{{ currentDoc ? currentDoc.title : '文档中心' }}</h1>
          <div class="header-actions">
            <a-button type="primary" @click="handleFeedback">
              <a-icon type="message" /> 反馈
            </a-button>
          </div>
        </div>

        <div class="content-body">
          <!-- 文档目录 -->
          <div class="doc-toc" v-if="headers.length > 0">
            <h2>目录</h2>
            <a-menu mode="inline">
              <template v-for="header in headers">
                <a-menu-item 
                  :key="header.id"
                  :style="{ paddingLeft: `${(header.level - 1) * 16}px` }"
                  @click="scrollToHeader(header.id)"
                >
                  {{ header.title }}
                </a-menu-item>
              </template>
            </a-menu>
          </div>

          <!-- 文档内容 -->
          <div class="doc-content" v-if="currentDoc">
            <div v-html="currentDoc.content"></div>
          </div>
        </div>
      </div>
    </div>
    
    <app-footer />
  </div>
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
import axios from 'axios'

export default {
  name: 'DocumentsView',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      searchQuery: '',
      selectedKeys: [],
      currentDoc: null,
      documents: [],
      headers: []
    }
  },
  methods: {
    async fetchDocuments() {
      try {
        const response = await axios.get('http://localhost:8000/api/documents');
        this.documents = response.data;
        if (this.documents.length > 0) {
          this.currentDoc = this.documents[0];
          this.headers = this.currentDoc.headers;
        }
      } catch (error) {
        this.$message.error('获取文档列表失败');
      }
    },
    
    async handleDocumentClick(doc) {
      try {
        const response = await axios.get(`http://localhost:8000/api/documents/${doc.id}`);
        this.currentDoc = response.data;
        this.headers = response.data.headers;
      } catch (error) {
        this.$message.error('获取文档内容失败');
      }
    },
    
    handleSearch(value) {
      // 实现搜索功能
      this.$message.info('搜索功能开发中');
    },
    
    handleFeedback() {
      this.$message.info('反馈功能开发中');
    },

    scrollToHeader(id) {
      // 实现滚动到指定标题的功能
      this.$message.info('滚动到指定标题功能开发中');
    }
  },
  created() {
    this.fetchDocuments();
  }
}
</script>

<style scoped>
.documents-container {
  display: flex;
  min-height: calc(100vh - 64px - 60px);
  background-color: var(--bg-primary);
}

.documents-sidebar {
  width: 280px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  position: fixed;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 24px 0;
}

.sidebar-search {
  padding: 0 16px 24px;
}

.sidebar-nav {
  padding: 0 8px;
}

.documents-content {
  flex: 1;
  margin-left: 280px;
  padding: 40px;
  background-color: var(--bg-primary);
  max-width: 1200px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
}

.card-cover {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.card-cover .anticon {
  font-size: 48px;
  color: var(--text-color);
}

.document-card {
  height: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
  overflow: hidden;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.doc-meta {
  display: flex;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 12px;
}

.doc-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.content-body {
  display: flex;
  gap: 40px;
}

.doc-toc {
  width: 240px;
  position: sticky;
  top: 24px;
  height: fit-content;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.doc-toc h2 {
  color: var(--text-color);
  font-size: 1.2rem;
  margin-bottom: 16px;
  font-weight: 600;
}

.doc-content {
  flex: 1;
  min-width: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 32px;
}

.doc-content h1,
.doc-content h2,
.doc-content h3,
.doc-content h4,
.doc-content h5,
.doc-content h6 {
  color: var(--text-color);
  margin: 24px 0 16px;
  font-weight: 600;
}

.doc-content h1 { font-size: 2rem; }
.doc-content h2 { font-size: 1.75rem; }
.doc-content h3 { font-size: 1.5rem; }
.doc-content h4 { font-size: 1.25rem; }
.doc-content h5 { font-size: 1.1rem; }
.doc-content h6 { font-size: 1rem; }

.doc-content p {
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 16px;
}

.doc-content code {
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.doc-content pre {
  background-color: var(--bg-tertiary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.doc-content pre code {
  background-color: transparent;
  padding: 0;
}

.doc-content ul,
.doc-content ol {
  color: var(--text-color);
  margin: 16px 0;
  padding-left: 24px;
}

.doc-content li {
  margin-bottom: 8px;
}

.doc-content blockquote {
  border-left: 4px solid var(--border-color);
  margin: 16px 0;
  padding-left: 16px;
  color: var(--text-secondary);
}

.doc-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.doc-content th,
.doc-content td {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  text-align: left;
}

.doc-content th {
  background-color: var(--bg-tertiary);
  font-weight: 600;
}

@media screen and (max-width: 768px) {
  .documents-sidebar {
    display: none;
  }
  
  .documents-content {
    margin-left: 0;
    padding: 24px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .content-body {
    flex-direction: column;
  }
  
  .doc-toc {
    width: 100%;
    position: static;
  }
}
</style> 