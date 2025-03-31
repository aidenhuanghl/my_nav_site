/**
 * Vercel环境修复脚本
 * 在页面加载时运行，修复Vercel部署时可能出现的问题
 */

// 立即创建theme-switch-wrapper，不等待DOMContentLoaded
(function() {
  console.log('立即执行Vercel修复初始化...');
  
  // 确保CSS样式
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .theme-switch-wrapper {
      position: fixed;
      top: 20px;
      right: 80px;
      z-index: 1000;
      display: flex;
      align-items: center;
    }
    .account-button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.5rem;
      color: var(--text-color, #333);
      padding: 5px;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .glass-effect {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  `;
  document.head.appendChild(styleEl);
  
  // 创建theme-switch-wrapper元素
  if (!document.querySelector('.theme-switch-wrapper')) {
    console.log('立即创建.theme-switch-wrapper元素');
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switch-wrapper';
    
    // 如果body已加载则添加，否则使用MutationObserver监听body
    if (document.body) {
      document.body.appendChild(wrapper);
    } else {
      // 使用MutationObserver监听body的创建
      const observer = new MutationObserver(function(mutations) {
        if (document.body && !document.querySelector('.theme-switch-wrapper')) {
          document.body.appendChild(wrapper);
          observer.disconnect();
        }
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  console.log('正在运行Vercel环境修复脚本 (DOMContentLoaded)...');
  
  // 1. 修复路径问题 - 将/public/路径转换为正确的路径
  fixResourcePaths();
  
  // 2. 修复DOM查询错误
  fixDOMErrors();
  
  // 3. 确保auth模块正常初始化
  checkAuthInitialization();
  
  // 4. 修复account.js中的DOM错误
  fixAccountJs();
});

/**
 * 修复资源路径问题
 * 将/public/开头的路径转换为正确的格式
 */
function fixResourcePaths() {
  // 修复样式表中的路径
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (link.href && link.href.includes('/public/')) {
      const newHref = link.href.replace('/public/', '/');
      console.log(`修复样式表路径: ${link.href} -> ${newHref}`);
      link.href = newHref;
    }
  });
  
  // 修复脚本路径
  document.querySelectorAll('script').forEach(script => {
    if (script.src && script.src.includes('/public/')) {
      const newSrc = script.src.replace('/public/', '/');
      console.log(`修复脚本路径: ${script.src} -> ${newSrc}`);
      script.src = newSrc;
    }
  });
  
  // 修复图片路径
  document.querySelectorAll('img').forEach(img => {
    if (img.src && img.src.includes('/public/')) {
      const newSrc = img.src.replace('/public/', '/');
      console.log(`修复图片路径: ${img.src} -> ${newSrc}`);
      img.src = newSrc;
    }
  });
  
  // 修复任何动态加载的资源
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('/public/')) {
      const newUrl = url.replace('/public/', '/');
      console.log(`修复fetch URL: ${url} -> ${newUrl}`);
      return originalFetch(newUrl, options);
    }
    return originalFetch(url, options);
  };
}

/**
 * 修复DOM查询错误
 * 确保account.js和其他脚本能正确获取DOM元素
 */
function fixDOMErrors() {
  // 检查并创建.theme-switch-wrapper如果不存在
  if (!document.querySelector('.theme-switch-wrapper')) {
    console.log('未找到.theme-switch-wrapper，创建一个...');
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switch-wrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.top = '20px';
    wrapper.style.right = '80px';
    wrapper.style.zIndex = '1000';
    document.body.appendChild(wrapper);
  }
  
  // 确保存在适当的容器用于放置账户按钮
  const accountButton = document.querySelector('.account-button');
  if (!accountButton) {
    console.log('账户按钮不存在，可能未正确加载account.js');
  }
}

/**
 * 检查认证模块初始化
 * 确保auth.js正确加载并初始化
 */
function checkAuthInitialization() {
  if (typeof window.auth === 'undefined') {
    console.warn('认证模块未正确初始化，尝试重新加载auth.js');
    
    // 动态加载auth.js
    const authScript = document.createElement('script');
    authScript.src = '/auth.js';
    authScript.onload = function() {
      console.log('已重新加载auth.js');
      
      // 然后加载依赖auth的脚本
      const accountScript = document.createElement('script');
      accountScript.src = '/account.js';
      document.head.appendChild(accountScript);
    };
    document.head.appendChild(authScript);
  }
}

/**
 * 专门修复account.js中的问题
 */
function fixAccountJs() {
  // 修复DOM错误：替换account.js中的关键函数
  window.patchAccountJs = function() {
    // 创建模拟的theme-switch-wrapper元素（如果不存在）
    if (!document.querySelector('.theme-switch-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'theme-switch-wrapper';
      document.body.appendChild(wrapper);
      console.log('通过patchAccountJs创建了.theme-switch-wrapper');
    }
  };
  
  // 添加账户按钮的快捷方法
  window.addAccountButton = function() {
    const themeWrapper = document.querySelector('.theme-switch-wrapper');
    if (!themeWrapper) return;
    
    if (!document.querySelector('.account-button')) {
      const btn = document.createElement('button');
      btn.className = 'account-button glass-effect';
      btn.innerHTML = '<i class="fas fa-user"></i>';
      themeWrapper.appendChild(btn);
      console.log('通过addAccountButton创建了.account-button');
    }
  };
  
  // 尝试立即执行
  window.patchAccountJs();
  
  // 并设置一个延迟执行，以防DOM还没完全加载
  setTimeout(window.patchAccountJs, 1000);
  setTimeout(window.addAccountButton, 1000);
}

// 添加到全局错误处理
window.addEventListener('error', function(event) {
  console.log('捕获到全局错误:', event.message);
  if (event.message.includes('Cannot read properties of null')) {
    console.log('DOM元素未找到错误，尝试修复...');
    window.patchAccountJs();
    window.addAccountButton();
  }
}); 