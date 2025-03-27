# Vue 项目首页

这是一个基于 Vue 框架构建的项目首页，使用了 Ant Design Vue 组件库。

## 功能特点

- 响应式设计，同时支持桌面端和移动端
- 主要页面：首页和资料文档页
- 首页包含：视频展示区、产品展示区、用户指南区
- 产品展示区分为 Web 端产品和微信小程序两个 Tab
- 用户指南区分为小白和有一定基础的开发者两个 Tab
- 底部包含联系方式和外部链接

## 项目结构

```
vue-project/
├── public/                # 静态资源
│   ├── index.html         # HTML 入口文件
│   └── images/            # 图片资源
├── src/                   # 源代码
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   │   ├── Header.vue     # 头部导航组件
│   │   └── Footer.vue     # 底部组件
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   └── Documents.vue  # 资料文档页
│   ├── router/            # 路由配置
│   │   └── index.js       
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 开发指南

### 环境要求

- Node.js (>= 12.x)
- npm 或 yarn

### 安装依赖

```bash
cd vue-project
npm install
# 或 
# yarn install
```

### 本地开发

```bash
npm run serve
# 或
# yarn serve
```

### 构建生产版本

```bash
npm run build
# 或
# yarn build
```

## 技术栈

- Vue 2.6.x
- Vue Router
- Ant Design Vue 