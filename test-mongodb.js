/**
 * MongoDB连接测试工具
 * 
 * 这个脚本会尝试多种连接选项，帮助诊断MongoDB连接问题
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// 获取连接字符串
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('错误: 请在.env文件中设置MONGODB_URI环境变量');
  process.exit(1);
}

// 打印基本信息
console.log('Node.js版本:', process.version);
console.log('MongoDB驱动版本:', require('mongodb/package.json').version);
console.log('操作系统:', process.platform, process.arch);

// 从连接字符串中提取基本信息
try {
  // 提取基本信息但不显示敏感信息
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('连接字符串:', maskedUri);
  
  const urlObj = new URL(uri);
  console.log('连接类型:', uri.startsWith('mongodb+srv') ? 'SRV (DNS)' : '标准');
  console.log('主机:', urlObj.hostname);
  
  if (urlObj.searchParams.has('replicaSet')) {
    console.log('副本集:', urlObj.searchParams.get('replicaSet'));
  }
} catch (e) {
  console.warn('警告: 无法解析连接字符串:', e.message);
}

// 定义不同的连接选项
const connectionSets = [
  {
    name: '默认设置',
    options: {}
  },
  {
    name: '允许无效证书',
    options: {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true
    }
  },
  {
    name: '宽松SSL设置',
    options: {
      ssl: true,
      tls: true,
      tlsInsecure: true
    }
  },
  {
    name: '禁用SSL',
    options: {
      ssl: false,
      tls: false
    }
  },
  {
    name: '增加超时时间',
    options: {
      ssl: true,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      serverSelectionTimeoutMS: 90000
    }
  },
  {
    name: '直接连接',
    options: {
      ssl: true,
      directConnection: true
    }
  }
];

// 测试连接
async function testConnection(name, options) {
  console.log(`\n[${name}] 尝试连接...`);
  console.log('连接选项:', JSON.stringify(options, null, 2));
  
  const client = new MongoClient(uri, options);
  
  try {
    console.log(`[${name}] 正在连接...`);
    await client.connect();
    console.log(`[${name}] ✅ 连接成功!`);
    
    try {
      // 尝试执行简单的数据库操作
      const admin = client.db().admin();
      const { databases } = await admin.listDatabases({ nameOnly: true });
      console.log(`[${name}] 可用数据库:`, databases.map(db => db.name).join(', '));
    } catch (opErr) {
      console.error(`[${name}] 数据库操作失败:`, opErr.message);
    }
    
    await client.close();
    console.log(`[${name}] 连接已关闭`);
    return true;
  } catch (err) {
    console.error(`[${name}] ❌ 连接失败:`, err.message);
    if (err.cause) {
      console.error(`[${name}] 根本原因:`, err.cause.message || err.cause);
    }
    try {
      await client.close();
    } catch (e) {
      // 忽略关闭错误
    }
    return false;
  }
}

// 逐一测试所有连接选项
async function runTests() {
  console.log('\n开始MongoDB连接测试...\n');
  
  const results = [];
  
  for (const set of connectionSets) {
    const success = await testConnection(set.name, set.options);
    results.push({ name: set.name, success });
  }
  
  // 输出结果摘要
  console.log('\n===== 测试结果摘要 =====');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  // 找到第一个成功的配置
  const firstSuccess = results.find(r => r.success);
  if (firstSuccess) {
    console.log(`\n推荐使用配置: "${firstSuccess.name}"`);
  } else {
    console.log('\n⚠️ 所有连接配置都失败了。请检查:');
    console.log('1. 确保MongoDB Atlas中已添加你的IP地址到白名单');
    console.log('2. 验证用户名和密码是否正确');
    console.log('3. 检查网络连接是否受限（可能需要使用VPN）');
    console.log('4. 确认MongoDB Atlas集群是否正常运行');
    console.log('5. 考虑降级Node.js版本到LTS版本（v18.x)');
  }
}

// 执行测试
runTests().catch(err => {
  console.error('测试执行失败:', err);
  process.exit(1);
}); 