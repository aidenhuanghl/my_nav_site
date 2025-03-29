/**
 * MongoDB官方推荐连接测试工具
 * 
 * 使用正式的连接方式测试MongoDB Atlas连接
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

// 创建MongoDB客户端，使用官方推荐配置
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('正在连接到MongoDB...');
    // 连接到服务器（v4.7+版本可选）
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

// 直接命令行参数传入连接字符串版本
async function runWithString(connectionString) {
  const directClient = new MongoClient(connectionString, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  try {
    console.log('正在连接到MongoDB(直接字符串)...');
    await directClient.connect();
    console.log('正在发送ping命令...');
    await directClient.db("admin").command({ ping: 1 });
    console.log("✅ 直接字符串方式成功连接到MongoDB!");
    return true;
  } catch (err) {
    console.error('❌ 直接字符串连接失败:', err.message);
    return false;
  } finally {
    await directClient.close();
  }
}

// 如果有命令行参数，使用直接传入的连接字符串测试
if (process.argv.length > 2) {
  console.log('检测到命令行参数，将使用提供的连接字符串进行测试');
  runWithString(process.argv[2])
    .then(success => {
      if (success) {
        console.log('建议将此连接字符串添加到.env文件中的MONGODB_URI变量');
      } else {
        console.log('连接失败，请检查连接字符串格式和凭据');
      }
    })
    .catch(console.dir);
} else {
  // 使用.env中的连接字符串测试
  run()
    .then(success => {
      if (success) {
        console.log('MongoDB连接测试成功! 您的.env文件中的MONGODB_URI配置正确');
      } else {
        console.log('连接测试失败，请检查配置');
        console.log('尝试以下操作:');
        console.log('1. 确保MongoDB Atlas中已添加你的IP地址到白名单');
        console.log('2. 验证用户名和密码是否正确');
        console.log('3. 检查连接字符串格式是否正确');
      }
    })
    .catch(console.dir);
} 