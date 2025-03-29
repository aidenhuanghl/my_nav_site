require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  console.log("开始测试MongoDB连接...");
  console.log("正在使用连接字符串中的前10个字符（保护隐私）:", process.env.MONGODB_URI?.substring(0, 10) + "...");

  // 不同的连接选项以尝试解决SSL问题
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    directConnection: false,
    serverSelectionTimeoutMS: 5000, // 较短的超时时间用于测试
    tlsInsecure: true // 不建议在生产中使用，这里仅用于测试
  };

  try {
    console.log("正在连接到MongoDB...");
    const client = new MongoClient(process.env.MONGODB_URI, options);
    await client.connect();
    console.log("已成功连接到MongoDB!");
    
    const dbList = await client.db().admin().listDatabases();
    console.log("数据库列表:");
    dbList.databases.forEach(db => console.log(`- ${db.name}`));

    console.log("关闭连接...");
    await client.close();
    console.log("连接已关闭，测试成功完成!");
  } catch (err) {
    console.error("连接错误:", err);
  }
}

main().catch(console.error); 