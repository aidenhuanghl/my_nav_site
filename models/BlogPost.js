/**
 * 博客文章数据模型
 * 定义博客文章在MongoDB中的数据结构
 */

// 文章集合名称
const POSTS_COLLECTION = 'posts';
const DRAFTS_COLLECTION = 'drafts';
const DELETED_POSTS_COLLECTION = 'deleted_posts';

// 创建博客文章对象
function createBlogPost(postData) {
  return {
    title: postData.title,
    content: postData.content,
    category: postData.category || '未分类',
    tags: postData.tags || [],
    imageData: postData.imageData || '',
    isPopular: postData.isPopular || false,
    views: postData.views || 0,
    createdAt: postData.createdAt || new Date(),
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
    return this.postsCollection.findOne({ _id: id });
  }

  // 获取热门文章
  async getPopularPosts() {
    return this.postsCollection.find({ isPopular: true }).toArray();
  }

  // 创建新文章
  async createPost(postData) {
    const newPost = createBlogPost(postData);
    const result = await this.postsCollection.insertOne(newPost);
    return { ...newPost, _id: result.insertedId };
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
    return this.deletedPostsCollection.find({}).sort({ deletedAt: -1 }).toArray();
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
}

module.exports = { BlogPostDAO, createBlogPost, createDraft }; 