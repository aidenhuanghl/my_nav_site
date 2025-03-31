const { ObjectId } = require('mongodb');

/**
 * 博客文章数据模型
 * 定义博客文章在MongoDB中的数据结构
 */

// 文章集合名称
const POSTS_COLLECTION = 'posts';
const DRAFTS_COLLECTION = 'drafts';
const DELETED_POSTS_COLLECTION = 'deleted_posts';

// 创建博客文章对象
function createBlogPost(data) {
  // 转换标签数组
  let tags = [];
  if (data.tags) {
    tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(tag => tag.trim());
  }

  // 创建博客文章
  return {
    title: data.title || '无标题',
    content: data.content || '',
    category: data.category || '未分类',
    tags: tags,
    author: data.author || '网站作者',
    imageData: data.imageData || null,
    isPopular: data.isPopular || false,
    viewCount: data.viewCount || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 创建草稿对象
function createDraft(draftData) {
  return {
    title: draftData.title || '',
    content: draftData.content || '',
    category: draftData.category || '未分类',
    tags: draftData.tags || [],
    imageData: draftData.imageData || '',
    savedAt: new Date()
  };
}

// 获取本地存储数据
function getLocalStorage(key, defaultValue = []) {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  }
  
  // 在服务器端环境中，我们使用一个内存存储
  if (!global._localStorageData) {
    global._localStorageData = {};
  }
  
  return global._localStorageData[key] || defaultValue;
}

// 设置本地存储数据
function setLocalStorage(key, data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    // 在服务器端环境中，我们使用一个内存存储
    if (!global._localStorageData) {
      global._localStorageData = {};
    }
    
    global._localStorageData[key] = data;
  }
}

// 博客文章数据访问对象
class BlogPostDAO {
  constructor(db) {
    this.postsCollection = db ? db.collection(POSTS_COLLECTION) : null;
    this.draftsCollection = db ? db.collection(DRAFTS_COLLECTION) : null;
    this.deletedPostsCollection = db ? db.collection(DELETED_POSTS_COLLECTION) : null;
    
    // 检查是否需要使用localStorage模式
    this.useLocalStorage = !db || db === 'localStorage';
    console.log(`BlogPostDAO初始化，使用本地存储: ${this.useLocalStorage}`);
    
    // 如果使用本地存储，初始化数据
    if (this.useLocalStorage) {
      // 确保在服务器端有数据结构
      if (typeof window === 'undefined') {
        if (!global._localStorageData) {
          global._localStorageData = {
            'blogPosts': [],
            'drafts': [],
            'deletedPosts': []
          };
        }
      }
    }
  }

  // 创建索引（本地存储模式不需要）
  async createIndexes() {
    if (this.useLocalStorage) return;
    
    await this.postsCollection.createIndex({ title: 1 });
    await this.postsCollection.createIndex({ category: 1 });
    await this.postsCollection.createIndex({ isPopular: 1 });
    await this.postsCollection.createIndex({ createdAt: -1 });
  }

  // 获取所有文章
  async getAllPosts() {
    if (this.useLocalStorage) {
      return getLocalStorage('blogPosts', []);
    }
    
    return this.postsCollection.find({}).sort({ createdAt: -1 }).toArray();
  }

