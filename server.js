console.log('server.js execution started');

// 加载环境变量
require('dotenv').config();
console.log('dotenv configured');

// 连接到MongoDB
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? '已配置' : '未配置'}`);
console.log(`MongoDB数据库: ${process.env.MONGODB_DB_NAME || 'ainav_db'}`);
console.log(`环境: ${process.env.NODE_ENV || 'development'}`);

const express = require('express');
console.log('express loaded');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./api');
console.log('Dependencies loaded');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

console.log('Server constants set');

// 中间件
app.use(cors());
console.log('CORS enabled');

// 增加请求体大小限制 - 解决PayloadTooLargeError
app.use(express.json({ limit: '50mb' }));  // 解析JSON请求体，最大50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));  // 解析URL编码的请求体，最大50MB
console.log('Body parsers enabled with increased size limits');

// 静态文件服务
app.use(express.static(path.join(__dirname, './')));
console.log('Static files middleware configured');

// API路由
app.use('/api', apiRoutes);

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    error: '服务器错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '发生了错误，请稍后重试'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '找不到请求的资源' });
});

// 启动服务器
app.listen(port, host, () => {
  console.log(`服务器运行在 http://${host}:${port}`);
  console.log(`主页: http://${host}:${port}`);
  console.log(`API: http://${host}:${port}/api`);
  console.log(`使用MongoDB: ${process.env.MONGODB_URI ? 'Atlas云服务' : '本地服务'}`);
}); 