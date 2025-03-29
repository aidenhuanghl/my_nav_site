/**
 * 直接MongoDB连接测试工具
 * 
 * 使用方法: node test-direct.js "mongodb+srv://用户名:密码@集群地址.mongodb.net/?retryWrites=true&w=majority"
 */

const { MongoClient } = require('mongodb');

// 从命令行参数获取连接字符串
const uri = process.argv[2];
if (!uri) {
  console.error('错误: 请提供MongoDB连接字符串作为命令行参数');
  console.error('例如: node test-direct.js "mongodb+srv://用户名:密码@集群地址.mongodb.net/?retryWrites=true&w=majority"');
  process.exit(1);
}

console.log('Node.js版本:', process.version);
console.log('MongoDB驱动版本:', require('mongodb/package.json').version);
console.log('操作系统:', process.platform, process.arch);

// 连接选项
const options = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 30000
};

console.log('尝试连接到MongoDB...');
console.log('连接字符串前缀:', uri.split('@')[0].replace(/\/\/([^:]+):(.+)/, '//***:***'));
console.log('连接选项:', JSON.stringify(options, null, 2));

async function testConnection() {
  const client = new MongoClient(uri, options);
  
  try {
    console.log('正在连接...');
    await client.connect();
    console.log('✅ 连接成功!');
    
    try {
      // 尝试列出数据库
      const admin = client.db().admin();
      const { databases } = await admin.listDatabases({ nameOnly: true });
      console.log('可用数据库:', databases.map(db => db.name).join(', '));
    } catch (err) {
      console.error('数据库操作失败:', err.message);
    }
    
    await client.close();
    console.log('连接已关闭');
  } catch (err) {
    console.error('❌ 连接失败:', err.message);
    if (err.cause) {
      console.error('根本原因:', err.cause.message || err.cause);
    }
    await client.close().catch(() => {});
  }
}

testConnection().catch(err => {
  console.error('测试执行失败:', err);
  process.exit(1);
}); 