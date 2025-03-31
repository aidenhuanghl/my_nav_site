// 记录脚本开始执行
console.log('server.js execution started');

// 导入并配置 dotenv 以加载 .env 文件中的环境变量
require('dotenv').config();
// 记录 dotenv 配置完成
console.log('dotenv configured');

// 打印 MongoDB 连接信息和环境，用于调试
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? '已配置' : '未配置'}`);
console.log(`MongoDB数据库: ${process.env.MONGODB_DB_NAME || 'ainav_db'}`);
console.log(`环境: ${process.env.NODE_ENV || 'development'}`);

// 导入 Express 框架
const express = require('express');
// 记录 Express 已加载
console.log('express loaded');
// 导入 Node.js 内置的 path 模块，用于处理文件和目录路径
const path = require('path');
// 导入 CORS 中间件，用于处理跨域资源共享
const cors = require('cors');
// 导入 API 路由模块
const apiRoutes = require('./api');
// 记录所有依赖已加载
console.log('Dependencies loaded');

// 创建 Express 应用实例
const app = express();
// 定义服务器端口，优先使用环境变量 PORT，否则默认为 3000
const port = process.env.PORT || 3000;
// 定义服务器主机地址，优先使用环境变量 HOST，否则默认为 '0.0.0.0' (监听所有网络接口)
const host = process.env.HOST || '0.0.0.0';

// 记录服务器常量已设置
console.log('Server constants set');

// --- 中间件配置 ---

// 启用 CORS 中间件，允许所有来源的跨域请求
app.use(cors());
// 记录 CORS 已启用
console.log('CORS enabled');

// 配置 Express 内置的 JSON 解析中间件
// limit: '50mb' 设置请求体最大为 50MB，以支持可能的大数据（如图片）
app.use(express.json({ limit: '50mb' }));
// 配置 Express 内置的 URL 编码解析中间件
// extended: true 允许解析嵌套对象
// limit: '50mb' 设置请求体最大为 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// 记录请求体解析中间件已启用并增加了大小限制
console.log('Body parsers enabled with increased size limits');

// 配置静态文件服务中间件
// express.static 提供项目根目录下的静态文件（HTML, CSS, JS, 图片等）
app.use(express.static(path.join(__dirname, './')));
// 记录静态文件中间件已配置
console.log('Static files middleware configured');

// --- 路由配置 ---

// 将所有以 '/api' 开头的请求路由到 apiRoutes 模块处理
app.use('/api', apiRoutes);

// 定义根路由 ('/')
// 当用户访问网站根目录时，发送 index.html 文件
app.get('/', (req, res) => {
  // 使用 path.join 确保路径在不同操作系统上都正确
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 错误处理 ---

// 全局错误处理中间件
// 当路由处理中发生错误时，会调用此中间件
app.use((err, req, res, next) => {
  // 在服务器控制台打印详细错误堆栈信息
  console.error('服务器错误:', err.stack);
  // 向客户端发送 500 状态码和 JSON 格式的错误信息
  res.status(500).json({
    error: '服务器错误',
    // 在开发环境下显示详细错误信息，生产环境显示通用错误信息
    message: process.env.NODE_ENV === 'development' ? err.message : '发生了错误，请稍后重试'
  });
});

// 404 Not Found 处理中间件
// 如果请求没有匹配到任何路由，则会执行此中间件
app.use((req, res) => {
  // 向客户端发送 404 状态码和 JSON 格式的错误信息
  res.status(404).json({ error: '找不到请求的资源' });
});

// --- 启动服务器 ---

// 启动 Express 应用，监听指定的主机和端口
app.listen(port, host, () => {
  // 在服务器控制台打印启动信息
  console.log(`服务器运行在 http://${host}:${port}`);
  console.log(`主页: http://${host}:${port}`);
  console.log(`API: http://${host}:${port}/api`);
  // 提示是否使用了 MongoDB Atlas 云服务或本地服务
  console.log(`使用MongoDB: ${process.env.MONGODB_URI ? 'Atlas云服务' : '本地服务'}`);
}); 