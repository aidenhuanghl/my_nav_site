// 博客功能交互脚本

document.addEventListener('DOMContentLoaded', function() {
    initBlogFunctionality();
});

function initBlogFunctionality() {
    // 初始化写博客模态框
    initWriteBlogModal();
    
    // 初始化博客分类筛选
    initBlogCategories();
    
    // 初始化博客搜索
    initBlogSearch();
    
    // 初始化博客分页
    initBlogPagination();
    
    // 初始化现有博客卡片的阅读全文功能
    initExistingBlogCards();
    
    // 加载用户发布的博客
    loadBlogPosts();
}

// 为现有静态博客卡片添加阅读全文功能
function initExistingBlogCards() {
    const readMoreLinks = document.querySelectorAll('.blog-card .blog-read-more');
    
    readMoreLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取父级博客卡片
            const blogCard = this.closest('.blog-card');
            if (!blogCard) return;
            
            // 获取博客信息
            const title = blogCard.querySelector('.blog-card-title').textContent;
            const excerpt = blogCard.querySelector('.blog-card-excerpt').textContent;
            const dateElement = blogCard.querySelector('.blog-card-date');
            const date = dateElement ? dateElement.textContent : new Date().toISOString().split('T')[0];
            
            // 获取标签
            const tags = [];
            blogCard.querySelectorAll('.blog-tag').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // 获取分类
            const categories = blogCard.getAttribute('data-categories') || '';
            const category = categories.split(',')[0] || 'tech';
            
            // 创建临时博客对象
            const blog = {
                id: 'static-' + index,
                title: title,
                content: excerpt + '\n\n这是预设的静态博客文章。您可以点击右下角的"写博客"按钮创建自己的博客内容。',
                date: date,
                author: '网站作者',
                category: category,
                tags: tags
            };
            
            // 显示博客详情
            showBlogDetail(blog);
        });
    });
}

// 写博客模态框
function initWriteBlogModal() {
    const writeBtn = document.querySelector('.write-blog-btn');
    const modal = document.querySelector('.write-blog-modal');
    const closeBtn = document.querySelector('.close-modal-btn');
    const form = document.querySelector('.write-blog-form');
    
    if (!writeBtn || !modal || !closeBtn) return;
    
    // 打开模态框
    writeBtn.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭模态框
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // 处理图片上传预览
    const imageInput = document.querySelector('#blog-image');
    let uploadedImageData = null;
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // 检查文件大小（限制为2MB）
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过2MB');
                e.target.value = '';
                return;
            }
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                e.target.value = '';
                return;
            }
            
            // 读取文件并转换为base64
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImageData = event.target.result;
                
                // 显示图片预览
                const previewContainer = document.querySelector('.image-preview-container') || document.createElement('div');
                if (!previewContainer.classList.contains('image-preview-container')) {
                    previewContainer.className = 'image-preview-container';
                    const previewLabel = document.createElement('p');
                    previewLabel.textContent = '图片预览:';
                    previewContainer.appendChild(previewLabel);
                    const previewImg = document.createElement('img');
                    previewImg.className = 'image-preview';
                    previewContainer.appendChild(previewImg);
                    imageInput.parentNode.appendChild(previewContainer);
                }
                
                const previewImg = previewContainer.querySelector('.image-preview');
                previewImg.src = uploadedImageData;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 表单提交
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const title = document.querySelector('#blog-title').value;
            const content = document.querySelector('#blog-content').value;
            const category = document.querySelector('#blog-category').value;
            const tags = document.querySelector('#blog-tags').value;
            
            if (!title || !content) {
                alert('请填写标题和内容');
                return;
            }
            
            // 保存博客（包含上传的图片数据）
            const newBlog = saveBlogPost(title, content, category, tags, uploadedImageData);
            
            // 提交成功
            alert('博客发布成功！');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            form.reset();
            
            // 清除图片预览
            const previewContainer = document.querySelector('.image-preview-container');
            if (previewContainer) {
                previewContainer.style.display = 'none';
            }
            uploadedImageData = null;
            
            // 刷新博客列表
            loadBlogPosts();
        });
    }
    
    // 保存草稿按钮
    const saveDraftBtn = document.querySelector('.save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            const title = document.querySelector('#blog-title').value || '无标题草稿';
            const content = document.querySelector('#blog-content').value || '';
            const category = document.querySelector('#blog-category').value;
            const tags = document.querySelector('#blog-tags').value;
            
            if (!content) {
                alert('请至少填写一些内容');
                return;
            }
            
            // 保存为草稿（包含上传的图片数据）
            const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
            const draft = {
                id: Date.now(),
                title,
                content,
                category,
                tags,
                date: new Date().toISOString(),
                imageData: uploadedImageData
            };
            
            drafts.push(draft);
            localStorage.setItem('blogDrafts', JSON.stringify(drafts));
            
            alert('草稿已保存');
        });
    }
}

