<template>
  <div class="home">
    <app-header />
    
    <!-- 内容区域1：视频区 -->
    <section class="hero-section" :style="{ backgroundImage: `url(${require('@/assets/images/hero-bg.jpg')})` }">
      <div class="hero-content">
        <h1 class="hero-title">探索技术的无限可能</h1>
        <p class="hero-description top">通过我们的平台，了解最前沿的技术和实用工具，提升您的开发效率</p>
        <div class="video-container">
          <video controls width="100%" poster="https://source.unsplash.com/random/800x450/?coding,computer,dark">
            <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" type="video/mp4">
            您的浏览器不支持视频播放
          </video>
        </div>
        <p class="hero-description bottom">我们致力于为开发者提供最佳的工具和资源，帮助您更快速地构建出色的产品</p>
      </div>
    </section>

    <!-- 内容区域2：产品展示区 -->
    <section class="section">
      <h2 class="section-title">产品展示</h2>
      <a-tabs defaultActiveKey="web" @change="handleTabChange">
        <!-- Web 端产品轮播 -->
        <a-tab-pane key="web" tab="Web 端产品">
          <a-carousel arrows autoplay ref="webCarousel">
            <div class="carousel-content" v-for="(page, index) in webProjects" :key="'web-'+index">
              <a-row :gutter="[24, 24]">
                <a-col :xs="24" :sm="24" :md="8" v-for="(project, i) in page" :key="'project-'+i">
                  <div class="project-card">
                    <img :src="project.image" :alt="project.title" class="project-image">
                    <div class="project-content">
                      <h3>{{ project.title }}</h3>
                      <p>{{ project.description }}</p>
                      <a-button type="primary" @click="openProject(project.url)">查看项目</a-button>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-carousel>
        </a-tab-pane>
        
        <!-- 微信小程序轮播 -->
        <a-tab-pane key="miniprogram" tab="微信小程序">
          <a-carousel arrows autoplay ref="miniCarousel">
            <div class="carousel-content" v-for="(page, index) in miniPrograms" :key="'mini-'+index">
              <a-row :gutter="[24, 24]">
                <a-col :xs="24" :sm="24" :md="8" v-for="(project, i) in page" :key="'mini-project-'+i">
                  <div class="project-card">
                    <img :src="project.image" :alt="project.title" class="project-image">
                    <div class="project-content">
                      <h3>{{ project.title }}</h3>
                      <p>{{ project.description }}</p>
                      <a-button type="primary" @click="showQRCode(project)">查看项目</a-button>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-carousel>
        </a-tab-pane>
      </a-tabs>
    </section>

    <!-- 内容区域3：用户指南区 -->
    <section class="section guide-section">
      <h2 class="section-title">用户指南</h2>
      <a-tabs defaultActiveKey="beginner">
        <!-- 小白指南 -->
        <a-tab-pane key="beginner" tab="小白">
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8" v-for="(guide, index) in beginnerGuides" :key="'bg-'+index">
              <img :src="guide.image" :alt="guide.title" class="guide-image" @click="showLargeImage(guide.image)">
              <div class="guide-title">{{ guide.title }}</div>
            </a-col>
          </a-row>
        </a-tab-pane>
        
        <!-- 有经验开发者指南 -->
        <a-tab-pane key="advanced" tab="有一定基础的开发者">
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8" v-for="(guide, index) in advancedGuides" :key="'ag-'+index">
              <img :src="guide.image" :alt="guide.title" class="guide-image" @click="showLargeImage(guide.image)">
              <div class="guide-title">{{ guide.title }}</div>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </section>

    <app-footer />

    <!-- 微信小程序二维码弹窗 -->
    <a-modal 
      v-model="qrCodeVisible" 
      title="扫码使用小程序" 
      :footer="null"
      centered
    >
      <div style="text-align: center;">
        <img :src="currentQRCode" alt="小程序二维码" style="width: 200px; margin: 20px 0;">
        <p>打开微信扫一扫，立即体验</p>
      </div>
    </a-modal>

    <!-- 图片查看器 -->
    <div 
      v-if="imageViewerVisible" 
      class="image-viewer"
      @click="imageViewerVisible = false"
    >
      <img :src="currentLargeImage" alt="大图查看" class="large-image">
      <div class="image-viewer-close">
        <a-icon type="close" style="font-size: 24px; color: white;" />
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'

