/**
 * 数据库辅助函数
 * 提供便捷访问MongoDB集合和数据模型的函数
 */

const clientPromise = require('./db');
const { UserDAO } = require('./models/User');

// 数据库名称
const DB_NAME = 'ainav_db';
let userDAO = null;

/**
 * 获取指定的MongoDB集合
 * @param {string} collectionName - 集合名称
 * @returns {Promise<Collection>} - MongoDB集合对象
 */
async function getCollection(collectionName) {
  const client = await clientPromise;
  return client.db(DB_NAME).collection(collectionName);
}

/**
 * 获取MongoDB数据库对象
 * @returns {Promise<Db>} - MongoDB数据库对象
 */
async function getDatabase() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

/**
 * 获取用户数据访问对象
 * @returns {Promise<UserDAO>} - 用户数据访问对象
 */
async function getUserDAO() {
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

module.exports = {
  getCollection,
  getDatabase,
  getUserDAO
}; 