// 博客分类筛选
function initBlogCategories() {
    const categories = document.querySelectorAll('.blog-category');
    const blogCards = document.querySelectorAll('.blog-card');
    
    if (!categories.length || !blogCards.length) return;
    
    categories.forEach(category => {
        category.addEventListener('click', function() {
            // 移除所有分类的active类
            categories.forEach(c => c.classList.remove('active'));
            
            // 给当前点击的分类添加active类
            this.classList.add('active');
            
            const filter = this.getAttribute('data-category');
            
            // 如果是"全部"类别，显示所有卡片
            if (filter === 'all') {
                blogCards.forEach(card => {
                    card.style.display = '';
                });
                return;
            }
            
            // 筛选博客卡片
            blogCards.forEach(card => {
                const cardCategories = card.getAttribute('data-categories');
                if (cardCategories && cardCategories.includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// 博客搜索
function initBlogSearch() {
    const searchForm = document.querySelector('.blog-search');
    const searchInput = document.querySelector('.blog-search input');
    const blogCards = document.querySelectorAll('.blog-card');
    
    if (!searchForm || !searchInput || !blogCards.length) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            blogCards.forEach(card => {
                card.style.display = '';
            });
            return;
        }
        
        blogCards.forEach(card => {
            const title = card.querySelector('.blog-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
            const tags = card.querySelectorAll('.blog-tag');
            
            let tagMatch = false;
            tags.forEach(tag => {
                if (tag.textContent.toLowerCase().includes(searchTerm)) {
                    tagMatch = true;
                }
            });
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm) || tagMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // 实时搜索（可选）
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (!searchTerm) {
            blogCards.forEach(card => {
                card.style.display = '';
            });
            return;
        }
        
        blogCards.forEach(card => {
            const title = card.querySelector('.blog-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// 博客分页功能
function initBlogPagination() {
    const paginationItems = document.querySelectorAll('.pagination-item');
    
    if (!paginationItems.length) return;
    
    paginationItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有分页项的active类
            paginationItems.forEach(p => p.classList.remove('active'));
            
            // 给当前点击的分页项添加active类
            this.classList.add('active');
            
            // 在实际应用中，这里应该加载对应页码的博客内容
            // 由于这是静态网站，我们仅做演示
            const page = this.getAttribute('data-page');
            console.log('加载博客页面:', page);
            
            // 模拟页面切换
            window.scrollTo({
                top: document.querySelector('#blog-section').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });
}

// 添加简单的博客帖子保存功能
function saveBlogPost(title, content, category, tags, imageData) {
    // 在实际应用中，这里应该与后端API交互
    // 由于这是静态网站，我们将博客数据保存在localStorage中
    let blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    const newBlog = {
        id: Date.now(),
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()),
        date: new Date().toISOString(),
        author: '网站作者',
        imageData: imageData // 保存图片数据
    };
    
    blogs.push(newBlog);
    localStorage.setItem('blogPosts', JSON.stringify(blogs));
    
    return newBlog;
}

// 加载博客帖子
function loadBlogPosts() {
    // 在实际应用中，这里应该从后端API加载博客数据
    // 由于这是静态网站，我们从localStorage中加载
    const blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const blogGrid = document.querySelector('.blog-grid');
    
    if (!blogGrid) return;
    
    // 如果没有保存的博客，不需要清空现有的示例博客
    if (blogs.length === 0) {
        return;
    }
    
    // 清空现有博客
    blogGrid.innerHTML = '';
    
    // 按日期排序，最新的排在前面
    blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 渲染博客卡片
    blogs.forEach(blog => {
        const blogCard = createBlogCard(blog);
        blogGrid.appendChild(blogCard);
    });
}

// 创建博客卡片
function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('data-categories', blog.category);
    
    // 格式化日期
    const date = new Date(blog.date);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // 截取摘要
    const excerpt = blog.content.length > 120 ? blog.content.substring(0, 120) + '...' : blog.content;
    
    // 确定要使用的图片URL
    let imageUrl;
    if (blog.imageData) {
        // 使用用户上传的图片
        imageUrl = blog.imageData;
    } else {
        // 使用默认图片
        imageUrl = 'images/blog-1.jpg'; // 默认图片
        
        // 根据分类选择图片
        if (blog.category.includes('tech') || blog.category.includes('web')) {
            imageUrl = 'images/webdev.jpg';
        } else if (blog.category.includes('ai')) {
            imageUrl = 'images/ai.jpg';
        } else if (blog.category.includes('japan')) {
            imageUrl = 'images/japan.jpg';
        } else if (blog.category.includes('social')) {
            imageUrl = 'images/social.jpg';
        }
    }
    
    card.innerHTML = `
        <div class="blog-card-image">
            <img src="${imageUrl}" alt="${blog.title}">
            <div class="blog-card-date">${formattedDate}</div>
        </div>
        <div class="blog-card-content">
            <div class="blog-card-tags">
                ${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
            <h3 class="blog-card-title">${blog.title}</h3>
            <p class="blog-card-excerpt">${excerpt}</p>
            <a href="#" class="blog-read-more" data-blog-id="${blog.id}">阅读全文 <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
    
    // 添加点击事件，显示博客详情
    const readMoreBtn = card.querySelector('.blog-read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const blogId = this.getAttribute('data-blog-id');
            showBlogDetail(blogId);
        });
    }
    
    return card;
}

// 显示博客详情
function showBlogDetail(blogIdOrObject) {
    let blog;
    
    // 如果传入的是对象，直接使用
    if (typeof blogIdOrObject === 'object') {
        blog = blogIdOrObject;
    } else {
        // 否则查找博客
        const blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        blog = blogs.find(b => b.id == blogIdOrObject);
        if (!blog) return;
    }
    
    // 创建博客详情模态框
    const detailModal = document.createElement('div');
    detailModal.className = 'blog-detail-modal';
    
    // 格式化日期
    let formattedDate;
    if (typeof blog.date === 'string') {
        if (blog.date.includes('T')) {
            // ISO格式日期
            const date = new Date(blog.date);
            formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        } else {
            // 已经格式化的日期
            formattedDate = blog.date;
        }
    } else {
        formattedDate = '未知日期';
    }
    
    // 确定博客详情中使用的图片
    let detailImageHtml = '';
    if (blog.imageData) {
        detailImageHtml = `<div class="blog-detail-image"><img src="${blog.imageData}" alt="${blog.title}"></div>`;
    }
    
    detailModal.innerHTML = `
        <div class="blog-detail-content">
            <div class="blog-detail-header">
                <h2>${blog.title}</h2>
                <button class="close-detail-btn">&times;</button>
            </div>
            <div class="blog-detail-meta">
                <span class="blog-detail-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                <span class="blog-detail-author"><i class="far fa-user"></i> ${blog.author || '网站作者'}</span>
                <span class="blog-detail-category"><i class="far fa-folder"></i> ${blog.category || '未分类'}</span>
            </div>
            <div class="blog-detail-tags">
                ${Array.isArray(blog.tags) ? blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('') : ''}
            </div>
            ${detailImageHtml}
            <div class="blog-detail-body">
                ${formatBlogContent(blog.content)}
            </div>
        </div>
    `;
    
    document.body.appendChild(detailModal);
    document.body.style.overflow = 'hidden';
    
    // 添加渐变效果
    setTimeout(() => {
        detailModal.classList.add('active');
    }, 10);
    
    // 关闭详情模态框
    const closeBtn = detailModal.querySelector('.close-detail-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            detailModal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(detailModal);
                document.body.style.overflow = '';
            }, 300);
        });
    }
    
    // 点击模态框外部关闭
    detailModal.addEventListener('click', function(e) {
        if (e.target === detailModal) {
            detailModal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(detailModal);
                document.body.style.overflow = '';
            }, 300);
        }
    });
}

// 格式化博客内容，支持简单的Markdown语法
function formatBlogContent(content) {
    if (!content) return '';
    
    // 将换行符转换为<br>
    let formatted = content.replace(/\n/g, '<br>');
    
    // 支持简单的Markdown语法
    // 标题
    formatted = formatted.replace(/## (.*?)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/### (.*?)$/gm, '<h3>$1</h3>');
    
    // 粗体和斜体
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 代码块
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return formatted;
}

// 博客管理功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('博客管理脚本已加载');
    
    // 初始化热门文章管理
    initPopularArticlesManagement();
    
    // 为现有的静态博客卡片添加事件监听器
    initExistingBlogCards();
    
    // 尝试从本地存储加载用户创建的博客
    loadBlogPosts();
    
    // 初始化写博客按钮
    initWriteBlogButton();
});

// 初始化热门文章管理
function initPopularArticlesManagement() {
    console.log('初始化热门文章管理');
    
    // 检查并隐藏已删除的热门文章
    hideDeletedPopularArticlesOnLoad();
}

// 页面加载时隐藏已删除的热门文章
function hideDeletedPopularArticlesOnLoad() {
    console.log('检查已删除的热门文章');
    const deletedPosts = JSON.parse(localStorage.getItem('deletedPopularPosts') || '[]');
    
    if (deletedPosts.length > 0) {
        console.log('找到已删除的热门文章:', deletedPosts);
        
        document.querySelectorAll('.popular-post').forEach(post => {
            const postTitle = post.getAttribute('data-title');
            if (deletedPosts.includes(postTitle)) {
                console.log('隐藏已删除的热门文章:', postTitle);
                const listItem = post.closest('li');
                if (listItem) {
                    listItem.style.display = 'none';
                }
            }
        });
    }
}

// 初始化写博客按钮
function initWriteBlogButton() {
    const writeBtn = document.getElementById('write-blog-btn');
    const modal = document.querySelector('.write-blog-modal');
    const closeBtn = document.querySelector('.close-modal-btn');
    const form = document.querySelector('.write-blog-form');
    const saveDraftBtn = document.querySelector('.save-draft-btn');
    
    if (writeBtn && modal) {
        // 打开模态框
        writeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 尝试加载草稿
            loadDraft();
        });
        
        // 关闭模态框
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // 保存草稿
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', function() {
                saveDraft();
                showNotification('草稿已保存');
            });
        }
        
        // 提交表单
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                publishBlog();
            });
        }
    }
}

// 保存草稿到本地存储
function saveDraft() {
    const title = document.getElementById('blog-title').value;
    const category = document.getElementById('blog-category').value;
    const tags = document.getElementById('blog-tags').value;
    const content = document.getElementById('blog-content').value;
    
    const draft = {
        title: title,
        category: category,
        tags: tags,
        content: content,
        lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('blogDraft', JSON.stringify(draft));
}

// 从本地存储加载草稿
function loadDraft() {
    const draftJson = localStorage.getItem('blogDraft');
    if (draftJson) {
        const draft = JSON.parse(draftJson);
        
        document.getElementById('blog-title').value = draft.title || '';
        document.getElementById('blog-category').value = draft.category || 'tech';
        document.getElementById('blog-tags').value = draft.tags || '';
        document.getElementById('blog-content').value = draft.content || '';
    }
}

// 发布博客
function publishBlog() {
    const title = document.getElementById('blog-title').value;
    const category = document.getElementById('blog-category').value;
    const tagsInput = document.getElementById('blog-tags').value;
    const content = document.getElementById('blog-content').value;
    
    // 验证必填字段
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    // 处理标签
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    // 创建博客对象
    const blog = {
        id: 'user-' + Date.now(),
        title: title,
        category: category,
        tags: tags,
        content: content,
        date: new Date().toISOString().split('T')[0],
        author: '博客作者'
    };
    
    // 获取图片
    const imageFile = document.getElementById('blog-image').files[0];
    if (imageFile) {
        // 实际项目中这里应该上传图片到服务器
        // 这里为了演示，我们使用FileReader读取图片为Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            blog.imageUrl = e.target.result;
            saveBlogToLocalStorage(blog);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveBlogToLocalStorage(blog);
    }
}

// 将博客保存到本地存储
function saveBlogToLocalStorage(blog) {
    let userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
    userBlogs.push(blog);
    localStorage.setItem('userBlogs', JSON.stringify(userBlogs));
    
    // 清除草稿
    localStorage.removeItem('blogDraft');
    
    // 关闭模态框
    document.querySelector('.write-blog-modal').classList.remove('active');
    document.body.style.overflow = '';
    
    // 重新加载博客
    loadBlogPosts();
    
    // 显示成功消息
    showNotification('博客已成功发布');
}

// 显示通知消息
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 