// 检查API状态并显示
async function checkApiStatus() {
  try {
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'api-status-indicator';
    statusIndicator.style.position = 'fixed';
    statusIndicator.style.bottom = '10px';
    statusIndicator.style.right = '10px';
    statusIndicator.style.padding = '5px 10px';
    statusIndicator.style.borderRadius = '3px';
    statusIndicator.style.fontSize = '12px';
    statusIndicator.style.zIndex = '9999';
    document.body.appendChild(statusIndicator);
    
    statusIndicator.textContent = '检查连接状态...';
    statusIndicator.style.backgroundColor = '#f8f9fa';
    statusIndicator.style.color = '#6c757d';
    statusIndicator.style.border = '1px solid #dee2e6';
    
    const status = await window.BlogAPI.checkApiStatus();
    
    if (!status.apiAvailable) {
      statusIndicator.textContent = '无法连接到服务器';
      statusIndicator.style.backgroundColor = '#dc3545';
      statusIndicator.style.color = 'white';
      return status;
    }
    
    if (status.usingLocalStorage) {
      statusIndicator.textContent = '本地存储模式';
      statusIndicator.style.backgroundColor = '#ffc107';
      statusIndicator.style.color = '#212529';
    } else if (status.isConnected) {
      statusIndicator.textContent = '已连接到MongoDB';
      statusIndicator.style.backgroundColor = '#28a745';
      statusIndicator.style.color = 'white';
      setTimeout(() => {
        statusIndicator.style.opacity = '0.5';
      }, 3000);
    } else {
      statusIndicator.textContent = '未连接到数据库';
      statusIndicator.style.backgroundColor = '#dc3545';
      statusIndicator.style.color = 'white';
    }
    
    // 点击指示器显示详细状态
    statusIndicator.style.cursor = 'pointer';
    statusIndicator.addEventListener('click', () => {
      statusIndicator.style.opacity = '1';
      const details = `
        API状态: ${status.apiAvailable ? '可用' : '不可用'}
        数据库连接: ${status.isConnected ? '已连接' : '未连接'}
        存储模式: ${status.usingLocalStorage ? '本地文件' : 'MongoDB'}
        服务器时间: ${new Date(status.serverTime).toLocaleString()}
      `;
      alert(details);
    });
    
    return status;
  } catch (error) {
    console.error('检查API状态失败:', error);
    return {
      apiAvailable: false,
      isConnected: false,
      usingLocalStorage: false,
      error: error.message
    };
  }
}

// 显示通知
function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = '#333';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  notification.style.opacity = '0';
  notification.style.transition = 'opacity 0.3s ease';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // 淡入
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // 淡出并移除
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', async function() {
  // 检查API状态
  const status = await checkApiStatus();
  
  // 初始化博客卡片
  initializeBlogCards();
  
  // 如果没有连接到API，显示通知
  if (!status.apiAvailable) {
    showNotification('无法连接到服务器，部分功能可能无法使用', 8000);
  } else if (status.usingLocalStorage) {
    showNotification('当前使用本地存储模式，您的数据将保存在本地文件中', 5000);
  }
}); 