/**
 * MongoDB连接测试脚本
 * 用于测试MongoDB连接是否正常工作
 * 使用方法: node test-db-connection.js
 */

// 加载环境变量
require('dotenv').config();

// 导入MongoDB客户端
const { MongoClient } = require('mongodb');

// 从环境变量获取连接信息
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'ainav_db';

// 没有连接字符串则退出
if (!uri) {
  console.error('错误: 未设置MONGODB_URI环境变量');
  console.log('请在.env文件中设置有效的MongoDB连接字符串');
  process.exit(1);
}

// 显示安全版本的连接字符串（隐藏密码）
const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:***@');
console.log('测试连接到:', safeUri);
console.log('数据库名称:', dbName);

// 连接选项
const options = {
  serverSelectionTimeoutMS: 5000, // 5秒超时
  connectTimeoutMS: 10000, // 10秒连接超时
};

// 创建客户端实例
const client = new MongoClient(uri, options);

// 尝试连接
async function testConnection() {
  console.log('开始连接测试...');
  
  try {
    // 连接到服务器
    await client.connect();
    console.log('✅ 成功连接到MongoDB服务器');
    
    // 连接到指定数据库
    const db = client.db(dbName);
    console.log(`✅ 成功连接到数据库: ${dbName}`);
    
    // 列出所有集合
    const collections = await db.listCollections().toArray();
    console.log('集合列表:');
    if (collections.length === 0) {
      console.log('  (数据库中没有集合)');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    console.log('\n数据库连接测试成功! 您的应用程序应该能够正常连接到数据库。');
  } catch (error) {
    console.error('❌ 连接测试失败');
    console.error('错误信息:', error.message);
    
    // 提供额外的故障排除信息
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n可能原因:');
      console.error('1. 连接字符串格式不正确');
      console.error('2. 用户名或密码错误');
      console.error('3. IP地址未加入MongoDB Atlas白名单');
      console.error('4. 网络连接问题');
    }
    
    console.log('\n建议解决方案:');
    console.log('1. 确认MongoDB连接字符串格式正确');
    console.log('2. 验证用户名和密码');
    console.log('3. 在MongoDB Atlas中将您的IP地址添加到访问列表');
    console.log('4. 如果使用本地MongoDB，确保服务已启动');
  } finally {
    // 关闭连接
    await client.close();
    console.log('已关闭数据库连接');
  }
}

// 执行测试
testConnection().catch(console.error); 