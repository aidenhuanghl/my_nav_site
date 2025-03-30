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
    
    // 初始化热门文章链接点击
    initPopularPostLinks();
    
    // 加载时隐藏已删除的热门文章 (Moved from index.html)
    hideDeletedPopularPosts();
    
    // 加载用户发布的博客
    loadBlogPosts();
    
    // 添加一个清理测试文章的按钮
    addCleanupButton();
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
            
            // 检查是否已有预设的博客ID
            const blogId = this.getAttribute('data-blog-id') || ('static-' + index);
            
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
                id: blogId,
                title: title,
                content: excerpt + '\n\n这是预设的静态博客文章。您可以点击右下角的"写博客"按钮创建自己的博客内容。',
                date: date,
                author: '网站作者',
                category: category,
                tags: tags
            };
            
            console.log('Opening blog with ID:', blogId);
            
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
            const newBlog = saveBlogPost(title, content, category, tags, uploadedImageData, false);
            
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
function saveBlogPost(title, content, category, tags, imageData, isPopular) {
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
        imageData: imageData, // 保存图片数据
        isPopular: isPopular || false, // 是否设为热门文章
        viewCount: 0 // 初始浏览量为0
    };
    
    blogs.push(newBlog);
    localStorage.setItem('blogPosts', JSON.stringify(blogs));
    
    // 如果设为热门文章，添加到热门文章列表
    if (isPopular) {
        addToPopularArticles(newBlog);
    }
    
    return newBlog;
}

// 将文章添加到热门文章列表
function addToPopularArticles(blog) {
    const popularPostsList = document.querySelector('.sidebar-posts');
    if (popularPostsList) {
        const newItem = document.createElement('li');
        const newLink = document.createElement('a');
        newLink.href = "#";
        newLink.className = "popular-post";
        newLink.setAttribute("data-title", blog.title);
        newLink.setAttribute("data-category", blog.category);
        newLink.setAttribute("data-blog-id", blog.id);
        newLink.setAttribute("data-view-count", blog.viewCount || 0);
        newLink.textContent = blog.title;
        
        // 添加点击事件
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const title = this.getAttribute('data-title');
            const category = this.getAttribute('data-category');
            const blogId = this.getAttribute('data-blog-id') || ('popular-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
            
            // 使用已有的博客ID查找博客对象
            let userBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            let blog = userBlogs.find(b => b.id == blogId);
            
            if (!blog) {
                // 如果找不到，创建一个临时对象
                blog = {
                    id: blogId,
                    title: title,
                    content: "这是热门文章的摘要或部分内容。详细内容正在加载或编写中...",
                    date: new Date().toISOString().split('T')[0],
                    author: '网站作者',
                    category: category,
                    tags: [category],
                    imageUrl: null,
                    viewCount: parseInt(this.getAttribute('data-view-count') || '0')
                };
            }
            
            showBlogDetail(blog);
        });
        
        newItem.appendChild(newLink);
        popularPostsList.appendChild(newItem);
    }
}

// 递增文章浏览量并更新排序
function incrementViewCount(blogId, blogTitle, category) {
    // 获取视图计数数据
    let viewCounts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    
    // 为指定的博客ID递增计数
    if (!viewCounts[blogId]) {
        viewCounts[blogId] = {
            count: 0,
            title: blogTitle,
            category: category || '未分类'
        };
    }
    viewCounts[blogId].count++;
    
    // 保存更新后的视图计数
    localStorage.setItem('blogViewCounts', JSON.stringify(viewCounts));
    
    // 如果是用户创建的博客，也更新其浏览量
    let userBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const blogIndex = userBlogs.findIndex(b => b.id == blogId);
    if (blogIndex !== -1) {
        userBlogs[blogIndex].viewCount = (userBlogs[blogIndex].viewCount || 0) + 1;
        localStorage.setItem('blogPosts', JSON.stringify(userBlogs));
    }
    
    // 更新热门文章列表中的计数
    const popularPost = document.querySelector(`.popular-post[data-blog-id="${blogId}"]`) || 
                        document.querySelector(`.popular-post[data-title="${blogTitle}"]`);
    if (popularPost) {
        popularPost.setAttribute('data-view-count', viewCounts[blogId].count);
    }
    
    // 使用防抖动方式更新热门文章列表，避免递归调用
    if (!window.updatePopularArticlesTimeout) {
        window.updatePopularArticlesTimeout = setTimeout(() => {
            // 避免在浏览量增加过程中重复调用updatePopularArticles
            try {
                updatePopularArticles();
            } catch (error) {
                console.error('更新热门文章列表时出错:', error);
            }
            window.updatePopularArticlesTimeout = null;
        }, 500);
    }
    
    // 更新控制台记录
    console.log(`文章"${blogTitle}"的浏览量增加到 ${viewCounts[blogId].count}`);
    
    return viewCounts[blogId].count;
}

