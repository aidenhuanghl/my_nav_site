// test-api.js - 测试API和数据库连接集成

// 加载环境变量
require('dotenv').config();

// 导入必要模块
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const { getUserDAO } = require('./db-utils');
const apiRoutes = require('./api');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API路由
app.use('/api', apiRoutes);

// 测试路由
app.get('/test', (req, res) => {
  res.json({ message: '测试API正常工作！' });
});

// 测试数据库连接
app.get('/test-db', async (req, res) => {
  try {
    const userDAO = await getUserDAO();
    const stats = await userDAO.getCollectionStats();
    res.json({ 
      message: '数据库连接成功！', 
      stats,
      collection: userDAO.collection.collectionName
    });
  } catch (error) {
    res.status(500).json({ 
      message: '数据库连接失败', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 修改用户DAO以支持获取集合统计信息
const addStats = async () => {
  try {
    const userDAO = await getUserDAO();
    userDAO.getCollectionStats = async function() {
      const stats = await this.collection.stats();
      return stats;
    };
    console.log('添加统计功能成功');
  } catch (error) {
    console.error('添加统计功能失败:', error);
  }
};

// 启动服务器
async function startServer() {
  try {
    // 连接数据库并初始化DAO
    await getUserDAO();
    await addStats();
    
    // 启动服务器
    app.listen(PORT, HOST, () => {
      console.log(`测试服务器运行在 http://${HOST}:${PORT}`);
      console.log(`测试API: http://${HOST}:${PORT}/test`);
      console.log(`测试数据库: http://${HOST}:${PORT}/test-db`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
}

// 运行服务器
startServer(); 