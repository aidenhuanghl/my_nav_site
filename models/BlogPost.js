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

// 博客文章数据访问对象
class BlogPostDAO {
  constructor(db) {
    this.postsCollection = db.collection(POSTS_COLLECTION);
    this.draftsCollection = db.collection(DRAFTS_COLLECTION);
    this.deletedPostsCollection = db.collection(DELETED_POSTS_COLLECTION);
  }

  // 创建索引
  async createIndexes() {
    await this.postsCollection.createIndex({ title: 1 });
    await this.postsCollection.createIndex({ category: 1 });
    await this.postsCollection.createIndex({ isPopular: 1 });
    await this.postsCollection.createIndex({ createdAt: -1 });
  }

  // 获取所有文章
  async getAllPosts() {
    return this.postsCollection.find({}).sort({ createdAt: -1 }).toArray();
  }

  // 获取单个文章
  async getPostById(id) {
    try {
      console.log('尝试获取文章，ID:', id);
      
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
    return this.postsCollection.find({ isPopular: true }).toArray();
  }

  // 创建新文章
  async createPost(postData) {
    try {
      console.log('创建新文章:', postData.title);
      
      // 创建基本文章对象
      const newPost = createBlogPost(postData);
      
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

  // 增加文章阅读量
  async incrementViewCount(id) {
    const result = await this.postsCollection.updateOne(
      { _id: id },
      { $inc: { views: 1 } }
    );
    return result.modifiedCount > 0;
  }

  // 获取已删除的文章
  async getDeletedPosts() {
    try {
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
    const draft = createDraft(draftData);
    const result = await this.draftsCollection.insertOne(draft);
    return { ...draft, _id: result.insertedId };
  }

  // 获取所有草稿
  async getAllDrafts() {
    return this.draftsCollection.find({}).sort({ savedAt: -1 }).toArray();
  }

  // 删除草稿
  async deleteDraft(id) {
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