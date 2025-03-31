// 导入 MongoDB Node.js 驱动的 MongoClient 类
const { MongoClient } = require('mongodb');

// --- 配置MongoDB连接参数 ---
// 从环境变量中读取 MongoDB 连接字符串 (URI)
const uri = process.env.MONGODB_URI;
// 打印连接字符串（安全版本，隐藏密码）
if (uri) {
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:***@');
  console.log('MongoDB连接字符串:', safeUri);
} else {
  console.log('MongoDB连接字符串未设置');
}

// 从环境变量中读取数据库名称，如果未设置，则默认为 'ainav_db'
const dbName = process.env.MONGODB_DB_NAME || 'ainav_db';
// 从环境变量中读取是否使用直接连接模式，转换为布尔值
const directConnection = process.env.MONGODB_DIRECT_CONNECTION === 'true';
// 从环境变量中读取副本集的名称（如果使用）
const replicaSet = process.env.MONGODB_REPLICA_SET;

// 声明一个变量用于存储 MongoClient 连接的 Promise
let clientPromise;
// 添加一个标志，表示我们是否使用本地存储模式
let usingLocalStorage = false;

// --- 检查环境变量 ---
// 检查 MONGODB_URI 是否已设置，如果未设置则切换到本地存储模式
if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI 未设置，将使用本地存储模式");
  usingLocalStorage = true;
  
  // 创建一个模拟的客户端 Promise，但实际上不连接到 MongoDB
  clientPromise = Promise.resolve({
    db: () => ({
      // 这是一个模拟的数据库对象，不会实际连接到 MongoDB
      collection: () => ({
        // 在这里我们可以实现一些模拟方法，但实际上我们将使用单独的 localStorage 数据模型
      })
    })
  });
} else {
  // --- 配置 MongoDB 连接选项 ---
  // 创建 MongoDB 客户端的连接选项对象
  const options = {
    // 设置服务器选择超时时间为 5000 毫秒 (5 秒)
    serverSelectionTimeoutMS: 5000,
    // 设置连接池的最大连接数为 10
    maxPoolSize: 10
    // 注意: useUnifiedTopology 和 useNewUrlParser 选项在较新的驱动版本中已弃用，无需设置
  };

  // 如果环境变量中设置了副本集名称，则添加到连接选项中
  if (replicaSet) {
    options.replicaSet = replicaSet;
    console.log(`使用副本集: ${replicaSet}`);
  }

  // 如果环境变量中明确设置了 directConnection，则添加到连接选项中
  // directConnection 通常用于连接单个 MongoDB 实例，而不是副本集或分片集群
  if (directConnection !== undefined) {
    options.directConnection = directConnection;
    console.log(`直接连接模式: ${directConnection}`);
  }

  // --- 创建和管理 MongoClient 连接 ---
  // 根据运行环境（开发或生产）采用不同的连接策略
  if (process.env.NODE_ENV === 'development') {
    // 在开发模式下，尝试重用全局缓存的连接 Promise
    // 这是为了避免在热重载（如使用 nodemon）时创建过多的数据库连接
    if (!global._mongoClientPromise) {
      // 如果全局缓存不存在，则创建新的 MongoClient 实例并连接
      console.log("创建新的MongoDB客户端实例（开发模式）");
      console.log(`连接到数据库: ${dbName}`);
      
      try {
        // 创建 MongoClient 实例
        const client = new MongoClient(uri, options);
        // 连接到 MongoDB 并将返回的 Promise 存储在全局变量中
        global._mongoClientPromise = client.connect()
          .then(client => {
            // 连接成功的回调
            console.log(`MongoDB Atlas 连接成功，数据库: ${dbName}`);
            // 返回连接成功的 client 对象
            return client;
          })
          .catch(err => {
            // 连接失败的回调
            console.error("MongoDB连接失败:", err.message);
            // 如果错误包含根本原因，也打印出来
            if (err.cause) {
              console.error("根本原因:", err.cause.message || err.cause);
            }
            
            // 如果连接失败，切换到本地存储模式
            console.warn("切换到本地存储模式");
            usingLocalStorage = true;
            
            // 返回一个模拟的客户端对象
            return {
              db: () => ({
                collection: () => ({})
              })
            };
          });
      } catch (error) {
        console.error("创建MongoDB客户端时出错:", error);
        usingLocalStorage = true;
        global._mongoClientPromise = Promise.resolve({
          db: () => ({
            collection: () => ({})
          })
        });
      }
    }
    // 将全局缓存的 Promise 赋值给 clientPromise
    clientPromise = global._mongoClientPromise;
  } else {
    // 在生产模式下，每次应用启动时都创建新的 MongoClient 实例
    // 这种方式更符合无服务器环境或容器化部署的最佳实践
    console.log("创建新的MongoDB客户端实例（生产模式）");
    console.log(`连接到数据库: ${dbName}`);
    
    try {
      // 创建 MongoClient 实例
      const client = new MongoClient(uri, options);
      // 连接到 MongoDB 并将返回的 Promise 赋值给 clientPromise
      clientPromise = client.connect()
        .then(client => {
          // 连接成功的回调
          console.log(`MongoDB Atlas 连接成功，数据库: ${dbName}`);
          // 返回连接成功的 client 对象
          return client;
        })
        .catch(err => {
          // 连接失败的回调
          console.error("MongoDB连接失败:", err.message);
          // 如果错误包含根本原因，也打印出来
          if (err.cause) {
            console.error("根本原因:", err.cause.message || err.cause);
          }
          
          // 如果连接失败，切换到本地存储模式
          console.warn("切换到本地存储模式");
          usingLocalStorage = true;
          
          // 返回一个模拟的客户端对象
          return {
            db: () => ({
              collection: () => ({})
            })
          };
        });
    } catch (error) {
      console.error("创建MongoDB客户端时出错:", error);
      usingLocalStorage = true;
      clientPromise = Promise.resolve({
        db: () => ({
          collection: () => ({})
        })
      });
    }
  }
}

// 添加函数来检查我们是否在使用本地存储模式
function isUsingLocalStorage() {
  return usingLocalStorage;
}

// 添加函数来检查MongoDB是否已连接
function isMongoDBConnected() {
  return !usingLocalStorage;
}

// --- 导出连接 Promise 和辅助函数 ---
module.exports = clientPromise;
module.exports.isUsingLocalStorage = isUsingLocalStorage;
module.exports.isMongoDBConnected = isMongoDBConnected; 