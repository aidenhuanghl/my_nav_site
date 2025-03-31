// 显示通知提示
function showNotification(message, duration = 3000) {
    // 检查是否已有通知容器
    let container = document.getElementById('notification-container');
    
    // 如果容器不存在，创建一个
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // 应用样式
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // 添加到容器
    container.appendChild(notification);
    
    // 触发回流并应用动画
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 设置定时器，在指定时间后移除通知
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // 如果容器中没有更多通知，移除容器
            if (container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 300);
    }, duration);
}

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
            // 处理博客对象
            blog = blogIdOrObject;
            blogId = blog.id || blog._id || ('blog-' + Date.now());
            console.log('处理博客对象，提取ID:', blogId);
            
            // 确保blog对象有ID
            if (!blog.id && !blog._id) {
                blog.id = blogId;
            }
            
            // 直接显示对象详情
            displayBlogDetailModal(blog, blogId);
        } else {
            // 处理博客ID
            blogId = blogIdOrObject;
            console.log('处理博客ID:', blogId);
            
            // 对于静态博客，保持原有的逻辑
            if (typeof blogId === 'string' && blogId.startsWith('static-')) {
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
                console.log('从API获取博客，ID:', blogId);
                
                window.blogAPI.getPost(blogId)
                    .then(post => {
                        console.log('API返回博客数据:', post);
                        
                        if (!post) {
                            throw new Error('API返回空数据');
                        }
                        
                        // 确保post对象有id字段
                        if (!post.id && post._id) {
                            post.id = post._id.toString();
                        }
                        
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
                        
                        console.warn('显示默认博客对象:', defaultBlog);
                        displayBlogDetailModal(defaultBlog, blogId);
                    });
            }
        }
    } catch (error) {
        console.error('显示博客详情时出错:', error);
        window._showingBlogDetail = false;
    }
}