// 更新热门文章列表，完全基于浏览量自动排序
function updatePopularArticles() {
    // 获取所有浏览量数据
    const viewCounts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    
    // 将对象转换为数组以便排序
    let articlesWithViews = [];
    for (const blogId in viewCounts) {
        if (viewCounts[blogId].count > 0) { // 只考虑有浏览量的文章
            articlesWithViews.push({
                id: blogId,
                title: viewCounts[blogId].title,
                count: viewCounts[blogId].count,
                category: viewCounts[blogId].category || '未分类'
            });
        }
    }
    
    // 根据浏览量排序
    articlesWithViews.sort((a, b) => b.count - a.count);
    
    // 选择前N篇文章（例如前10篇）
    const topArticles = articlesWithViews.slice(0, 10);
    
    // 更新热门文章列表
    updatePopularArticlesList(topArticles);
}

// 更新热门文章列表的UI
function updatePopularArticlesList(articles) {
    const popularPostsList = document.querySelector('.sidebar-posts');
    if (!popularPostsList) return;
    
    // 保留原始的静态热门文章
    const staticPopularPosts = Array.from(popularPostsList.querySelectorAll('li')).filter(item => {
        const link = item.querySelector('.popular-post');
        if (!link) return false;
        const blogId = link.getAttribute('data-blog-id');
        // 如果没有blogId或者不是以'popular-'开头，视为静态热门文章
        return !blogId || !blogId.startsWith('popular-');
    });
    
    // 清空现有列表
    popularPostsList.innerHTML = '';
    
    // 先添加基于浏览量的文章
    articles.forEach(article => {
        // 只添加有一定浏览量的文章（浏览量>0）
        if (article.count > 0) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            
            link.href = "#";
            link.className = "popular-post";
            link.setAttribute("data-title", article.title);
            link.setAttribute("data-category", article.category);
            link.setAttribute("data-blog-id", article.id);
            link.setAttribute("data-view-count", article.count);
            link.textContent = article.title;
            
            // 添加点击事件
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showBlogDetail(article.id);
            });
            
            li.appendChild(link);
            popularPostsList.appendChild(li);
        }
    });
    
    // 如果基于浏览量的文章不足6篇，补充静态热门文章
    if (articles.length < 6 && staticPopularPosts.length > 0) {
        const remainingSlots = 6 - articles.length;
        
        for (let i = 0; i < Math.min(remainingSlots, staticPopularPosts.length); i++) {
            popularPostsList.appendChild(staticPopularPosts[i].cloneNode(true));
        }
        
        // 为新添加的静态热门文章添加事件监听器
        initPopularPostLinksNoRecursion();
    }
}

// 初始化热门文章链接 - 不递归调用updatePopularArticles
function initPopularPostLinksNoRecursion() {
    document.querySelectorAll('.popular-post').forEach(postLink => {
        // 移除现有的监听器，防止重复
        const clonedLink = postLink.cloneNode(true);
        if (postLink.parentNode) {
            postLink.parentNode.replaceChild(clonedLink, postLink);
        }
        
        clonedLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const title = this.getAttribute('data-title');
            const category = this.getAttribute('data-category') || '未分类'; 
            const blogId = this.getAttribute('data-blog-id') || ('popular-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
            
            // 创建一个临时博客对象
            const blog = {
                id: blogId,
                title: title,
                content: "这是热门文章的摘要或部分内容。详细内容正在加载或编写中...",
                date: new Date().toISOString().split('T')[0],
                author: '网站作者',
                category: category,
                tags: [category],
                imageUrl: null,
                viewCount: parseInt(this.getAttribute('data-view-count') || '0')
            };
            
            // 使用统一的showBlogDetail函数
            showBlogDetail(blog);
        });
    });
}

