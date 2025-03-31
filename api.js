/**
 * API 路由主文件
 * 这个文件是 Express 路由的入口点，负责整合和管理项目中所有的 API 路由。
 */

// 导入 Express 框架
const express = require('express');
// 创建一个新的路由对象
const router = express.Router();
// 导入 Node.js 内置的 path 模块，用于处理文件和目录路径
const path = require('path');

// 定义博客相关的路由文件的路径
// 使用 path.join 确保路径在不同操作系统上的兼容性
// __dirname 指向当前文件所在的目录
const blogRoutesPath = path.join(__dirname, 'server/blog-routes');
// 导入博客路由模块
const blogRoutes = require(blogRoutesPath);

// 定义 /api/health 路由，用于健康检查
// 这个端点可以用来监控 API 服务的状态
router.get('/health', (req, res) => {
  // 返回一个 JSON 对象，包含状态信息、数据库类型和运行环境
  res.json({ 
    status: 'ok', // 表示服务状态正常
    message: 'API服务正常运行',
    db: process.env.MONGODB_URI ? 'MongoDB Atlas云服务' : '本地MongoDB', // 显示当前使用的 MongoDB 类型
    env: process.env.NODE_ENV || 'development' // 显示当前的运行环境（开发或生产）
  });
});

// 将博客相关的路由挂载到根路径 ('/') 下
// 所有发送到 /api/ 的请求（在 server.js 中定义了前缀）
// 并且匹配 blogRoutes 中定义的路径的请求，都会由 blogRoutes 处理
router.use('/', blogRoutes);

// 导出路由对象，使其可以在其他文件中（如 server.js）使用
module.exports = router; 