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
      showNotification('无法连接到服务器，请检查网络连接', 10000);
      return status;
    }
    
    if (status.usingLocalStorage) {
      statusIndicator.textContent = '本地存储模式';
      statusIndicator.style.backgroundColor = '#ffc107';
      statusIndicator.style.color = '#212529';
      showNotification('当前使用本地存储模式，您的数据将保存在本地文件中', 8000);
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
      showNotification('无法连接到数据库，使用本地存储模式', 8000);
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
    showNotification('检查API状态失败: ' + error.message, 8000);
    return {
      apiAvailable: false,
      isConnected: false,
      usingLocalStorage: false,
      error: error.message
    };
  }
}

// 发布博客文章
async function publishBlog() {
  try {
    // 获取表单数据
    const titleInput = document.getElementById('blogTitle');
    const contentEditor = document.querySelector('.ql-editor');
    const categorySelect = document.getElementById('blogCategory');
    const tagsInput = document.getElementById('blogTags');
    
    const title = titleInput.value.trim();
    const content = contentEditor.innerHTML;
    const category = categorySelect.value;
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // 验证必填字段
    if (!title) {
      showNotification('请输入博客标题', 3000);
      titleInput.focus();
      return;
    }
    
    if (!content || content === '<p><br></p>') {
      showNotification('请输入博客内容', 3000);
      contentEditor.focus();
      return;
    }
    
    // 禁用发布按钮，防止重复提交
    const publishButton = document.getElementById('publishBtn');
    if (publishButton) {
      publishButton.disabled = true;
      publishButton.textContent = '发布中...';
    }
    
    // 检查API状态
    const apiStatus = await window.BlogAPI.checkApiStatus();
    if (!apiStatus.apiAvailable) {
      showNotification('无法连接到服务器，请检查网络连接后重试', 5000);
      if (publishButton) {
        publishButton.disabled = false;
        publishButton.textContent = '发布博客';
      }
      return;
    }
    
    // 准备博客数据
    const blogData = {
      title,
      content,
      category: category || '未分类',
      tags,
      coverImage: coverImageUrl || '',
      isPublished: true
    };
    
    console.log('发布博客数据:', blogData);
    
    try {
      // 调用API创建博客
      const newPost = await window.BlogAPI.createPost(blogData);
      console.log('博客发布成功:', newPost);
      
      // 显示成功通知
      showNotification('博客发布成功！', 3000);
      
      // 重置表单
      titleInput.value = '';
      contentEditor.innerHTML = '';
      tagsInput.value = '';
      coverImageUrl = '';
      
      // 更新预览图
      const coverPreview = document.getElementById('coverPreview');
      if (coverPreview) {
        coverPreview.style.display = 'none';
        coverPreview.src = '';
      }
      
      // 延迟跳转到首页
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } catch (error) {
      console.error('发布博客失败:', error);
      showNotification('发布博客失败: ' + error.message, 5000);
    } finally {
      // 恢复发布按钮状态
      if (publishButton) {
        publishButton.disabled = false;
        publishButton.textContent = '发布博客';
      }
    }
  } catch (error) {
    console.error('发布博客时出错:', error);
    showNotification('发布博客时出错: ' + error.message, 5000);
    
    // 恢复发布按钮状态
    const publishButton = document.getElementById('publishBtn');
    if (publishButton) {
      publishButton.disabled = false;
      publishButton.textContent = '发布博客';
    }
  }
}

// 文档加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
  // 检查API状态
  await checkApiStatus();
  
  // 初始化博客功能
  initBlogFunctionality();
}); 