// 初始化热门文章链接 - 主函数
function initPopularPostLinks() {
    initPopularPostLinksNoRecursion();
    
    // 初始化时排序热门文章，但不再引起递归
    // 改为使用try-catch捕获任何可能的错误
    try {
        // 创建一个防抖动函数，确保updatePopularArticles不会被频繁调用
        if (!window.popularArticlesUpdateTimeout) {
            window.popularArticlesUpdateTimeout = setTimeout(() => {
                updatePopularArticles();
                window.popularArticlesUpdateTimeout = null;
            }, 300);
        }
    } catch (error) {
        console.error('初始化热门文章排序时出错:', error);
    }
}

// 更新发布博客函数
function publishBlog() {
    const title = document.getElementById('blog-title').value;
    const category = document.getElementById('blog-category').value;
    const tagsInput = document.getElementById('blog-tags').value;
    const content = document.getElementById('blog-content').value;
    const isPopular = document.getElementById('blog-is-popular').checked;
    
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
        author: '博客作者',
        isPopular: isPopular,
        viewCount: 0
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
    
    // 如果设为热门文章，添加到热门文章列表
    if (blog.isPopular) {
        addToPopularArticles(blog);
    }
    
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

// 显示删除确认模态框
function showDeleteConfirmation(blogId, parentModal) {
    // 创建确认模态框
    const confirmModal = document.createElement('div');
    confirmModal.className = 'delete-confirm-modal';

    confirmModal.innerHTML = `
        <div class="delete-confirm-content">
            <h3>确认删除</h3>
            <p>您确定要删除这篇博客文章吗？此操作无法撤销。</p>
            <div class="delete-confirm-actions">
                <button class="cancel-delete-btn">取消</button>
                <button class="confirm-delete-btn" data-blog-id="${blogId}">确认删除</button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmModal);

    // 添加渐变效果
    setTimeout(() => {
        confirmModal.classList.add('active');
    }, 10);

    // 取消删除
    const cancelBtn = confirmModal.querySelector('.cancel-delete-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            confirmModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(confirmModal)) {
                    document.body.removeChild(confirmModal);
                }
            }, 300);
        });
    }

    // 确认删除
    const confirmBtn = confirmModal.querySelector('.confirm-delete-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const blogIdToDelete = this.getAttribute('data-blog-id');

            // 执行删除操作
            deleteBlog(blogIdToDelete);

            // 关闭确认模态框
            confirmModal.classList.remove('active');
            setTimeout(() => {
                 if (document.body.contains(confirmModal)) {
                    document.body.removeChild(confirmModal);
                 }
            }, 300);

            // 关闭父级博客详情模态框
            if (parentModal && document.body.contains(parentModal)) {
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
}

// 删除博客文章 (Handles static, popular, and user blogs)
function deleteBlog(blogId) {
    console.log('尝试删除博客，ID:', blogId);

    let deleted = false;
    let blogTitle = blogTitleFromId(blogId); // Try to get title early

    // Handle popular posts deletion (identified by title stored in localStorage)
    if (blogId.startsWith('popular-')) {
        saveDeletedPopularPost(blogTitle); // Save title to localStorage
        // Attempt to remove from DOM directly
        const popularPostElement = document.querySelector(`.popular-post[data-title="${blogTitle}"]`);
        if (popularPostElement) {
            const listItem = popularPostElement.closest('li');
            if (listItem) {
                 listItem.style.opacity = '0';
                 listItem.style.height = '0';
                 setTimeout(() => {
                     if (listItem.parentNode) {
                         listItem.parentNode.removeChild(listItem);
                     }
                 }, 500);
                 deleted = true;
            }
        } else {
             // Fallback: iterate and check data-title if direct match failed
             document.querySelectorAll('.popular-post').forEach(post => {
                if (post.getAttribute('data-title') === blogTitle) {
                    saveDeletedPopularPost(post.getAttribute('data-title')); // Ensure correct title saved
                    const listItem = post.closest('li');
                    if (listItem) {
                        listItem.style.opacity = '0';
                        listItem.style.height = '0';
                        setTimeout(() => {
                             if (listItem.parentNode) {
                                 listItem.parentNode.removeChild(listItem);
                             }
                        }, 500);
                        deleted = true;
                    }
                }
            });
        }
    }
    // Handle static blog cards (identified by index)
    else if (blogId.startsWith('static-')) {
        const index = parseInt(blogId.replace('static-', ''), 10);
        const allBlogCards = document.querySelectorAll('.blog-grid .blog-card'); // Be more specific

        if (!isNaN(index) && index >= 0 && index < allBlogCards.length) {
            const blogCard = allBlogCards[index];
            if (blogCard && blogCard.parentNode) { // Check parentNode exists
                 blogCard.style.opacity = '0';
                 blogCard.style.transform = 'scale(0.8)';
                 setTimeout(() => {
                    if (blogCard.parentNode) {
                        blogCard.parentNode.removeChild(blogCard);
                        checkIfBlogGridEmpty(); // Check if grid is empty after removal
                    }
                 }, 500);
                 deleted = true;
            }
        }
    }
    // Handle user-created blog posts (from localStorage)
    else {
        let userBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const initialLength = userBlogs.length;
        userBlogs = userBlogs.filter(blog => blog.id != blogId); // Use != for potential type difference

        if (userBlogs.length < initialLength) {
            localStorage.setItem('blogPosts', JSON.stringify(userBlogs));
            deleted = true;
            // Re-render the blog list to reflect the deletion
            loadBlogPosts();
        }
    }

    if (deleted) {
        showNotification('博客文章已成功删除');
    } else {
        console.warn('未能删除博客，ID 未匹配:', blogId);
        showNotification('删除博客文章失败');
    }
}

// Helper to check if the blog grid is empty and add a message
function checkIfBlogGridEmpty() {
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid && blogGrid.children.length === 0) {
         if (!blogGrid.querySelector('.no-blogs')) {
             const noBlogsMessage = document.createElement('div');
             noBlogsMessage.className = 'no-blogs';
             noBlogsMessage.textContent = '暂无博客文章，点击右下角按钮开始写作吧！';
             blogGrid.appendChild(noBlogsMessage);
         }
    } else if (blogGrid && blogGrid.querySelector('.no-blogs')) {
         // Remove message if grid is no longer empty
         const noBlogsMessage = blogGrid.querySelector('.no-blogs');
         if (noBlogsMessage) {
             blogGrid.removeChild(noBlogsMessage);
         }
    }
}

// 从博客ID提取标题
function blogTitleFromId(blogId) {
     // Try getting title from the open modal first (most reliable for popular posts)
    const openModal = document.querySelector('.blog-detail-modal.active');
    if (openModal) {
        const titleElement = openModal.querySelector('.blog-detail-header h2');
        if (titleElement) return titleElement.textContent;
    }

    // Try finding popular post element by data-blog-id if available
    if (typeof blogId === 'string' && blogId.startsWith('popular-')) {
         const popularPostElement = document.querySelector(`.popular-post[data-blog-id="${blogId}"]`);
         if (popularPostElement) {
             return popularPostElement.getAttribute('data-title');
         }
         // Fallback for older popular post ID format or if data-blog-id is missing
         const titleFromId = blogId.replace(/^popular-/, '').replace(/-/g, ' ');
         // Attempt to find by title match (less reliable)
         const posts = document.querySelectorAll('.popular-post');
         for (const post of posts) {
            const dataTitle = post.getAttribute('data-title');
            // Normalize titles for comparison
            if (dataTitle && dataTitle.toLowerCase().replace(/\s+/g, ' ') === titleFromId.toLowerCase()) {
                return dataTitle; // Return the actual title from data-attribute
            }
         }
         return titleFromId; // Return parsed title as last resort
    }

     // Handle static posts - title isn't stored reliably with just index, return generic
     if (typeof blogId === 'string' && blogId.startsWith('static-')) {
         return '静态博客文章'; // Or try to find card by index and get title? Less reliable after deletions.
     }

     // Handle user blogs - retrieve from localStorage
     if (typeof blogId !== 'object') { // If it's an ID, not the object itself
        const blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const blog = blogs.find(b => b.id == blogId);
        if (blog) return blog.title;
     }

    return '未知文章'; // Default fallback
}

// 保存已删除的热门文章标题
function saveDeletedPopularPost(title) {
    if (!title || title === '未知文章') return; // Avoid saving invalid titles
    let deletedPosts = JSON.parse(localStorage.getItem('deletedPopularPosts') || '[]');
    if (!deletedPosts.includes(title)) {
        deletedPosts.push(title);
        localStorage.setItem('deletedPopularPosts', JSON.stringify(deletedPosts));
        console.log('已记录删除的热门文章标题:', title);
    }
}

// 在初始化时检查和隐藏已删除的热门文章
function hideDeletedPopularPosts() {
    const deletedPosts = JSON.parse(localStorage.getItem('deletedPopularPosts') || '[]');
    if (deletedPosts.length > 0) {
        document.querySelectorAll('.popular-post').forEach(post => {
            const postTitle = post.getAttribute('data-title');
            if (postTitle && deletedPosts.includes(postTitle)) {
                const listItem = post.closest('li');
                if (listItem) {
                    listItem.style.display = 'none';
                }
            }
        });
    }
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
        let blogId; // Ensure we have a consistent blogId

        // Determine blog object and blogId
        if (typeof blogIdOrObject === 'object' && blogIdOrObject !== null) {
            blog = blogIdOrObject;
            blogId = blog.id || ('blog-' + Date.now()); // Assign an ID if missing
            console.log('Processing blog object, extracted ID:', blogId);
            // Ensure the passed object gets a proper ID if it's missing one before use
            if (!blog.id) {
                 blog.id = blogId;
            }
        } else {
            // If it's an ID, find the blog post
            blogId = blogIdOrObject;
            console.log('Processing blog ID:', blogId);
            const userBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            const staticBlogs = []; // Need a way to represent static blogs if finding by ID

            // Attempt to find in user blogs first
            blog = userBlogs.find(b => b.id == blogId);

            // 如果未找到，尝试查找热门文章
            if (!blog) {
                console.warn('Could not find blog by ID:', blogId, '. Creating a placeholder blog.');
                // 创建一个默认的博客对象而不是直接返回
                if (blogId.startsWith('popular-')) {
                    // 尝试从ID中提取标题信息
                    const titleFromId = blogId.replace(/^popular-/, '').replace(/-/g, ' ');
                    blog = {
                        id: blogId,
                        title: titleFromId || '热门文章',
                        content: "这是热门文章的摘要或部分内容。详细内容正在加载或编写中...",
                        date: new Date().toISOString().split('T')[0],
                        author: '网站作者',
                        category: '未分类',
                        tags: ['热门'],
                        imageUrl: null,
                        viewCount: 0
                    };
                } else if (blogId.startsWith('static-')) {
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
                } else {
                    blog = {
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
                }
            }
        }

        // If blog is still not found, exit
        if (!blog) {
             console.error('Blog object could not be determined for:', blogIdOrObject);
             window._showingBlogDetail = false;
             return;
        }

        // 使用try-catch包裹递增浏览量操作，避免错误中断流程
        let currentViewCount = 0;
        try {
            // 递增文章浏览量，传递分类信息
            currentViewCount = incrementViewCount(blogId, blog.title, blog.category);
        } catch (error) {
            console.error('递增浏览量时出错:', error);
        }

        // 检查是否已有模态框
        const existingModal = document.querySelector('.blog-detail-modal');
        if (existingModal) {
            console.log('删除已存在的模态框，避免重复');
            document.body.removeChild(existingModal);
        }
        
        // --- Create Modal ---
        const detailModal = document.createElement('div');
        detailModal.className = 'blog-detail-modal';
        
        console.log('开始创建博客详情模态框:', detailModal);
        
        // Format date
        let formattedDate = '未知日期';
        if (blog.date) {
           try {
               // Handle different date formats gracefully
               const dateObj = new Date(blog.date);
               if (!isNaN(dateObj.getTime())) { // Check if date is valid
                   formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
               } else if (typeof blog.date === 'string') {
                   // If it's a string but not parsable, use it as is (might be pre-formatted)
                   formattedDate = blog.date;
               }
           } catch (e) {
               console.error('Error parsing date:', blog.date, e);
               formattedDate = typeof blog.date === 'string' ? blog.date : '无效日期'; // Fallback
           }
        }

        // Image HTML
        let detailImageHtml = '';
        // Use imageData (from user posts/drafts) or imageUrl (from static posts)
        const imageSource = blog.imageData || blog.imageUrl;
        if (imageSource) {
            detailImageHtml = `<div class="blog-detail-image"><img src="${imageSource}" alt="${blog.title || '博客图片'}"></div>`;
        }
        
        // 为所有博客文章显示删除按钮，不再根据类型区分
        const deleteButtonHtml = `<button class="blog-detail-delete" data-blog-id="${blogId}"><i class="fas fa-trash"></i> 删除</button>`;

        // --- Set Modal Inner HTML (Always include Delete Button) ---
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
                    <span class="blog-detail-views"><i class="far fa-eye"></i> ${currentViewCount || 0}</span>
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

        // 确保在添加到DOM之前，模态框内容已设置
        console.log('模态框HTML已设置:', detailModal.innerHTML.length > 0 ? '有内容' : '无内容');
        
        // 将模态框添加到文档体
        document.body.appendChild(detailModal);
        console.log('模态框已添加到文档体', document.body.contains(detailModal) ? '成功' : '失败');
        
        document.body.style.overflow = 'hidden';

        // Add fade-in effect with a small delay to ensure DOM update
        setTimeout(() => {
            console.log('尝试激活模态框...');
            detailModal.classList.add('active');
            console.log('模态框CSS类:', detailModal.className);
            
            // 立即检查模态框是否可见
            const modalComputed = window.getComputedStyle(detailModal);
            console.log('模态框计算样式 - opacity:', modalComputed.opacity, 'visibility:', modalComputed.visibility, 'display:', modalComputed.display);
            
            // 确保模态框计算样式正确
            if (modalComputed.opacity !== '1' || modalComputed.visibility !== 'visible') {
                console.warn('模态框可能存在样式问题，尝试强制设置内联样式');
                detailModal.style.opacity = '1';
                detailModal.style.visibility = 'visible';
                detailModal.style.display = 'flex';
                detailModal.style.pointerEvents = 'auto';
            }
        }, 50);

        // --- Add Event Listeners ---

        // Close button
        const closeBtn = detailModal.querySelector('.close-detail-btn');
        if (closeBtn) {
            console.log('关闭按钮已找到');
            closeBtn.addEventListener('click', () => {
                console.log('关闭按钮被点击');
                detailModal.classList.remove('active');
                setTimeout(() => {
                     if (document.body.contains(detailModal)) {
                        document.body.removeChild(detailModal);
                        document.body.style.overflow = '';
                        console.log('模态框已从DOM中移除');
                     }
                }, 300);
            });
        } else {
            console.warn('未找到关闭按钮');
        }

        // Delete button
        const deleteBtn = detailModal.querySelector('.blog-detail-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent modal close if clicking button area
                const currentBlogId = deleteBtn.getAttribute('data-blog-id');
                console.log('Delete button clicked from showBlogDetail, ID:', currentBlogId);
                showDeleteConfirmation(currentBlogId, detailModal); // Call the confirmation modal
            });
        }

        // Click outside modal to close
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                 console.log('模态框外部被点击，准备关闭');
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
        console.error('显示博客详情时出错:', error);
    } finally {
        // 确保标志被重置
        setTimeout(() => {
            window._showingBlogDetail = false;
        }, 500);
    }
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
    
    // 获取浏览量
    const viewCounts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    const viewCount = viewCounts[blog.id] ? viewCounts[blog.id].count : 0;
    
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
            <div class="blog-card-footer">
                <a href="#" class="blog-read-more" data-blog-id="${blog.id}">阅读全文 <i class="fas fa-arrow-right"></i></a>
                <span class="blog-view-count"><i class="far fa-eye"></i> ${viewCount}</span>
            </div>
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
    const isPopular = document.getElementById('blog-is-popular').checked;
    
    const draft = {
        title: title,
        category: category,
        tags: tags,
        content: content,
        isPopular: isPopular,
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
        
        // 设置热门文章复选框
        if (draft.isPopular) {
            document.getElementById('blog-is-popular').checked = true;
        }
    }
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

// 在页面加载完成后初始化浏览量统计和热门文章排序
document.addEventListener('DOMContentLoaded', function() {
    // 初始化其他功能...
    
    // 初始化热门文章浏览量
    initViewCountsForPopularPosts();
    
    // 更新热门文章列表
    updatePopularArticles();
});

// 初始化所有热门文章的浏览量统计
function initViewCountsForPopularPosts() {
    const viewCounts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    
    // 为每个热门文章设置默认浏览量
    document.querySelectorAll('.popular-post').forEach(post => {
        const title = post.getAttribute('data-title');
        const blogId = post.getAttribute('data-blog-id') || 
                       ('popular-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
        
        // 如果没有记录浏览量，设置为0
        if (!viewCounts[blogId]) {
            viewCounts[blogId] = {
                count: 0,
                title: title
            };
        }
        
        // 更新浏览量显示
        post.setAttribute('data-view-count', viewCounts[blogId].count);
    });
    
    // 保存更新后的浏览量数据
    localStorage.setItem('blogViewCounts', JSON.stringify(viewCounts));
    
    // 初始更新热门文章
    updatePopularArticles();
}

// 清理所有测试文章
function cleanupTestArticles() {
    console.log('开始清理测试文章...');
    
    // 清理博客浏览量数据
    let viewCounts = JSON.parse(localStorage.getItem('blogViewCounts') || '{}');
    let cleanedViewCounts = {};
    
    // 遍历所有浏览量数据，过滤掉测试文章
    for (const blogId in viewCounts) {
        if (!blogId.startsWith('test-')) {
            cleanedViewCounts[blogId] = viewCounts[blogId];
        }
    }
    
    // 保存清理后的浏览量数据
    localStorage.setItem('blogViewCounts', JSON.stringify(cleanedViewCounts));
    
    // 清理用户博客数据
    let blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    let cleanedBlogPosts = blogPosts.filter(blog => !blog.id.toString().startsWith('test-'));
    
    // 保存清理后的博客数据
    localStorage.setItem('blogPosts', JSON.stringify(cleanedBlogPosts));
    
    // 清理userBlogs数据（如果有）
    let userBlogs = JSON.parse(localStorage.getItem('userBlogs') || '[]');
    let cleanedUserBlogs = userBlogs.filter(blog => !blog.id.toString().startsWith('test-'));
    
    // 保存清理后的用户博客数据
    localStorage.setItem('userBlogs', JSON.stringify(cleanedUserBlogs));
    
    // 显示清理完成通知
    showNotification('测试文章已全部清理完成');
    
    console.log('测试文章清理完成');
    
    // 刷新页面以反映更改
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// 添加清理测试文章的按钮
function addCleanupButton() {
    const cleanupBtn = document.createElement('button');
    cleanupBtn.textContent = '清理测试文章';
    cleanupBtn.style.position = 'fixed';
    cleanupBtn.style.bottom = '70px';
    cleanupBtn.style.right = '20px';
    cleanupBtn.style.zIndex = '9999';
    cleanupBtn.style.padding = '8px 12px';
    cleanupBtn.style.backgroundColor = '#ff5722';
    cleanupBtn.style.color = 'white';
    cleanupBtn.style.border = 'none';
    cleanupBtn.style.borderRadius = '4px';
    cleanupBtn.style.cursor = 'pointer';
    cleanupBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    cleanupBtn.style.fontSize = '14px';
    
    cleanupBtn.addEventListener('click', function() {
        if (confirm('确定要清理所有测试文章吗？此操作不可撤销。')) {
            cleanupTestArticles();
        }
    });
    
    document.body.appendChild(cleanupBtn);
} 