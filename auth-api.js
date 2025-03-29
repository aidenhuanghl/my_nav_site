/**
 * 认证API客户端
 * 提供与后端API交互的方法，替代之前基于localStorage的实现
 */

// API基础URL
const API_BASE_URL = '/api';

// 存储令牌和用户信息的localStorage键
const TOKEN_KEY = 'ai_nav_auth_token';
const USER_KEY = 'ai_nav_current_user';

/**
 * 发送API请求
 * @param {string} endpoint - API端点
 * @param {Object} options - 请求选项
 * @returns {Promise<any>} - 响应数据
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 默认请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // 如果有认证令牌，添加到请求头
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 发送请求
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // 解析响应
  const data = await response.json();
  
  // 如果响应不成功，抛出错误
  if (!response.ok) {
    const error = new Error(data.error || '请求失败');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} email - 邮箱
 * @returns {Promise<Object>} - 包含用户信息和令牌的对象
 */
async function register(username, password, email) {
  const data = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email })
  });
  
  // 保存令牌和用户信息
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  
  return data;
}

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<Object>} - 包含用户信息和令牌的对象
 */
async function login(username, password) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  // 保存令牌和用户信息
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  
  return data;
}

/**
 * 用户登出
 * @returns {Promise<void>}
 */
async function logout() {
  // 清除本地存储
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  return Promise.resolve();
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object|null>} - 用户信息对象，如果未登录则为null
 */
async function getCurrentUser() {
  try {
    // 先检查本地存储
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) {
      return null;
    }
    
    // 从API获取最新用户信息
    const data = await apiRequest('/me');
    
    // 更新本地存储
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    
    return data;
  } catch (error) {
    // 如果API请求失败（可能是令牌过期），清除本地存储
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return null;
  }
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * 更新用户设置
 * @param {Object} settings - 用户设置
 * @returns {Promise<Object>} - 更新后的设置
 */
async function updateUserSettings(settings) {
  const data = await apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings })
  });
  
  // 更新本地用户信息
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      user.settings = settings;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('更新本地用户设置失败', e);
  }
  
  return data;
}

/**
 * 获取保存的链接
 * @returns {Promise<Array>} - 链接数组
 */
async function getSavedLinks() {
  return apiRequest('/links');
}

/**
 * 保存链接
 * @param {Object} link - 链接对象
 * @returns {Promise<Array>} - 更新后的链接数组
 */
async function saveLink(link) {
  return apiRequest('/links', {
    method: 'POST',
    body: JSON.stringify(link)
  });
}

/**
 * 删除链接
 * @param {string} linkId - 链接ID
 * @returns {Promise<Array>} - 更新后的链接数组
 */
async function deleteLink(linkId) {
  return apiRequest(`/links/${linkId}`, {
    method: 'DELETE'
  });
}

// 导出API
const authAPI = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  updateUserSettings,
  getSavedLinks,
  saveLink,
  deleteLink
};

window.authAPI = authAPI; 