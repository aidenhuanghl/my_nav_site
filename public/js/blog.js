// 显示博客详情
function showBlogDetail(blogIdOrObject) {
    console.log('showBlogDetail called with:', blogIdOrObject);
    
    // 防止递归调用导致的栈溢出
    if (window._showingBlogDetail) {
        console.warn('避免递归调用showBlogDetail');
        return;
    }
    
    window._showingBlogDetail = true;
    
    try {
        let blog;
        let blogId; // 确保有一个一致的blogId
        
        // 确定博客对象和blogId
        if (typeof blogIdOrObject === 'object' && blogIdOrObject !== null) {
            blog = blogIdOrObject;
            blogId = blog.id || ('blog-' + Date.now());
            console.log('Processing blog object, extracted ID:', blogId);
            if (!blog.id) {
                blog.id = blogId;
            }
            
            // 如果已经有博客对象，直接显示详情
            displayBlogDetailModal(blog, blogId);
        } else {
            // 如果是ID，从API获取博客文章
            blogId = blogIdOrObject;
            console.log('Processing blog ID:', blogId);
            
            // 对于静态博客，保持原有的逻辑
            if (blogId.startsWith('static-')) {
                const index = parseInt(blogId.replace('static-', ''), 10);
                blog = {
                    id: blogId,
                    title: '静态博客文章 ' + (index + 1),
                    content: "这是预设的静态博客文章。您可以点击右下角的\"写博客\"按钮创建自己的博客内容。",
                    date: new Date().toISOString().split('T')[0],
                    author: '网站作者',
                    category: '技术',
                    tags: ['技术'],
                    imageUrl: null,
                    viewCount: 0
                };
                
                // 显示博客详情
                displayBlogDetailModal(blog, blogId);
            } else {
                // 对于MongoDB中的博客，使用API获取
                window.blogAPI.getPost(blogId)
                    .then(post => {
                        // 显示博客详情
                        displayBlogDetailModal(post, blogId);
                    })
                    .catch(error => {
                        console.error('获取博客详情失败:', error);
                        
                        // 创建一个默认的博客对象
                        const defaultBlog = {
                            id: blogId,
                            title: '未知文章',
                            content: "无法找到这篇文章的内容。",
                            date: new Date().toISOString().split('T')[0],
                            author: '未知',
                            category: '未分类',
                            tags: [],
                            imageUrl: null,
                            viewCount: 0
                        };
                        
                        displayBlogDetailModal(defaultBlog, blogId);
                    });
            }
        }
    } catch (error) {
        console.error('显示博客详情时出错:', error);
        window._showingBlogDetail = false;
    }
}

// 发布博客函数
function publishBlog() {
    console.log('正在发布博客...');
    
    // 获取表单数据
    const title = document.getElementById('blog-title').value;
    const content = document.getElementById('blog-content').value;
    const category = document.getElementById('blog-category').value;
    const tags = document.getElementById('blog-tags').value;
    const imageInput = document.getElementById('blog-image');
    
    // 验证必填字段
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    // 获取上传的图片数据
    let uploadedImageData = null;
    const previewContainer = document.querySelector('.image-preview-container');
    if (previewContainer) {
        const previewImg = previewContainer.querySelector('.image-preview');
        if (previewImg && previewImg.src) {
            uploadedImageData = previewImg.src;
        }
    }
    
    // 显示加载状态
    const publishBtn = document.querySelector('.publish-btn');
    const originalText = publishBtn.textContent;
    publishBtn.textContent = '发布中...';
    publishBtn.disabled = true;
    
    // 调用保存博客函数
    saveBlogPost(title, content, category, tags, uploadedImageData, false)
        .then(blog => {
            console.log('博客发布成功:', blog);
            
            // 关闭模态框
            const modal = document.querySelector('.write-blog-modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // 重置表单
            document.querySelector('.write-blog-form').reset();
            
            // 清除图片预览
            if (previewContainer) {
                previewContainer.style.display = 'none';
            }
            
            // 刷新博客列表
            loadBlogPosts();
            
            // 显示成功通知
            showNotification('博客发布成功！');
            
            // 显示新发布的文章
            setTimeout(() => {
                if (blog && (blog.id || blog._id)) {
                    const blogId = blog.id || blog._id.toString();
                    showBlogDetail(blogId);
                }
            }, 1000);
        })
        .catch(error => {
            console.error('发布博客失败:', error);
            alert('发布博客失败: ' + (error.message || '未知错误'));
        })
        .finally(() => {
            // 恢复按钮状态
            publishBtn.textContent = originalText;
            publishBtn.disabled = false;
        });
} 