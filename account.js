// account.js - 前端账号管理模块

document.addEventListener('DOMContentLoaded', function() {
  // 引入临时认证模块
  // 注意：如果你使用的是CommonJS/ES模块，可能需要调整导入方式
  const auth = window.auth;
  
  // DOM元素
  const accountButton = document.createElement('button');
  accountButton.className = 'account-button glass-effect';
  accountButton.innerHTML = '<i class="fas fa-user"></i>';
  
  const accountMenu = document.createElement('div');
  accountMenu.className = 'account-menu';
  accountMenu.style.display = 'none';
  
  // 添加到页面
  document.querySelector('.theme-switch-wrapper').appendChild(accountButton);
  document.body.appendChild(accountMenu);
  
  // 更新账号菜单内容
  function updateAccountMenu() {
    if (auth && auth.isAuthenticated()) {
      auth.getCurrentUser().then(user => {
        if (!user) {
          // 如果getCurrentUser返回null(会话过期)，显示未登录界面
          showNotLoggedInMenu();
          return;
        }
        
        accountMenu.innerHTML = `
          <div class="account-header">
            <h3><i class="fas fa-user-circle"></i> ${user.username}</h3>
            <button id="close-account-menu" class="close-button"><i class="fas fa-times"></i></button>
          </div>
          <div class="account-content">
            <div class="account-info">
              <p><i class="fas fa-envelope"></i> ${user.email || '未设置邮箱'}</p>
              <p><i class="fas fa-calendar-alt"></i> 注册于: ${new Date(user.createdAt).toLocaleDateString()}</p>
              <p><i class="fas fa-clock"></i> 上次登录: ${new Date(user.lastLogin).toLocaleDateString()}</p>
            </div>
            <div class="account-actions">
              <button id="my-links" class="account-action-btn">
                <i class="fas fa-link"></i> 我的链接
              </button>
              <button id="my-settings" class="account-action-btn">
                <i class="fas fa-cog"></i> 账号设置
              </button>
              <button id="logout-btn" class="account-action-btn logout">
                <i class="fas fa-sign-out-alt"></i> 退出登录
              </button>
            </div>
          </div>
        `;
        
        // 添加事件监听
        accountMenu.querySelector('#close-account-menu').addEventListener('click', () => {
          accountMenu.style.display = 'none';
        });
        
        accountMenu.querySelector('#logout-btn').addEventListener('click', () => {
          auth.logout().then(() => {
            updateAccountMenu();
            accountMenu.style.display = 'none';
            showMessage('您已成功退出登录', 'success');
          });
        });
        
        accountMenu.querySelector('#my-links').addEventListener('click', () => {
          showMyLinks();
        });
        
        accountMenu.querySelector('#my-settings').addEventListener('click', () => {
          showAccountSettings();
        });
      }).catch(err => {
        console.error('获取用户信息失败:', err);
        showNotLoggedInMenu();
      });
    } else {
      showNotLoggedInMenu();
    }
  }
  
  // 显示未登录菜单
  function showNotLoggedInMenu() {
    // 未登录状态显示登录/注册表单
    accountMenu.innerHTML = `
      <div class="account-header">
        <h3><i class="fas fa-user"></i> 账号</h3>
        <button id="close-account-menu" class="close-button"><i class="fas fa-times"></i></button>
      </div>
      <div class="account-tabs">
        <button id="login-tab" class="account-tab active">登录</button>
        <button id="register-tab" class="account-tab">注册</button>
      </div>
      <div id="login-form" class="account-form active">
        <div class="form-group">
          <label for="login-username">用户名</label>
          <input type="text" id="login-username" placeholder="请输入用户名">
        </div>
        <div class="form-group">
          <label for="login-password">密码</label>
          <input type="password" id="login-password" placeholder="请输入密码">
        </div>
        <button id="login-btn" class="account-submit-btn">登录</button>
      </div>
      <div id="register-form" class="account-form">
        <div class="form-group">
          <label for="register-username">用户名</label>
          <input type="text" id="register-username" placeholder="请输入用户名">
        </div>
        <div class="form-group">
          <label for="register-email">邮箱</label>
          <input type="email" id="register-email" placeholder="请输入邮箱地址">
        </div>
        <div class="form-group">
          <label for="register-password">密码</label>
          <input type="password" id="register-password" placeholder="请输入密码">
        </div>
        <div class="form-group">
          <label for="register-confirm-password">确认密码</label>
          <input type="password" id="register-confirm-password" placeholder="请再次输入密码">
        </div>
        <button id="register-btn" class="account-submit-btn">注册</button>
      </div>
    `;
    
    // 添加事件监听
    accountMenu.querySelector('#close-account-menu').addEventListener('click', () => {
      accountMenu.style.display = 'none';
    });
    
    // 切换登录/注册表单
    const loginTab = accountMenu.querySelector('#login-tab');
    const registerTab = accountMenu.querySelector('#register-tab');
    const loginForm = accountMenu.querySelector('#login-form');
    const registerForm = accountMenu.querySelector('#register-form');
    
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    });
    
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    });
    
    // 登录
    accountMenu.querySelector('#login-btn').addEventListener('click', () => {
      const username = accountMenu.querySelector('#login-username').value.trim();
      const password = accountMenu.querySelector('#login-password').value.trim();
      
      if (!username || !password) {
        showMessage('请填写用户名和密码', 'error');
        return;
      }
      
      auth.login(username, password).then(() => {
        updateAccountMenu();
        showMessage(`欢迎回来，${username}！`, 'success');
      }).catch(error => {
        showMessage(error.message || '登录失败，请检查用户名和密码', 'error');
      });
    });
    
    // 注册
    accountMenu.querySelector('#register-btn').addEventListener('click', () => {
      const username = accountMenu.querySelector('#register-username').value.trim();
      const email = accountMenu.querySelector('#register-email').value.trim();
      const password = accountMenu.querySelector('#register-password').value.trim();
      const confirmPassword = accountMenu.querySelector('#register-confirm-password').value.trim();
      
      if (!username || !email || !password) {
        showMessage('请填写所有必填项', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
      }
      
      auth.register(username, password, email).then(() => {
        updateAccountMenu();
        showMessage(`注册成功，欢迎 ${username}！`, 'success');
      }).catch(error => {
        showMessage(error.message || '注册失败，请稍后重试', 'error');
      });
    });
  }
  
  // 显示我的链接页面
  function showMyLinks() {
    if (!auth.isAuthenticated()) {
      showMessage('请先登录', 'error');
      return;
    }
    
    // 创建我的链接模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content glass-effect">
        <div class="modal-header">
          <h3><i class="fas fa-link"></i> 我的链接</h3>
          <button class="close-button"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div id="my-links-container" class="links-container">
            <p class="loading">正在加载链接...</p>
          </div>
          <div class="add-link-section">
            <button id="add-link-btn" class="account-action-btn">
              <i class="fas fa-plus"></i> 添加新链接
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 关闭模态框
    modal.querySelector('.close-button').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // 添加链接按钮事件
    modal.querySelector('#add-link-btn').addEventListener('click', () => {
      showAddLinkForm();
    });
    
    // 加载链接
    auth.getSavedLinks().then(links => {
      const container = modal.querySelector('#my-links-container');
      
      if (!links || links.length === 0) {
        container.innerHTML = '<p class="empty-links">您还没有保存任何链接</p>';
        return;
      }
      
      // 显示链接列表
      container.innerHTML = '';
      links.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item glass-card';
        linkItem.innerHTML = `
          <div class="link-icon"><i class="${link.icon || 'fas fa-link'}"></i></div>
          <div class="link-info">
            <h4><a href="${link.url}" target="_blank">${link.title}</a></h4>
            <p>${link.description || '无描述'}</p>
          </div>
          <div class="link-actions">
            <button class="delete-link" data-id="${link._id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        `;
        
        container.appendChild(linkItem);
      });
      
      // 添加删除链接功能
      container.querySelectorAll('.delete-link').forEach(button => {
        button.addEventListener('click', () => {
          const linkId = button.getAttribute('data-id');
          
          if (confirm('确定要删除这个链接吗？')) {
            auth.deleteLink(linkId).then(() => {
              showMessage('链接已删除', 'success');
              // 重新加载链接列表
              button.closest('.link-item').remove();
              
              // 如果没有链接了，显示空状态
              if (container.querySelectorAll('.link-item').length === 0) {
                container.innerHTML = '<p class="empty-links">您还没有保存任何链接</p>';
              }
            }).catch(error => {
              showMessage(error.message || '删除链接失败', 'error');
            });
          }
        });
      });
    }).catch(error => {
      const container = modal.querySelector('#my-links-container');
      container.innerHTML = `<p class="error-message">加载链接失败: ${error.message || '未知错误'}</p>`;
    });
  }
  
  // 显示添加链接表单
  function showAddLinkForm() {
    // 创建添加链接模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content glass-effect">
        <div class="modal-header">
          <h3><i class="fas fa-plus"></i> 添加新链接</h3>
          <button class="close-button"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="link-title">标题</label>
            <input type="text" id="link-title" placeholder="链接标题">
          </div>
          <div class="form-group">
            <label for="link-url">URL</label>
            <input type="url" id="link-url" placeholder="https://">
          </div>
          <div class="form-group">
            <label for="link-description">描述</label>
            <textarea id="link-description" placeholder="链接描述(可选)"></textarea>
          </div>
          <button id="save-link-btn" class="account-submit-btn">保存链接</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 关闭模态框
    modal.querySelector('.close-button').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // 保存链接
    modal.querySelector('#save-link-btn').addEventListener('click', () => {
      const title = modal.querySelector('#link-title').value.trim();
      const url = modal.querySelector('#link-url').value.trim();
      const description = modal.querySelector('#link-description').value.trim();
      
      if (!title || !url) {
        showMessage('请填写标题和URL', 'error');
        return;
      }
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showMessage('URL必须以http://或https://开头', 'error');
        return;
      }
      
      auth.saveLink({ title, url, description }).then(() => {
        showMessage('链接已保存', 'success');
        document.body.removeChild(modal);
        
        // 刷新我的链接页面
        const linksModal = document.querySelector('.modal');
        if (linksModal) {
          document.body.removeChild(linksModal);
          showMyLinks();
        }
      }).catch(error => {
        showMessage(error.message || '保存链接失败', 'error');
      });
    });
  }
  
  // 显示账号设置页面
  function showAccountSettings() {
    if (!auth.isAuthenticated()) {
      showMessage('请先登录', 'error');
      return;
    }
    
    auth.getCurrentUser().then(user => {
      if (!user) {
        showMessage('无法获取用户信息', 'error');
        return;
      }
      
      // 创建账号设置模态框
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content glass-effect">
          <div class="modal-header">
            <h3><i class="fas fa-cog"></i> 账号设置</h3>
            <button class="close-button"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="settings-email">邮箱</label>
              <input type="email" id="settings-email" value="${user.email || ''}" placeholder="请输入邮箱地址">
            </div>
            <div class="form-group">
              <label for="settings-theme">主题</label>
              <select id="settings-theme">
                <option value="light" ${user.settings?.theme === 'light' ? 'selected' : ''}>浅色</option>
                <option value="dark" ${user.settings?.theme === 'dark' ? 'selected' : ''}>深色</option>
              </select>
            </div>
            <div class="form-divider"></div>
            <div class="form-group">
              <label for="current-password">当前密码</label>
              <input type="password" id="current-password" placeholder="输入当前密码以修改密码">
            </div>
            <div class="form-group">
              <label for="new-password">新密码</label>
              <input type="password" id="new-password" placeholder="输入新密码">
            </div>
            <div class="form-group">
              <label for="confirm-new-password">确认新密码</label>
              <input type="password" id="confirm-new-password" placeholder="再次输入新密码">
            </div>
            <button id="save-settings" class="account-submit-btn">保存设置</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // 关闭模态框
      modal.querySelector('.close-button').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // 保存设置
      modal.querySelector('#save-settings').addEventListener('click', () => {
        const email = modal.querySelector('#settings-email').value.trim();
        const theme = modal.querySelector('#settings-theme').value;
        
        // 保存主题设置
        const settings = { theme, email };
        auth.updateUserSettings(settings).then(() => {
          document.body.classList.toggle('dark-theme', theme === 'dark');
          showMessage('设置已保存', 'success');
          updateAccountMenu(); // 更新账号菜单显示新邮箱
        }).catch(error => {
          showMessage(error.message || '保存设置失败', 'error');
        });
        
        // 处理密码修改功能将在未来版本实现
        const currentPassword = modal.querySelector('#current-password').value.trim();
        const newPassword = modal.querySelector('#new-password').value.trim();
        const confirmNewPassword = modal.querySelector('#confirm-new-password').value.trim();
        
        if (currentPassword && newPassword) {
          if (newPassword !== confirmNewPassword) {
            showMessage('两次输入的新密码不一致', 'error');
            return;
          }
          
          showMessage('密码修改功能将在未来版本实现', 'warning');
        }
      });
    }).catch(error => {
      showMessage(error.message || '无法获取用户信息', 'error');
    });
  }
  
  // 显示消息提醒
  function showMessage(message, type = 'info') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${type}`;
    messageContainer.innerHTML = `
      <div class="message-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(messageContainer);
    
    // 自动消失
    setTimeout(() => {
      messageContainer.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(messageContainer);
      }, 300);
    }, 3000);
  }
  
  // 账号按钮点击切换账号菜单
  accountButton.addEventListener('click', (e) => {
    e.stopPropagation();
    updateAccountMenu();
    if (accountMenu.style.display === 'none') {
      accountMenu.style.display = 'block';
    } else {
      accountMenu.style.display = 'none';
    }
  });
  
  // 点击页面其他地方关闭账号菜单
  document.addEventListener('click', (e) => {
    if (accountMenu.style.display === 'block' && !accountMenu.contains(e.target) && e.target !== accountButton) {
      accountMenu.style.display = 'none';
    }
  });
  
  // 初始应用用户主题
  function applyUserTheme() {
    if (auth && auth.isAuthenticated()) {
      auth.getCurrentUser().then(user => {
        if (user && user.settings && user.settings.theme === 'dark') {
          document.body.classList.add('dark-theme');
          document.getElementById('theme-toggle').checked = true;
        }
      }).catch(error => {
        console.error('获取用户主题设置失败:', error);
      });
    }
  }
  
  // 初始化
  updateAccountMenu();
  applyUserTheme();
}); 