// 后端API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 通用fetch方法
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  
  return response.json();
}

// 博客文章API
const postsAPI = {
  // 获取所有文章
  getAllPosts: () => fetchAPI('/posts'),
  
  // 获取单个文章
  getPost: (id) => fetchAPI(`/posts/${id}`),
  
  // 创建文章
  createPost: (postData) => fetchAPI('/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  }),
  
  // 更新文章
  updatePost: (id, postData) => fetchAPI(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  }),
  
  // 删除文章
  deletePost: (id) => fetchAPI(`/posts/${id}`, {
    method: 'DELETE'
  }),
  
  // 获取热门文章
  getPopularPosts: () => fetchAPI('/popular-posts')
};

// 草稿API
const draftsAPI = {
  // 获取所有草稿
  getAllDrafts: () => fetchAPI('/drafts'),
  
  // 创建/保存草稿
  saveDraft: (draftData) => fetchAPI('/drafts', {
    method: 'POST',
    body: JSON.stringify(draftData)
  }),
  
  // 删除草稿
  deleteDraft: (id) => fetchAPI(`/drafts/${id}`, {
    method: 'DELETE'
  })
};

// 删除记录API
const deletedPostsAPI = {
  // 获取已删除的文章
  getDeletedPosts: () => fetchAPI('/deleted-posts')
};

// 数据迁移API
const migrationAPI = {
  // 从localStorage导入数据
  importFromLocalStorage: (data) => fetchAPI('/import-local-storage', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// 导出所有API
const API = {
  posts: postsAPI,
  drafts: draftsAPI,
  deletedPosts: deletedPostsAPI,
  migration: migrationAPI
};

module.exports = API; 