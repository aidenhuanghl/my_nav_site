/**
 * API路由主文件
 * 整合所有API路由
 */

const express = require('express');
const router = express.Router();

// 导入博客路由
const blogRoutes = require('./server/blog-routes');

// API健康检查
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API服务正常运行',
    db: process.env.MONGODB_URI ? 'MongoDB Atlas云服务' : '本地MongoDB',
    env: process.env.NODE_ENV || 'development'
  });
});

// 添加API路由
router.use('/', blogRoutes);

module.exports = router; 