  // 获取单个文章
  async getPostById(id) {
    try {
      console.log('尝试获取文章，ID:', id);
      
      if (this.useLocalStorage) {
        const posts = getLocalStorage('blogPosts', []);
        let post = null;
        
        // 尝试用字符串ID查找
        if (typeof id === 'string') {
          post = posts.find(p => p.id === id);
        }
        
        // 如果没找到并且id是ObjectId，则转为字符串再找
        if (!post && id instanceof ObjectId) {
          const idStr = id.toString();
          post = posts.find(p => p.id === idStr);
        }
        
        if (post) {
          post.id = post._id ? post._id.toString() : post.id;
        }
        
        return post;
      }
      
      // 尝试将ID转换为ObjectId，如果不是有效的ObjectId则直接使用原始ID
      let postId;
      let idIsObjectId = false;
      
      try {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          postId = new ObjectId(id);
          idIsObjectId = true;
          console.log('ID是有效的ObjectId，已转换');
        } else {
          console.log('ID不是有效的ObjectId，使用原始ID:', id);
          postId = id;
        }
      } catch (err) {
        console.warn('ID转换错误:', err.message);
        postId = id;
      }
      
      // 构建查询条件
      const query = { $or: [] };
      
      // 添加_id查询条件（如果ID是有效的ObjectId）
      if (idIsObjectId) {
        query.$or.push({ _id: postId });
      }
      
      // 添加id查询条件（字符串ID）
      if (typeof id === 'string') {
        query.$or.push({ id: id });
      }
      
      // 如果没有有效的查询条件，返回null
      if (query.$or.length === 0) {
        console.warn('没有有效的查询条件');
        return null;
      }
      
      console.log('查询条件:', JSON.stringify(query));
      
      // 查找文章
      const post = await this.postsCollection.findOne(query);
      
      if (!post) {
        console.warn('未找到文章');
        return null;
      }
      
      // 确保结果同时包含id和_id
      const result = { ...post };
      
      // 如果只有_id没有id，为结果添加id字段（字符串格式）
      if (result._id && !result.id) {
        result.id = result._id.toString();
      }
      
      console.log('成功获取文章:', result.title, 'ID:', result.id);
      return result;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      return null;
    }
  }

  // 获取热门文章
  async getPopularPosts() {
    if (this.useLocalStorage) {
      const posts = getLocalStorage('blogPosts', []);
      return posts.filter(post => post.isPopular);
    }
    
    return this.postsCollection.find({ isPopular: true }).toArray();
  }

  // 创建新文章
  async createPost(postData) {
    try {
      console.log('创建新文章:', postData.title);
      
      // 创建基本文章对象
      const newPost = createBlogPost(postData);
      
      if (this.useLocalStorage) {
        // 生成一个模拟的ObjectId
        const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
        const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
        const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        const objectId = `${timestamp}${machineId}${processId}${counter}`;
        
        newPost._id = objectId;
        newPost.id = objectId;
        
        // 更新本地存储
        const posts = getLocalStorage('blogPosts', []);
        posts.push(newPost);
        setLocalStorage('blogPosts', posts);
        
        return newPost;
      }
      
      // 添加MongoDB ID作为字符串id字段
      const insertResult = await this.postsCollection.insertOne(newPost);
      const objectId = insertResult.insertedId;
      const stringId = objectId.toString();
      
      // 更新文档，添加字符串id字段
      await this.postsCollection.updateOne(
        { _id: objectId },
        { $set: { id: stringId } }
      );
      
      // 获取完整的文章对象（包含id和_id）
      const completePost = await this.getPostById(objectId);
      
      console.log('文章创建成功, ID:', stringId);
      return completePost;
    } catch (error) {
      console.error('创建文章失败:', error);
      throw error;
    }
  }

  // 更新文章
  async updatePost(id, postData) {
    if (this.useLocalStorage) {
      const posts = getLocalStorage('blogPosts', []);
      const index = posts.findIndex(post => post.id === id.toString());
      
      if (index === -1) return false;
      
      // 更新文章
      posts[index] = {
        ...posts[index],
        ...postData,
        updatedAt: new Date()
      };
      
      setLocalStorage('blogPosts', posts);
      return true;
    }
    
    const updateData = {
      ...postData,
      updatedAt: new Date()
    };
    
    const result = await this.postsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  }

  // 删除文章
  async deletePost(id) {
    if (this.useLocalStorage) {
      // 从本地存储获取文章
      const posts = getLocalStorage('blogPosts', []);
      const index = posts.findIndex(post => post.id === id.toString());
      
      if (index === -1) return false;
      
      // 保存到已删除集合
      const deletedPosts = getLocalStorage('deletedPosts', []);
      deletedPosts.push({
        title: posts[index].title,
        deletedAt: new Date()
      });
      setLocalStorage('deletedPosts', deletedPosts);
      
      // 从文章集合中删除
      posts.splice(index, 1);
      setLocalStorage('blogPosts', posts);
      
      return true;
    }
    
    // 先获取文章信息，用于存储到已删除集合
    const post = await this.getPostById(id);
    if (post) {
      // 保存到已删除集合
      await this.deletedPostsCollection.insertOne({
        title: post.title,
        deletedAt: new Date()
      });
      
      // 从文章集合中删除
      const result = await this.postsCollection.deleteOne({ _id: id });
      return result.deletedCount > 0;
    }
    return false;
  }

  // 通过字符串ID删除文章
  async deletePostByStringId(stringId) {
    try {
      console.log('通过字符串ID删除文章:', stringId);
      
      if (this.useLocalStorage) {
        // 从本地存储获取文章
        const posts = getLocalStorage('blogPosts', []);
        const index = posts.findIndex(post => post.id === stringId);
        
        if (index === -1) return false;
        
        // 保存到已删除集合
        const deletedPosts = getLocalStorage('deletedPosts', []);
        deletedPosts.push({
          title: posts[index].title,
          deletedAt: new Date()
        });
        setLocalStorage('deletedPosts', deletedPosts);
        
        // 从文章集合中删除
        posts.splice(index, 1);
        setLocalStorage('blogPosts', posts);
        
        return true;
      }
      
      // 先获取文章信息，用于存储到已删除集合
      console.log('使用id字段查询文章:', stringId);
      const post = await this.postsCollection.findOne({ id: stringId });
      
      if (!post) {
        console.warn('未找到匹配字符串ID的文章:', stringId);
        return false;
      }
      
      console.log('找到匹配字符串ID的文章:', post.title);
      
      // 保存到已删除集合
      await this.deletedPostsCollection.insertOne({
        title: post.title,
        deletedAt: new Date()
      });
      
      // 从文章集合中删除
      const result = await this.postsCollection.deleteOne({ id: stringId });
      console.log('删除结果:', result.deletedCount > 0 ? '成功' : '失败');
      return result.deletedCount > 0;
    } catch (error) {
      console.error('通过字符串ID删除文章失败:', error);
      return false;
    }
  }

  // 增加文章阅读量
  async incrementViewCount(id) {
    if (this.useLocalStorage) {
      const posts = getLocalStorage('blogPosts', []);
      const index = posts.findIndex(post => post.id === id.toString());
      
      if (index === -1) return false;
      
      // 增加阅读量
      posts[index].viewCount = (posts[index].viewCount || 0) + 1;
      setLocalStorage('blogPosts', posts);
      
      return true;
    }
    
    const result = await this.postsCollection.updateOne(
      { _id: id },
      { $inc: { views: 1 } }
    );
    return result.modifiedCount > 0;
  }

  // 获取已删除的文章
  async getDeletedPosts() {
    try {
        if (this.useLocalStorage) {
          return getLocalStorage('deletedPosts', []);
        }
        
        const deletedPosts = await this.deletedPostsCollection
            .find({})
            .sort({ deletedAt: -1 })
            .toArray();
        return deletedPosts || [];
    } catch (error) {
        console.error('获取已删除文章失败:', error);
        throw error;
    }
  }

  // 保存草稿
  async saveDraft(draftData) {
    if (this.useLocalStorage) {
      const draft = createDraft(draftData);
      
      // 生成一个模拟的ObjectId
      const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
      const random = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
      const objectId = `${timestamp}${random}`;
      
      draft._id = objectId;
      
      // 更新本地存储
      const drafts = getLocalStorage('drafts', []);
      drafts.push(draft);
      setLocalStorage('drafts', drafts);
      
      return draft;
    }
    
    const draft = createDraft(draftData);
    const result = await this.draftsCollection.insertOne(draft);
    return { ...draft, _id: result.insertedId };
  }

  // 获取所有草稿
  async getAllDrafts() {
    if (this.useLocalStorage) {
      return getLocalStorage('drafts', []);
    }
    
    return this.draftsCollection.find({}).sort({ savedAt: -1 }).toArray();
  }

  // 删除草稿
  async deleteDraft(id) {
    if (this.useLocalStorage) {
      const drafts = getLocalStorage('drafts', []);
      const index = drafts.findIndex(draft => draft._id === id.toString());
      
      if (index === -1) return false;
      
      // 从草稿集合中删除
      drafts.splice(index, 1);
      setLocalStorage('drafts', drafts);
      
      return true;
    }
    
    const result = await this.draftsCollection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // 从localStorage导入数据
  async importFromLocalStorage(data) {
    const { blogPosts, userBlogs, deletedPosts } = data;
    let importedCount = 0;

    // 导入博客文章
    if (Array.isArray(blogPosts) && blogPosts.length > 0) {
      const posts = blogPosts.map(post => createBlogPost(post));
      const result = await this.postsCollection.insertMany(posts);
      importedCount += result.insertedCount;
    }

    // 导入用户博客（可能与blogPosts有不同的结构）
    if (Array.isArray(userBlogs) && userBlogs.length > 0) {
      const posts = userBlogs.map(post => createBlogPost(post));
      const result = await this.postsCollection.insertMany(posts);
      importedCount += result.insertedCount;
    }

    // 导入已删除的文章标题
    if (Array.isArray(deletedPosts) && deletedPosts.length > 0) {
      const deletedItems = deletedPosts.map(title => ({
        title,
        deletedAt: new Date()
      }));
      const result = await this.deletedPostsCollection.insertMany(deletedItems);
      importedCount += result.insertedCount;
    }

    return { importedCount };
  }

  // 删除所有文章、草稿和删除记录
  async deleteAllContent() {
    try {
      // 删除所有文章并记录数量
      const postsResult = await this.postsCollection.deleteMany({});
      const deletedPostsCount = postsResult.deletedCount || 0;
      
      // 删除所有草稿并记录数量
      const draftsResult = await this.draftsCollection.deleteMany({});
      const deletedDraftsCount = draftsResult.deletedCount || 0;
      
      // 删除所有删除记录并记录数量
      const deletedRecordsResult = await this.deletedPostsCollection.deleteMany({});
      const deletedRecordsCount = deletedRecordsResult.deletedCount || 0;
      
      // 返回删除的总数
      return {
        deletedPostsCount,
        deletedDraftsCount,
        deletedRecordsCount,
        totalDeleted: deletedPostsCount + deletedDraftsCount + deletedRecordsCount
      };
    } catch (error) {
      console.error('删除所有内容失败:', error);
      throw error;
    }
  }
}

module.exports = { BlogPostDAO, createBlogPost, createDraft }; 