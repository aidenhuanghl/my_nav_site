// 后端API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 博客API类
class BlogAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  
  // 通用fetch方法
  async fetchAPI(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }
  
  // 获取所有博客文章
  async getAllPosts() {
    return this.fetchAPI('/posts');
  }
  
  // 获取单个博客文章
  async getPost(id) {
    return this.fetchAPI(`/posts/${id}`);
  }
  
  // 创建新博客文章
  async createPost(postData) {
    return this.fetchAPI('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }
  
  // 更新博客文章
  async updatePost(id, postData) {
    return this.fetchAPI(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  }
  
  // 删除博客文章
  async deletePost(id) {
    return this.fetchAPI(`/posts/${id}`, {
      method: 'DELETE'
    });
  }
  
  // 获取热门文章
  async getPopularPosts() {
    return this.fetchAPI('/popular-posts');
  }
  
  // 存储草稿
  async saveDraft(draftData) {
    return this.fetchAPI('/drafts', {
      method: 'POST',
      body: JSON.stringify(draftData)
    });
  }
  
  // 获取所有草稿
  async getAllDrafts() {
    return this.fetchAPI('/drafts');
  }
  
  // 删除草稿
  async deleteDraft(id) {
    return this.fetchAPI(`/drafts/${id}`, {
      method: 'DELETE'
    });
  }
  
  // 获取已删除的文章标题列表
  async getDeletedPosts() {
    return this.fetchAPI('/deleted-posts');
  }
  
  // 从localStorage导入数据到MongoDB
  async importFromLocalStorage() {
    // 从localStorage获取数据
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
    const deletedPosts = JSON.parse(localStorage.getItem('deletedPopularPosts') || '[]');
    
    return this.fetchAPI('/import-local-storage', {
      method: 'POST',
      body: JSON.stringify({
        blogPosts,
        userBlogs,
        deletedPosts
      })
    });
  }
}

// 导出API实例
const api = new BlogAPI();
// 兼容CommonJS和ES模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  window.blogAPI = api;
} 