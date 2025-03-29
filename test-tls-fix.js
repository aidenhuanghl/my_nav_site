/**
 * MongoDB连接测试 - TLS修复版
 * 
 * 结合官方ServerApi和额外的TLS选项来解决连接问题
 */

require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// 从环境变量获取连接字符串
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('错误: 请在.env文件中设置MONGODB_URI环境变量');
  process.exit(1);
}

console.log('Node.js版本:', process.version);
console.log('MongoDB驱动版本:', require('mongodb/package.json').version);
console.log('操作系统:', process.platform, process.arch);

try {
  // 安全显示连接字符串
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('连接字符串:', maskedUri);
} catch (e) {
  console.warn('警告: 无法解析连接字符串');
}

// 结合官方ServerApi和TLS选项的客户端配置
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // 添加额外的TLS选项，尝试解决SSL警报问题
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,  // 仅用于测试，生产环境中不推荐
  // 网络超时设置
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
});

async function run() {
  try {
    console.log('正在连接到MongoDB...');
    // 连接到服务器
    await client.connect();
    
    // 发送ping命令确认连接成功
    console.log('正在发送ping命令...');
    await client.db("admin").command({ ping: 1 });
    console.log("✅ 成功连接到MongoDB! 服务器响应了ping命令");
    
    // 尝试列出数据库
    try {
      const admin = client.db().admin();
      const { databases } = await admin.listDatabases({ nameOnly: true });
      console.log('可用数据库:', databases.map(db => db.name).join(', '));
    } catch (err) {
      console.error('列出数据库失败:', err.message);
    }
    
    return true;
  } catch (err) {
    console.error('❌ 连接失败:', err.message);
    if (err.cause) {
      console.error('根本原因:', err.cause.message || err.cause);
    }
    return false;
  } finally {
    // 确保客户端将在完成/错误时关闭
    await client.close();
    console.log('连接已关闭');
  }
}

run()
  .then(success => {
    if (success) {
      console.log('🎉 MongoDB连接成功！您可以继续开发账户管理功能');
      console.log('请在db.js中使用类似的配置选项:');
      console.log(`
const { MongoClient, ServerApiVersion } = require('mongodb');

// 从环境变量中读取连接字符串
const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("请在环境变量中设置 MONGODB_URI");
}

// 创建MongoDB客户端，使用官方推荐配置和额外TLS选项
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // 添加额外的TLS选项，解决SSL警报问题
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,  // 仅用于测试，生产环境中不推荐
  // 网络超时设置
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
});

// 连接到MongoDB并返回客户端promise
const clientPromise = client.connect();

module.exports = clientPromise;
      `);
    } else {
      console.log('连接测试失败。建议尝试:');
      console.log('1. 尝试降级Node.js版本到LTS版本 (v18.x)');
      console.log('2. 确保Atlas集群运行正常，且IP地址已加入白名单');
      console.log('3. 确认用户名密码正确');
    }
  })
  .catch(console.dir); 