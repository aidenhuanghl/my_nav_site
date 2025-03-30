const { MongoClient } = require('mongodb');
const { BlogPostDAO } = require('../models/BlogPost');
const path = require('path');
const fs = require('fs');

// 数据库连接状态
let isConnected = false;
let useLocalFallback = false;
let mongoClient = null;
let blogPostDAO = null;
let localBlogData = {
  posts: [],
  drafts: [],
  deletedPosts: []
};

// 本地数据存储路径
const DATA_DIR = path.join(__dirname, '../data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'local_blog_data.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 加载本地数据（如果存在）
function loadLocalData() {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      localBlogData = JSON.parse(data);
      console.log('从本地文件加载了博客数据');
    } else {
      // 初始化空数据结构
      localBlogData = {
        posts: [],
        drafts: [],
        deletedPosts: []
      };
      saveLocalData(); // 创建初始文件
    }
  } catch (error) {
    console.error('加载本地数据失败:', error);
    // 初始化空数据结构
    localBlogData = {
      posts: [],
      drafts: [],
      deletedPosts: []
    };
  }
}

// 保存本地数据
function saveLocalData() {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(localBlogData, null, 2), 'utf8');
  } catch (error) {
    console.error('保存本地数据失败:', error);
  }
}

// 创建本地存储的DAO模拟对象
function createLocalBlogPostDAO() {
  // 加载本地数据
  loadLocalData();
  
  return {
    // 获取所有文章
    async getAllPosts() {
      return [...localBlogData.posts];
    },
    
    // 获取单个文章
    async getPostById(id) {
      return localBlogData.posts.find(post => post.id === id || post._id === id);
    },
    
    // 获取热门文章
    async getPopularPosts() {
      return localBlogData.posts.filter(post => post.isPopular);
    },
    
    // 创建新文章
    async createPost(postData) {
      const now = new Date();
      const newPost = {
        ...postData,
        id: `local-${Date.now()}`,
        _id: `local-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        viewCount: 0
      };
      
      localBlogData.posts.push(newPost);
      saveLocalData();
      return newPost;
    },
    
    // 更新文章
    async updatePost(id, postData) {
      const index = localBlogData.posts.findIndex(post => post.id === id || post._id === id);
      if (index !== -1) {
        localBlogData.posts[index] = {
          ...localBlogData.posts[index],
          ...postData,
          updatedAt: new Date()
        };
        saveLocalData();
        return true;
      }
      return false;
    },
    
    // 删除文章
    async deletePost(id) {
      const index = localBlogData.posts.findIndex(post => post.id === id || post._id === id);
      if (index !== -1) {
        const deletedPost = localBlogData.posts[index];
        localBlogData.deletedPosts.push({
          title: deletedPost.title,
          deletedAt: new Date()
        });
        localBlogData.posts.splice(index, 1);
        saveLocalData();
        return true;
      }
      return false;
    },
    
    // 增加文章阅读量
    async incrementViewCount(id) {
      const post = localBlogData.posts.find(post => post.id === id || post._id === id);
      if (post) {
        post.viewCount = (post.viewCount || 0) + 1;
        saveLocalData();
        return true;
      }
      return false;
    },
    
    // 获取已删除的文章
    async getDeletedPosts() {
      return [...localBlogData.deletedPosts];
    },
    
    // 保存草稿
    async saveDraft(draftData) {
      const now = new Date();
      const newDraft = {
        ...draftData,
        id: `draft-${Date.now()}`,
        _id: `draft-${Date.now()}`,
        savedAt: now
      };
      
      localBlogData.drafts.push(newDraft);
      saveLocalData();
      return newDraft;
    },
    
    // 获取所有草稿
    async getAllDrafts() {
      return [...localBlogData.drafts];
    },
    
    // 删除草稿
    async deleteDraft(id) {
      const index = localBlogData.drafts.findIndex(draft => draft.id === id || draft._id === id);
      if (index !== -1) {
        localBlogData.drafts.splice(index, 1);
        saveLocalData();
        return true;
      }
      return false;
    },
    
    // 从localStorage导入数据
    async importFromLocalStorage(data) {
      let importedCount = 0;
      
      if (Array.isArray(data.blogPosts)) {
        localBlogData.posts.push(...data.blogPosts);
        importedCount += data.blogPosts.length;
      }
      
      if (Array.isArray(data.userBlogs)) {
        localBlogData.posts.push(...data.userBlogs);
        importedCount += data.userBlogs.length;
      }
      
      if (Array.isArray(data.deletedPosts)) {
        const deletedItems = data.deletedPosts.map(title => ({
          title,
          deletedAt: new Date()
        }));
        localBlogData.deletedPosts.push(...deletedItems);
        importedCount += deletedItems.length;
      }
      
      saveLocalData();
      return { importedCount };
    },
    
    // 删除所有内容
    async deleteAllContent() {
      const deletedPostsCount = localBlogData.posts.length;
      const deletedDraftsCount = localBlogData.drafts.length;
      const deletedRecordsCount = localBlogData.deletedPosts.length;
      
      localBlogData.posts = [];
      localBlogData.drafts = [];
      localBlogData.deletedPosts = [];
      
      saveLocalData();
      
      return {
        deletedPostsCount,
        deletedDraftsCount,
        deletedRecordsCount,
        totalDeleted: deletedPostsCount + deletedDraftsCount + deletedRecordsCount
      };
    },
    
    // 创建索引（本地模式不需要，但添加兼容方法）
    async createIndexes() {
      return true;
    }
  };
}

// 连接到MongoDB
async function connectToMongoDB() {
  if (mongoClient) {
    return mongoClient;
  }
  
  try {
    const mongodbUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'ainav_db';
    
    console.log('连接到MongoDB数据库:', dbName);
    
    // 创建MongoDB客户端
    mongoClient = new MongoClient(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      directConnection: process.env.MONGODB_DIRECT_CONNECTION === 'true'
    });
    
    // 设置连接超时时间（10秒）
    const connectPromise = mongoClient.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('MongoDB连接超时')), 10000)
    );
    
    // 比较连接和超时哪个先完成
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('MongoDB连接成功');
    isConnected = true;
    useLocalFallback = false;
    
    return mongoClient;
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    mongoClient = null;
    isConnected = false;
    useLocalFallback = true;
    
    // 通知应用切换到本地模式
    console.warn('切换到本地存储模式');
    return null;
  }
}

// 获取BlogPostDAO实例
async function getBlogPostDAO() {
  // 如果已经有DAO实例，直接返回
  if (blogPostDAO) {
    return blogPostDAO;
  }
  
  try {
    // 尝试连接MongoDB
    const client = await connectToMongoDB();
    
    // 如果MongoDB连接失败，使用本地存储
    if (!client) {
      console.warn('使用本地文件存储代替MongoDB');
      blogPostDAO = createLocalBlogPostDAO();
      return blogPostDAO;
    }
    
    // 获取数据库实例
    const db = client.db(process.env.MONGODB_DB_NAME || 'ainav_db');
    
    // 创建DAO实例
    blogPostDAO = new BlogPostDAO(db);
    
    // 创建索引
    await blogPostDAO.createIndexes();
    console.log('博客文章集合索引已创建');
    
    return blogPostDAO;
  } catch (error) {
    console.error('获取BlogPostDAO实例失败:', error);
    
    // 出错时切换到本地存储
    console.warn('获取MongoDB DAO失败，切换到本地存储');
    blogPostDAO = createLocalBlogPostDAO();
    return blogPostDAO;
  }
}

// 关闭MongoDB连接
async function closeMongoDBConnection() {
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log('MongoDB连接已关闭');
    } catch (error) {
      console.error('关闭MongoDB连接时出错:', error);
    } finally {
      mongoClient = null;
      isConnected = false;
    }
  }
}

// 检查MongoDB连接状态
function isMongoDBConnected() {
  return isConnected;
}

// 检查是否使用本地存储模式
function isUsingLocalStorage() {
  return useLocalFallback;
}

module.exports = {
  connectToMongoDB,
  getBlogPostDAO,
  closeMongoDBConnection,
  isMongoDBConnected,
  isUsingLocalStorage
}; 