// 显示博客详情模态框
function displayBlogDetailModal(blog, blogId) {
    try {
        console.log('显示博客详情模态框:', blog);
        
        // 确保blog是一个对象
        if (!blog || typeof blog !== 'object') {
            console.error('无效的博客数据:', blog);
            blog = {
                id: blogId || 'unknown',
                title: '数据错误',
                content: '无法显示文章内容，数据格式不正确。',
                date: new Date().toISOString().split('T')[0],
                author: '未知',
                category: '未分类',
                tags: [],
                viewCount: 0
            };
        }
        
        // 确保有一个有效的ID
        const id = blog.id || blog._id || blogId || 'blog-' + Date.now();
        
        // 确保tags是数组
        const tags = Array.isArray(blog.tags) ? blog.tags : 
                    (typeof blog.tags === 'string' ? blog.tags.split(',') : []);
        
        // 获取视图计数
        let currentViewCount = blog.viewCount || blog.views || 0;
        
        // 检查是否已有模态框
        const existingModal = document.querySelector('.blog-detail-modal');
        if (existingModal) {
            console.log('删除已存在的模态框，避免重复');
            document.body.removeChild(existingModal);
        }
        
        // 创建模态框
        const detailModal = document.createElement('div');
        detailModal.className = 'blog-detail-modal';
        
        // 格式化日期
        let formattedDate = '未知日期';
        if (blog.date) {
           try {
               // 处理不同的日期格式
               const dateObj = new Date(blog.date);
               if (!isNaN(dateObj.getTime())) {
                   formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
               } else if (typeof blog.date === 'string') {
                   formattedDate = blog.date;
               }
           } catch (e) {
               console.error('解析日期错误:', blog.date, e);
               formattedDate = typeof blog.date === 'string' ? blog.date : '无效日期';
           }
        }
        
        // 图片HTML
        let detailImageHtml = '';
        const imageSource = blog.imageData || blog.imageUrl;
        if (imageSource) {
            detailImageHtml = `<div class="blog-detail-image"><img src="${imageSource}" alt="${blog.title || '博客图片'}"></div>`;
        }
        
        // 确保文章内容存在
        const content = blog.content || '此文章无内容';
        
        // 删除按钮
        const deleteButtonHtml = `<button class="blog-detail-delete" data-blog-id="${id}"><i class="fas fa-trash"></i> 删除</button>`;
        
        // 设置模态框内容
        detailModal.innerHTML = `
            <div class="blog-detail-content">
                <div class="blog-detail-header">
                    <h2>${blog.title || '无标题'}</h2>
                    <div class="blog-detail-actions">
                        ${deleteButtonHtml}
                        <button class="close-detail-btn">&times;</button>
                    </div>
                </div>
                <div class="blog-detail-meta">
                    <span class="blog-detail-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                    <span class="blog-detail-author"><i class="far fa-user"></i> ${blog.author || '网站作者'}</span>
                    <span class="blog-detail-category"><i class="far fa-folder"></i> ${blog.category || '未分类'}</span>
                    <span class="blog-detail-views"><i class="far fa-eye"></i> ${currentViewCount}</span>
                </div>
                <div class="blog-detail-tags">
                    ${tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                ${detailImageHtml}
                <div class="blog-detail-body">
                    ${formatBlogContent(content)}
                </div>
            </div>
        `;
        
        // 将模态框添加到文档体
        document.body.appendChild(detailModal);
        document.body.style.overflow = 'hidden';
        
        // 添加淡入效果
        setTimeout(() => {
            detailModal.classList.add('active');
        }, 50);
        
        // 添加关闭按钮事件
        const closeBtn = detailModal.querySelector('.close-detail-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                detailModal.classList.remove('active');
                setTimeout(() => {
                     if (document.body.contains(detailModal)) {
                        document.body.removeChild(detailModal);
                        document.body.style.overflow = '';
                     }
                }, 300);
            });
        }
        
        // 添加删除按钮事件
        const deleteBtn = detailModal.querySelector('.blog-detail-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentBlogId = deleteBtn.getAttribute('data-blog-id');
                console.log('删除按钮点击，获取到的博客ID:', currentBlogId);
                
                // 确保有有效的ID
                if (!currentBlogId || currentBlogId === 'undefined') {
                    console.error('无效的博客ID，使用备用ID:', id);
                    showDeleteConfirmation(id, detailModal);
                } else {
                    showDeleteConfirmation(currentBlogId, detailModal);
                }
            });
        }
        
        // 点击模态框外部关闭
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                 detailModal.classList.remove('active');
                 setTimeout(() => {
                     if (document.body.contains(detailModal)) {
                        document.body.removeChild(detailModal);
                        document.body.style.overflow = '';
                     }
                 }, 300);
            }
        });
    } catch (error) {
        console.error('显示博客详情模态框时出错:', error);
    } finally {
        // 确保标志被重置
        setTimeout(() => {
            window._showingBlogDetail = false;
        }, 500);
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
            console.log('博客发布成功，返回数据:', blog);
            
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
                if (blog) {
                    // 确保有一个有效的ID
                    const blogId = blog.id || (blog._id ? blog._id.toString() : null);
                    console.log('将显示新发布的博客文章，ID:', blogId);
                    
                    if (blogId) {
                        showBlogDetail(blogId);
                    } else {
                        console.error('新发布的博客没有有效ID:', blog);
                        showBlogDetail(blog); // 直接传递博客对象
                    }
                } else {
                    console.error('博客发布成功但返回数据为空');
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

// 创建博客卡片
function createBlogCard(blog) {
    // 确保blog是一个有效对象
    if (!blog || typeof blog !== 'object') {
        console.error('创建博客卡片时收到无效数据:', blog);
        return document.createElement('div'); // 返回空div避免错误
    }
    
    // 确保有一个有效的ID
    const blogId = blog.id || (blog._id ? blog._id.toString() : 'blog-' + Date.now());
    console.log('创建博客卡片，使用ID:', blogId);
    
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('data-categories', blog.category || '未分类');
    card.setAttribute('data-blog-id', blogId);
    
    // 格式化日期
    let formattedDate = '未知日期';
    try {
        const date = new Date(blog.date || blog.createdAt || new Date());
        if (!isNaN(date.getTime())) {
            formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        }
    } catch (error) {
        console.error('格式化日期错误:', error);
    }
    
    // 确保有正确的标签
    const tags = Array.isArray(blog.tags) ? blog.tags : 
                (typeof blog.tags === 'string' ? blog.tags.split(',') : []);
    
    // 截取摘要
    const content = blog.content || '';
    const excerpt = content.length > 120 ? content.substring(0, 120) + '...' : content;
    
    // 确定要使用的图片URL
    let imageUrl;
    if (blog.imageData) {
        // 使用用户上传的图片
        imageUrl = blog.imageData;
    } else {
        // 使用默认图片
        imageUrl = 'images/blog-1.jpg'; // 默认图片
        
        // 根据分类选择图片
        const category = blog.category ? blog.category.toLowerCase() : '';
        if (category.includes('tech') || category.includes('web')) {
            imageUrl = 'images/webdev.jpg';
        } else if (category.includes('ai')) {
            imageUrl = 'images/ai.jpg';
        } else if (category.includes('japan')) {
            imageUrl = 'images/japan.jpg';
        } else if (category.includes('social')) {
            imageUrl = 'images/social.jpg';
        }
    }
    
    // 获取浏览量
    const viewCount = blog.viewCount || blog.views || 0;
    
    card.innerHTML = `
        <div class="blog-card-image">
            <img src="${imageUrl}" alt="${blog.title || '无标题'}">
            <div class="blog-card-date">${formattedDate}</div>
        </div>
        <div class="blog-card-content">
            <div class="blog-card-tags">
                ${tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
            <h3 class="blog-card-title">${blog.title || '无标题'}</h3>
            <p class="blog-card-excerpt">${excerpt}</p>
            <div class="blog-card-footer">
                <a href="#" class="blog-read-more" data-blog-id="${blogId}">阅读全文 <i class="fas fa-arrow-right"></i></a>
                <span class="blog-view-count"><i class="far fa-eye"></i> ${viewCount}</span>
            </div>
        </div>
    `;
    
    // 添加点击事件，显示博客详情
    const readMoreBtn = card.querySelector('.blog-read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const clickedBlogId = this.getAttribute('data-blog-id');
            console.log('点击阅读全文，博客ID:', clickedBlogId);
            showBlogDetail(clickedBlogId);
        });
    }
    
    return card;
}

