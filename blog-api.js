// 后端API基础URL - 默认为本地开发环境，可通过setBaseURL方法修改
let API_BASE_URL = 'http://localhost:3000/api';

// 博客API类
class BlogAPI {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }
  
  // 设置API基础URL的方法
  setBaseURL(url) {
    if (url && typeof url === 'string') {
      this.baseURL = url;
      console.log(`API基础URL已更新为: ${url}`);
      return true;
    }
    console.error('无效的URL格式');
    return false;
  }
  
  // 获取当前API基础URL
  getBaseURL() {
    return this.baseURL;
  }
  
  // 通用fetch方法
  async fetchAPI(endpoint, options = {}) {
    try {
      // 显示连接提示
      console.log(`正在连接API: ${this.baseURL}${endpoint}`);
      
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
      // 提供更多错误细节，方便调试
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('网络连接错误，请检查API服务器是否运行或网络连接是否正常');
      }
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
  
  // 测试API连接
  async testConnection() {
    try {
      const start = Date.now();
      await fetch(`${this.baseURL}/posts`, {
        method: 'HEAD'
      });
      const end = Date.now();
      return {
        connected: true,
        latency: end - start,
        message: '连接成功'
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        message: '连接失败'
      };
    }
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

// 创建默认API实例
const api = new BlogAPI();

// 在全局对象中设置API实例，以便在页面中访问
if (typeof window !== 'undefined') {
  window.blogAPI = api;
  
  // 监听DOM加载完成事件，检测API服务器可用性
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // 测试API连接，最多重试3次
      let connected = false;
      let attempts = 0;
      
      while (!connected && attempts < 3) {
        attempts++;
        console.log(`尝试连接API服务器(${attempts}/3)...`);
        
        const result = await api.testConnection();
        if (result.connected) {
          console.log(`API服务器连接成功！延迟: ${result.latency}ms`);
          connected = true;
        } else {
          console.warn(`API服务器连接失败: ${result.error}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
        }
      }
      
      if (!connected) {
        console.error('无法连接到API服务器，请检查服务器是否运行');
      }
    } catch (error) {
      console.error('API连接测试失败:', error);
    }
  });
}

// 兼容CommonJS和ES模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} 