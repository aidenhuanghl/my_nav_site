# 个人博客网站 - MongoDB版

一个使用HTML、CSS、JavaScript编写的个人博客网站，后端使用Express和MongoDB实现数据持久化存储。

## 功能特点

- 现代化、响应式设计，支持移动端和桌面端
- 发布、编辑和删除博客文章
- 草稿保存功能
- 基于浏览量的热门文章排序
- 支持标签和分类管理
- 支持图片上传
- 数据存储在MongoDB数据库中，实现持久化

## 技术栈

- 前端：HTML、CSS、JavaScript
- 后端：Node.js、Express
- 数据库：MongoDB
- API：RESTful API

## 安装和运行

### 前提条件

- Node.js（版本12或更高）
- MongoDB（本地或Atlas云数据库）

### 安装步骤

1. 克隆项目
```
git clone https://github.com/your-username/my-nav-site.git
cd my-nav-site
```

2. 安装依赖
```
cd server
npm install
```

3. 配置数据库
   - 修改`server/.env`文件中的MongoDB连接字符串

4. 运行服务器
```
cd server
node server.js
```

5. 访问网站
   - 打开浏览器访问 http://localhost:3000

## 数据迁移

此项目支持从localStorage迁移数据到MongoDB。当您首次使用MongoDB版本时，系统会自动尝试将localStorage中的数据迁移到MongoDB数据库。

## 项目结构

```
.
├── index.html          # 网站主页
├── style.css           # 样式文件
├── blog.js             # 博客功能JS
├── blog-api.js         # MongoDB API接口
├── visual-effects.js   # 视觉效果JS
├── images/             # 图片资源
└── server/             # 后端服务器
    ├── server.js       # Express服务器
    ├── db.js           # MongoDB连接和模型
    ├── api.js          # API服务
    └── .env            # 环境配置
```

## 开发者

本项目由[Your Name]开发维护。

## 许可证

MIT