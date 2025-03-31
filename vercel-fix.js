/**
 * Vercel环境修复脚本
 * 在页面加载时运行，修复Vercel部署时可能出现的问题
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('正在运行Vercel环境修复脚本...');
  
  // 1. 修复路径问题 - 将/public/路径转换为正确的路径
  fixResourcePaths();
  
  // 2. 修复DOM查询错误
  fixDOMErrors();
  
  // 3. 确保auth模块正常初始化
  checkAuthInitialization();
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

// 添加到全局错误处理
window.addEventListener('error', function(event) {
  console.log('捕获到全局错误:', event.message);
  if (event.message.includes('Cannot read properties of null')) {
    console.log('DOM元素未找到错误，请检查页面结构');
  }
}); 