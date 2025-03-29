/**
 * 用户数据模型
 * 定义用户在MongoDB中的数据结构
 */

// 用户集合名称
const COLLECTION_NAME = 'users';

// 创建用户对象
function createUser(userData) {
  return {
    username: userData.username,
    email: userData.email,
    password: userData.password, // 实际应用中应存储加密后的密码哈希
    createdAt: new Date(),
    lastLogin: new Date(),
    settings: userData.settings || {
      theme: 'light',
      cardOrder: {},
      colorTheme: 'default',
      density: 'normal'
    },
    savedLinks: userData.savedLinks || []
  };
}

// 用户数据访问对象
class UserDAO {
  constructor(db) {
    this.collection = db.collection(COLLECTION_NAME);
  }

  // 创建索引以确保用户名唯一
  async createIndexes() {
    await this.collection.createIndex({ username: 1 }, { unique: true });
    await this.collection.createIndex({ email: 1 });
  }

  // 根据用户名查找用户
  async findByUsername(username) {
    return this.collection.findOne({ username });
  }

  // 根据邮箱查找用户
  async findByEmail(email) {
    return this.collection.findOne({ email });
  }

  // 创建新用户
  async create(userData) {
    const newUser = createUser(userData);
    await this.collection.insertOne(newUser);
    return newUser;
  }

  // 更新用户信息
  async updateById(id, updateData) {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // 更新用户名
  async updateByUsername(username, updateData) {
    const result = await this.collection.updateOne(
      { username },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // 更新用户设置
  async updateSettings(username, settings) {
    const result = await this.collection.updateOne(
      { username },
      { $set: { settings, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // 添加保存的链接
  async addSavedLink(username, link) {
    // 检查链接是否已存在
    const existingUser = await this.findByUsername(username);
    const savedLinks = existingUser.savedLinks || [];
    const existingLinkIndex = savedLinks.findIndex(l => l.url === link.url);
    
    if (existingLinkIndex !== -1) {
      // 更新现有链接
      savedLinks[existingLinkIndex] = { 
        ...link, 
        updatedAt: new Date() 
      };
      
      const result = await this.collection.updateOne(
        { username },
        { $set: { savedLinks, updatedAt: new Date() } }
      );
      return result.modifiedCount > 0;
    } else {
      // 添加新链接
      const newLink = {
        ...link,
        id: new Date().getTime().toString(),
        createdAt: new Date()
      };
      
      const result = await this.collection.updateOne(
        { username },
        { 
          $push: { savedLinks: newLink },
          $set: { updatedAt: new Date() }
        }
      );
      return result.modifiedCount > 0;
    }
  }

  // 删除保存的链接
  async removeSavedLink(username, linkId) {
    const result = await this.collection.updateOne(
      { username },
      { 
        $pull: { savedLinks: { id: linkId } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  // 更新登录时间
  async updateLoginTime(username) {
    const result = await this.collection.updateOne(
      { username },
      { $set: { lastLogin: new Date() } }
    );
    return result.modifiedCount > 0;
  }
}

module.exports = { UserDAO, createUser }; 