export default {
  name: 'HomeView',
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {
      // Web端产品数据
      webProjects: [
        [
          {
            title: '智能编辑平台',
            description: '基于 AI 的代码编辑器，提供智能补全和代码分析功能',
            image: 'https://via.placeholder.com/400x200/0E65F2/FFFFFF?text=智能编辑平台',
            url: 'https://example.com/project1'
          },
          {
            title: '数据可视化工具',
            description: '直观的数据展示平台，支持多种图表和实时数据处理',
            image: 'https://via.placeholder.com/400x200/171936/FFFFFF?text=数据可视化工具',
            url: 'https://example.com/project2'
          },
          {
            title: '云端开发环境',
            description: '在浏览器中运行的完整开发环境，无需本地配置',
            image: 'https://via.placeholder.com/400x200/0E65F2/FFFFFF?text=云端开发环境',
            url: 'https://example.com/project3'
          }
        ],
        [
          {
            title: '团队协作平台',
            description: '高效的团队协作工具，支持实时协作和项目管理',
            image: 'https://via.placeholder.com/400x200/171936/FFFFFF?text=团队协作平台',
            url: 'https://example.com/project4'
          },
          {
            title: 'API 测试工具',
            description: '简单易用的 API 测试工具，支持多种请求方式和自动化测试',
            image: 'https://via.placeholder.com/400x200/0E65F2/FFFFFF?text=API测试工具',
            url: 'https://example.com/project5'
          },
          {
            title: '代码审查助手',
            description: '帮助团队提高代码质量的审查工具，自动检测代码问题',
            image: 'https://via.placeholder.com/400x200/171936/FFFFFF?text=代码审查助手',
            url: 'https://example.com/project6'
          }
        ]
      ],
      
      // 微信小程序数据
      miniPrograms: [
        [
          {
            title: '智能笔记助手',
            description: 'AI 驱动的笔记工具，帮助整理和管理您的想法',
            image: 'https://via.placeholder.com/400x200/171936/FFFFFF?text=智能笔记助手',
            qrcode: 'https://via.placeholder.com/200x200/FFFFFF/171936?text=小程序二维码1'
          },
          {
            title: '效率工作台',
            description: '集成多种效率工具，提高日常工作效率',
            image: 'https://via.placeholder.com/400x200/0E65F2/FFFFFF?text=效率工作台',
            qrcode: 'https://via.placeholder.com/200x200/FFFFFF/171936?text=小程序二维码2'
          },
          {
            title: '技术学习助手',
            description: '提供编程技术学习资源和练习题',
            image: 'https://via.placeholder.com/400x200/171936/FFFFFF?text=技术学习助手',
            qrcode: 'https://via.placeholder.com/200x200/FFFFFF/171936?text=小程序二维码3'
          }
        ],
        [
          {
            title: '代码片段库',
            description: '收集和分享有用的代码片段，提高开发效率',
            image: 'https://via.placeholder.com/400x200/0E65F2/FFFFFF?text=代码片段库',
            qrcode: 'https://via.placeholder.com/200x200/FFFFFF/171936?text=小程序二维码4'
          },
          {
            title: '开发者社区',
            description: '连接全球开发者的交流平台，分享经验和问题',
            image: 'https://via.placeholder.com/400x200/171936/FFFFFF?text=开发者社区',
            qrcode: 'https://via.placeholder.com/200x200/FFFFFF/171936?text=小程序二维码5'
          },
          {
            title: '算法训练营',
            description: '通过实战提升算法和数据结构能力',
            image: 'https://via.placeholder.com/400x200/0E65F2/FFFFFF?text=算法训练营',
            qrcode: 'https://via.placeholder.com/200x200/FFFFFF/171936?text=小程序二维码6'
          }
        ]
      ],
      
      // 小白指南数据
      beginnerGuides: [
        {
          title: '编程入门指南',
          image: 'https://via.placeholder.com/400x300/0E65F2/FFFFFF?text=编程入门指南'
        },
        {
          title: 'Web 开发基础',
          image: 'https://via.placeholder.com/400x300/171936/FFFFFF?text=Web开发基础'
        },
        {
          title: '小程序开发入门', 
          image: 'https://via.placeholder.com/400x300/0E65F2/FFFFFF?text=小程序开发入门'
        },
        {
          title: '数据结构基础',
          image: 'https://via.placeholder.com/400x300/171936/FFFFFF?text=数据结构基础'
        },
        {
          title: 'UI 设计入门',
          image: 'https://via.placeholder.com/400x300/0E65F2/FFFFFF?text=UI设计入门'
        },
        {
          title: '版本控制入门',
          image: 'https://via.placeholder.com/400x300/171936/FFFFFF?text=版本控制入门'
        }
      ],
      
      // 高级指南数据
      advancedGuides: [
        {
          title: '高级算法与数据结构',
          image: 'https://via.placeholder.com/400x300/171936/FFFFFF?text=高级算法与数据结构'
        },
        {
          title: '前端性能优化',
          image: 'https://via.placeholder.com/400x300/0E65F2/FFFFFF?text=前端性能优化'
        },
        {
          title: '微服务架构',
          image: 'https://via.placeholder.com/400x300/171936/FFFFFF?text=微服务架构'
        },
        {
          title: '容器化与 DevOps',
          image: 'https://via.placeholder.com/400x300/0E65F2/FFFFFF?text=容器化与DevOps'
        },
        {
          title: '机器学习与 AI',
          image: 'https://via.placeholder.com/400x300/171936/FFFFFF?text=机器学习与AI'
        },
        {
          title: '区块链技术',
          image: 'https://via.placeholder.com/400x300/0E65F2/FFFFFF?text=区块链技术'
        }
      ],
      
      // 弹窗控制
      qrCodeVisible: false,
      currentQRCode: '',
      
      // 图片查看器控制
      imageViewerVisible: false,
      currentLargeImage: ''
    }
  },
  methods: {
    // 处理Tab切换
    handleTabChange(activeKey) {
      // 在Tab切换后重置轮播图
      this.$nextTick(() => {
        if (activeKey === 'web' && this.$refs.webCarousel) {
          this.$refs.webCarousel.goTo(0);
        } else if (activeKey === 'miniprogram' && this.$refs.miniCarousel) {
          this.$refs.miniCarousel.goTo(0);
        }
      });
    },
    
    // 打开网页项目
    openProject(url) {
      window.open(url, '_blank');
    },
    
    // 显示小程序二维码
    showQRCode(project) {
      this.currentQRCode = project.qrcode;
      this.qrCodeVisible = true;
    },
    
    // 显示大图
    showLargeImage(image) {
      this.currentLargeImage = image;
      this.imageViewerVisible = true;
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding-top: 64px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  color: var(--light-color);
  text-align: center;
  padding-bottom: 60px;
}

/* 添加半透明遮罩，确保文字清晰可见 */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7); /* 黑色半透明遮罩 */
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2; /* 确保内容在遮罩之上 */
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 40px 0 20px;
  color: var(--primary-color);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.video-container {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  z-index: 2;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.hero-description {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 40px;
  color: var(--text-color);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 4px;
  display: inline-block;
}

/* 特别为顶部和底部的文字段落添加不同的样式 */
.hero-description.top {
  margin-bottom: 30px;
  border-bottom: 1px solid var(--primary-color);
}

.hero-description.bottom {
  margin-top: 30px;
  border-top: 1px solid var(--primary-color);
}

.section {
  padding: 80px 50px;
  background-color: var(--section-bg-color);
}

/* 用户指南区块背景色调整 */
.section.guide-section {
  background-color: #0D0D0D;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 50px;
  color: var(--primary-color);
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background-color: var(--primary-color);
  margin: 20px auto 0;
  border-radius: 2px;
}

.carousel-content {
  padding: 20px;
}

.project-card {
  margin: 10px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
  background-color: var(--card-bg-color);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1);
}

.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-content {
  padding: 20px;
}

.project-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.project-content p {
  color: var(--text-color);
}

.guide-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  transition: transform 0.3s;
  cursor: pointer;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
}

.guide-image:hover {
  transform: scale(1.05);
}

.guide-title {
  text-align: center;
  margin-top: 10px;
  font-weight: 500;
  color: var(--primary-color);
}

.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.large-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 4px;
  box-shadow: 0 5px 25px rgba(255, 255, 255, 0.1);
}

.image-viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--primary-color);
}

@media screen and (max-width: 768px) {
  .section {
    padding: 60px 20px;
  }
  
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 40px;
  }
  
  .guide-image {
    height: 160px;
  }
}
</style> 