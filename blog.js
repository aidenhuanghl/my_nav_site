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
            
            // 保存博客
            const newBlog = saveBlogPost(title, content, category, tags);
            
            // 提交成功
            alert('博客发布成功！');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            form.reset();
            
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
            
            // 保存为草稿
            const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
            const draft = {
                id: Date.now(),
                title,
                content,
                category,
                tags,
                date: new Date().toISOString()
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
function saveBlogPost(title, content, category, tags) {
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
        author: '网站作者'
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
    
    card.innerHTML = `
        <div class="blog-card-image">
            <img src="https://source.unsplash.com/random/800x500/?${blog.category}" alt="${blog.title}">
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