require('dotenv').config(); // 加载环境变量
const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./api');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

// 中间件
app.use(express.json());  // 解析JSON请求体
app.use(express.urlencoded({ extended: true }));  // 解析URL编码的请求体

// 启用CORS（跨域资源共享）
app.use(cors());

// 静态文件服务
app.use(express.static(path.join(__dirname, './')));

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
}); 