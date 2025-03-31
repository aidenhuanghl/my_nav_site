/**
 * 数据库辅助函数
 * 提供便捷访问MongoDB集合和数据模型的函数
 */

const clientPromise = require('./db');
const { UserDAO } = require('./models/User');
const { BlogPostDAO } = require('./models/BlogPost');

// 从环境变量获取数据库名称
const DB_NAME = process.env.MONGODB_DB_NAME || 'ainav_db';
let userDAO = null;
let blogPostDAO = null;

// 导入isUsingLocalStorage和isMongoDBConnected函数
const { isUsingLocalStorage, isMongoDBConnected } = require('./db');

/**
 * 获取指定的MongoDB集合
 * @param {string} collectionName - 集合名称
 * @returns {Promise<Collection>} - MongoDB集合对象
 */
async function getCollection(collectionName) {
  if (isUsingLocalStorage()) {
    console.warn(`getCollection(${collectionName})被调用，但使用的是本地存储模式`);
    return null;
  }
  
  const client = await clientPromise;
  return client.db(DB_NAME).collection(collectionName);
}

/**
 * 获取MongoDB数据库对象
 * @returns {Promise<Db>} - MongoDB数据库对象
 */
async function getDatabase() {
  if (isUsingLocalStorage()) {
    console.warn(`getDatabase()被调用，但使用的是本地存储模式`);
    return null;
  }
  
  const client = await clientPromise;
  return client.db(DB_NAME);
}

/**
 * 获取用户数据访问对象
 * @returns {Promise<UserDAO>} - 用户数据访问对象
 */
async function getUserDAO() {
  if (isUsingLocalStorage()) {
    if (!userDAO) {
      userDAO = new UserDAO('localStorage');
      console.log('使用本地存储模式的UserDAO已初始化');
    }
    return userDAO;
  }
  
  if (!userDAO) {
    const db = await getDatabase();
    userDAO = new UserDAO(db);
    
    // 创建必要的索引
    try {
      await userDAO.createIndexes();
      console.log('用户集合索引已创建');
    } catch (error) {
      console.error('创建用户集合索引失败:', error);
    }
  }
  return userDAO;
}

/**
 * 获取博客文章数据访问对象
 * @returns {Promise<BlogPostDAO>} - 博客文章数据访问对象
 */
async function getBlogPostDAO() {
  if (isUsingLocalStorage()) {
    if (!blogPostDAO) {
      blogPostDAO = new BlogPostDAO('localStorage');
      console.log('使用本地存储模式的BlogPostDAO已初始化');
    }
    return blogPostDAO;
  }
  
  if (!blogPostDAO) {
    const db = await getDatabase();
    blogPostDAO = new BlogPostDAO(db);
    
    // 创建必要的索引
    try {
      await blogPostDAO.createIndexes();
      console.log('博客文章集合索引已创建');
    } catch (error) {
      console.error('创建博客文章集合索引失败:', error);
    }
  }
  return blogPostDAO;
}

module.exports = {
  getCollection,
  getDatabase,
  getUserDAO,
  getBlogPostDAO,
  isUsingLocalStorage,
  isMongoDBConnected
}; 