/**
 * 博客API服务
 * 提供与博客相关的所有API请求
 */

const API_BASE_URL = '/api';

/**
 * 检查API连接状态
 * 返回服务器和数据库的连接状态信息
 */
async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) {
      throw new Error(`状态检查失败: ${response.status}`);
    }
    const data = await response.json();
    return {
      isConnected: data.isConnected,
      usingLocalStorage: data.usingLocalStorage,
      serverTime: data.serverTime,
      apiAvailable: true
    };
  } catch (error) {
    console.error('API状态检查失败:', error);
    return {
      isConnected: false,
      usingLocalStorage: false,
      apiAvailable: false,
      error: error.message
    };
  }
}

/**
 * 获取所有博客文章
 */
async function getPosts() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `获取文章失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
}

/**
 * 获取单篇博客文章详情
 * @param {string} id 文章ID
 */
async function getPost(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `获取文章详情失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`获取文章(ID: ${id})详情失败:`, error);
    throw error;
  }
}

/**
 * 创建新博客文章
 * @param {Object} postData 文章数据
 */
async function createPost(postData) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `创建文章失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建文章失败:', error);
    throw error;
  }
}

/**
 * 更新博客文章
 * @param {string} id 文章ID
 * @param {Object} postData 更新的文章数据
 */
async function updatePost(id, postData) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `更新文章失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`更新文章(ID: ${id})失败:`, error);
    throw error;
  }
}

/**
 * 删除博客文章
 * @param {string} id 文章ID
 */
async function deletePost(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `删除文章失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`删除文章(ID: ${id})失败:`, error);
    throw error;
  }
}

/**
 * 上传图片
 * @param {File} imageFile 图片文件
 * @returns {Promise<string>} 图片URL
 */
async function uploadImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `上传图片失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
}

/**
 * 从localStorage导入数据到数据库
 * @param {Object} data 要导入的数据
 */
async function importFromLocalStorage(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/import-from-localstorage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `导入数据失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('从localStorage导入数据失败:', error);
    throw error;
  }
}

/**
 * 获取已删除的文章列表
 */
async function getDeletedPosts() {
  try {
    const response = await fetch(`${API_BASE_URL}/deleted-posts`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `获取已删除文章失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取已删除文章列表失败:', error);
    throw error;
  }
}

/**
 * 删除所有内容
 */
async function deleteAllContent() {
  try {
    const response = await fetch(`${API_BASE_URL}/all-content`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `删除所有内容失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('删除所有内容失败:', error);
    throw error;
  }
}

// 导出所有API函数
window.BlogAPI = {
  checkApiStatus,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadImage,
  importFromLocalStorage,
  getDeletedPosts,
  deleteAllContent
}; 