// auth.js - 临时基于localStorage的认证模块替换为基于API的实现
// 这是一个兼容层，保持接口一致性，内部调用auth-api.js

// // 导入API模块 - 不再需要在此处声明全局 const
// // 注意：由于ES模块问题，我们直接创建一个临时全局变量来保存API实例
// // 在实际模块化环境中，应使用import导入
// const authAPI = window.authAPI; // Remove this line
// console.log("authAPI object read in auth.js:", authAPI); // Remove this line

(function() {
  class AuthService {
    constructor() {
      // 这里不再需要初始化存储
      console.log('AuthService已初始化，使用API模式');
    }

    // 注册新用户
    register(username, password, email) {
      // 直接使用 window.authAPI
      return window.authAPI.register(username, password, email)
        .then(data => {
          return { username, email };
        });
    }

    // 用户登录
    login(username, password) {
      // 直接使用 window.authAPI
      return window.authAPI.login(username, password)
        .then(data => {
          return { username, email: data.user.email };
        });
    }

    // 登出
    logout() {
      // 直接使用 window.authAPI
      return window.authAPI.logout();
    }

    // 获取当前用户
    getCurrentUser() {
      // 直接使用 window.authAPI
      return window.authAPI.getCurrentUser();
    }

    // 检查是否已登录
    isAuthenticated() {
      // 直接使用 window.authAPI
      return window.authAPI.isAuthenticated();
    }

    // 更新用户设置
    updateUserSettings(settings) {
      // 直接使用 window.authAPI
      return window.authAPI.updateUserSettings(settings);
    }

    // 保存链接
    saveLink(link) {
      // 直接使用 window.authAPI
      return window.authAPI.saveLink(link);
    }

    // 获取保存的链接
    getSavedLinks() {
      // 直接使用 window.authAPI
      return window.authAPI.getSavedLinks();
    }

    // 删除链接
    deleteLink(linkId) {
      // 直接使用 window.authAPI
      return window.authAPI.deleteLink(linkId);
    }
  }

  // 将auth实例挂载到全局window.auth对象上
  // console.log("Reached before assigning window.auth in auth.js"); // Remove this log
  window.auth = new AuthService();
  // console.log("window.auth assigned in auth.js:", window.auth); // Remove this log
})(); 