// 显示删除确认对话框
function showDeleteConfirmation(blogId, parentModal) {
    // 创建确认对话框
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirmation-dialog';
    confirmDialog.innerHTML = `
        <div class="confirmation-dialog-content">
            <h3>确认删除</h3>
            <p>您确定要删除这篇博客文章吗？此操作无法撤销。</p>
            <div class="confirmation-buttons">
                <button class="cancel-btn">取消</button>
                <button class="confirm-btn">确认删除</button>
            </div>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .confirmation-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .confirmation-dialog-content {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 100%;
        }
        .confirmation-buttons {
            display: flex;
            justify-content: flex-end;
            margin-top: 1.5rem;
            gap: 1rem;
        }
        .cancel-btn {
            background-color: #f0f0f0;
            color: #333;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        }
        .confirm-btn {
            background-color: #e74c3c;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
    
    // 添加到页面
    document.body.appendChild(confirmDialog);
    
    // 添加取消按钮事件
    const cancelBtn = confirmDialog.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(confirmDialog);
    });
    
    // 添加确认按钮事件
    const confirmBtn = confirmDialog.querySelector('.confirm-btn');
    confirmBtn.addEventListener('click', () => {
        // 执行删除操作
        deleteBlogPost(blogId);
        
        // 关闭确认对话框
        document.body.removeChild(confirmDialog);
        
        // 关闭文章详情模态框
        if (parentModal) {
            parentModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(parentModal)) {
                    document.body.removeChild(parentModal);
                    document.body.style.overflow = '';
                }
            }, 300);
        }
    });
}

// 删除博客文章
function deleteBlogPost(blogId) {
    console.log('尝试删除博客文章，ID:', blogId);
    
    // 检查ID是否有效
    if (!blogId || blogId === 'undefined') {
        console.error('无效的博客ID，无法删除');
        showNotification('删除失败：无效的文章ID', 5000);
        return;
    }
    
    // 显示加载状态
    showNotification('正在删除博客文章...', 2000);
    
    // 调用API删除文章
    window.blogAPI.deletePost(blogId)
        .then(() => {
            // 删除成功
            showNotification('博客文章已成功删除', 3000);
            
            // 重新加载博客列表
            loadBlogPosts();
            
            // 更新热门文章列表
            updatePopularArticles();
        })
        .catch(error => {
            console.error('删除博客文章失败:', error);
            showNotification('删除博客文章失败，请稍后重试', 5000);
        });
}

// 加载博客帖子
function loadBlogPosts() {
    // 从MongoDB加载博客数据，而不是从localStorage加载
    window.blogAPI.getAllPosts()
        .then(blogs => {
            const blogGrid = document.querySelector('.blog-grid');
            const noPostsMessage = document.getElementById('no-blog-posts-message');
            
            if (!blogGrid) return;
            
            // 清空现有博客
            blogGrid.innerHTML = '';
            
            // 如果没有博客，显示"暂无文章"消息
            if (blogs.length === 0) {
                if (noPostsMessage) {
                    blogGrid.appendChild(noPostsMessage);
                    noPostsMessage.style.display = 'block';
                }
                return;
            }
            
            // 隐藏"暂无文章"消息
            if (noPostsMessage) {
                noPostsMessage.style.display = 'none';
            }
            
            // 渲染博客卡片
            blogs.forEach(blog => {
                const blogCard = createBlogCard(blog);
                blogGrid.appendChild(blogCard);
            });
        })
        .catch(error => {
            console.error('加载博客文章失败:', error);
            showNotification('加载博客文章失败，请刷新页面重试', 5000);
        });
}

// 更新热门文章列表
function updatePopularArticles() {
    // 使用API获取热门文章
    window.blogAPI.getPopularPosts()
        .then(articles => {
            // 将API响应转换为需要的格式
            const topArticles = articles.map(article => ({
                id: article.id,
                title: article.title,
                count: article.viewCount,
                category: article.category || '未分类'
            }));
            
            // 更新热门文章列表
            updatePopularArticlesList(topArticles);
        })
        .catch(error => {
            console.error('获取热门文章失败:', error);
        });
}

// 更新热门文章列表UI
function updatePopularArticlesList(articles) {
    const popularPostsList = document.querySelector('.sidebar-posts');
    if (!popularPostsList) return;
    
    // 清空列表
    popularPostsList.innerHTML = '';
    
    // 如果没有热门文章
    if (!articles || articles.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'no-popular-posts';
        emptyMessage.textContent = '暂无热门文章';
        popularPostsList.appendChild(emptyMessage);
        return;
    }
    
    // 添加热门文章
    articles.forEach(article => {
        const newItem = document.createElement('li');
        const newLink = document.createElement('a');
        newLink.href = "#";
        newLink.className = "popular-post";
        newLink.setAttribute("data-title", article.title);
        newLink.setAttribute("data-category", article.category);
        newLink.setAttribute("data-blog-id", article.id);
        newLink.setAttribute("data-view-count", article.count || 0);
        newLink.textContent = article.title;
        
        // 添加点击事件
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const blogId = this.getAttribute('data-blog-id');
            showBlogDetail(blogId);
        });
        
        newItem.appendChild(newLink);
        popularPostsList.appendChild(newItem);
    });
} 