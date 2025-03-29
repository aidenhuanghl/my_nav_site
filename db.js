const { MongoClient } = require('mongodb');

// 从环境变量中读取连接字符串
const uri = process.env.MONGODB_URI;

let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("请在环境变量中设置 MONGODB_URI");
}

// 创建MongoDB客户端配置
const options = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10
};

// 在开发模式下使用全局变量缓存客户端连接
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    console.log("创建新的MongoDB客户端实例（开发模式）");
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log("MongoDB连接成功");
        return client;
      })
      .catch(err => {
        console.error("MongoDB连接失败:", err.message);
        if (err.cause) {
          console.error("根本原因:", err.cause.message || err.cause);
        }
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 在生产模式下，每次都创建新的 MongoClient 实例
  console.log("创建新的MongoDB客户端实例（生产模式）");
  const client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log("MongoDB连接成功");
      return client;
    })
    .catch(err => {
      console.error("MongoDB连接失败:", err.message);
      if (err.cause) {
        console.error("根本原因:", err.cause.message || err.cause);
      }
      throw err;
    });
}

module.exports = clientPromise; 