// 检测是否需要从localStorage迁移数据到MongoDB
document.addEventListener('DOMContentLoaded', async function() {
    // 检查是否有迁移标志
    const dataMigrated = localStorage.getItem('dataMigratedToMongoDB');
    
    if (!dataMigrated) {
        try {
            // 显示加载提示
            showNotification('正在迁移数据到MongoDB，请稍候...', 3000);
            
            // 迁移数据
            await window.blogAPI.importFromLocalStorage();
            
            // 设置迁移标志
            localStorage.setItem('dataMigratedToMongoDB', 'true');
            
            // 显示成功消息
            showNotification('数据成功迁移到MongoDB!', 3000);
        } catch (error) {
            console.error('数据迁移失败:', error);
            showNotification('数据迁移失败，请刷新页面重试', 5000);
        }
    }
    
    // 初始化博客功能
    initBlogFunctionality();
});

function initBlogFunctionality() {
    console.log("初始化博客功能...");
    
    // 检查API服务器配置
    checkAPIServerConfig();
    
    initPopularPostsCounters();
    updateBlogPostsList();
    updatePopularArticlesList();
    setupNewPostButton();
    setupDraftFunctionality();
}

// 检查API服务器配置
function checkAPIServerConfig() {
    const apiServerConfig = localStorage.getItem('api_server_config');
    
    if (apiServerConfig) {
        try {
            const config = JSON.parse(apiServerConfig);
            if (config.baseURL) {
                // 应用保存的API服务器配置
                blogAPI.setBaseURL(config.baseURL);
                console.log(`已从本地存储加载API服务器配置: ${config.baseURL}`);
            }
        } catch (error) {
            console.error('解析API服务器配置失败:', error);
        }
    }
    
    // 添加API服务器配置按钮
    addAPIConfigButton();
}

// 添加API服务器配置按钮
function addAPIConfigButton() {
    const controlsContainer = document.querySelector('.blog-controls') || createBlogControlsContainer();
    
    // 检查是否已存在配置按钮
    if (document.getElementById('api-config-button')) {
        return;
    }
    
    // 创建配置按钮
    const configButton = document.createElement('button');
    configButton.id = 'api-config-button';
    configButton.className = 'control-button';
    configButton.innerHTML = '<i class="fas fa-cog"></i> 配置API服务器';
    configButton.style.backgroundColor = '#4a6da7';
    configButton.style.color = 'white';
    configButton.style.marginLeft = '10px';
    
    // 添加点击事件
    configButton.addEventListener('click', showAPIConfigDialog);
    
    // 添加到控制容器
    controlsContainer.appendChild(configButton);
}

// 创建博客控制容器（如果不存在）
function createBlogControlsContainer() {
    const blogSection = document.querySelector('.blog-section');
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'blog-controls';
    controlsContainer.style.marginBottom = '20px';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'flex-end';
    
    // 将控制容器添加到博客区域的顶部
    if (blogSection.firstChild) {
        blogSection.insertBefore(controlsContainer, blogSection.firstChild);
    } else {
        blogSection.appendChild(controlsContainer);
    }
    
    return controlsContainer;
}

// 显示API配置对话框
function showAPIConfigDialog() {
    // 创建对话框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    
    // 创建对话框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '500px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    
    // 创建标题
    const title = document.createElement('h2');
    title.textContent = 'API服务器配置';
    title.style.marginTop = '0';
    title.style.color = '#333';
    
    // 创建当前配置信息
    const currentConfig = document.createElement('div');
    currentConfig.innerHTML = `<p><strong>当前API服务器:</strong> <span id="current-api-url">${blogAPI.getBaseURL()}</span></p>`;
    
    // 创建输入表单
    const form = document.createElement('form');
    form.style.marginTop = '20px';
    
    const inputGroup = document.createElement('div');
    inputGroup.style.marginBottom = '15px';
    
    const label = document.createElement('label');
    label.htmlFor = 'api-base-url';
    label.textContent = 'API服务器地址:';
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    label.style.fontWeight = 'bold';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'api-base-url';
    input.value = blogAPI.getBaseURL();
    input.placeholder = 'http://your-api-server.com/api';
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.boxSizing = 'border-box';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    
    // 创建测试连接结果显示区域
    const testResult = document.createElement('div');
    testResult.id = 'test-result';
    testResult.style.marginTop = '10px';
    testResult.style.padding = '8px';
    testResult.style.display = 'none';
    
    // 创建按钮容器
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.justifyContent = 'space-between';
    buttonGroup.style.marginTop = '20px';
    
    // 创建保存按钮
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = '保存配置';
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    // 创建测试连接按钮
    const testButton = document.createElement('button');
    testButton.type = 'button';
    testButton.textContent = '测试连接';
    testButton.style.padding = '8px 16px';
    testButton.style.backgroundColor = '#2196F3';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // 创建恢复默认按钮
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = '恢复默认';
    resetButton.style.padding = '8px 16px';
    resetButton.style.backgroundColor = '#607D8B';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    
    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    
    // 保存配置
    saveButton.addEventListener('click', function() {
        const newBaseURL = input.value.trim();
        if (newBaseURL) {
            // 更新API基础URL
            const success = blogAPI.setBaseURL(newBaseURL);
            
            if (success) {
                // 保存配置到localStorage
                localStorage.setItem('api_server_config', JSON.stringify({
                    baseURL: newBaseURL
                }));
                
                // 更新当前配置显示
                document.getElementById('current-api-url').textContent = newBaseURL;
                
                // 显示成功消息
                alert('API服务器配置已保存');
                
                // 关闭对话框
                document.body.removeChild(modal);
            } else {
                alert('无效的URL格式');
            }
        } else {
            alert('请输入有效的API服务器地址');
        }
    });
    
    // 测试连接
    testButton.addEventListener('click', async function() {
        const testURL = input.value.trim();
        if (!testURL) {
            alert('请输入API服务器地址');
            return;
        }
        
        // 更改按钮状态和文本
        testButton.disabled = true;
        testButton.textContent = '测试中...';
        
        // 显示测试结果区域
        testResult.style.display = 'block';
        testResult.textContent = '正在测试连接...';
        testResult.style.backgroundColor = '#FFF9C4';
        testResult.style.border = '1px solid #FBC02D';
        
        try {
            // 创建临时API实例进行测试
            const tempAPI = new BlogAPI(testURL);
            const result = await tempAPI.testConnection();
            
            if (result.connected) {
                testResult.textContent = `连接成功！延迟: ${result.latency}ms`;
                testResult.style.backgroundColor = '#E8F5E9';
                testResult.style.border = '1px solid #4CAF50';
            } else {
                testResult.textContent = `连接失败: ${result.error || '无法连接到API服务器'}`;
                testResult.style.backgroundColor = '#FFEBEE';
                testResult.style.border = '1px solid #F44336';
            }
        } catch (error) {
            testResult.textContent = `测试出错: ${error.message}`;
            testResult.style.backgroundColor = '#FFEBEE';
            testResult.style.border = '1px solid #F44336';
        } finally {
            // 恢复按钮状态
            testButton.disabled = false;
            testButton.textContent = '测试连接';
        }
    });
    
    // 恢复默认配置
    resetButton.addEventListener('click', function() {
        // 设置为默认值
        const defaultURL = 'http://localhost:3000/api';
        input.value = defaultURL;
        
        // 显示提示
        alert('已重置为默认API服务器地址，请点击"保存配置"以应用更改');
    });
    
    // 取消并关闭对话框
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // 组装对话框
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
    form.appendChild(inputGroup);
    form.appendChild(testResult);
    
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(testButton);
    buttonGroup.appendChild(resetButton);
    buttonGroup.appendChild(cancelButton);
    
    modalContent.appendChild(title);
    modalContent.appendChild(currentConfig);
    modalContent.appendChild(form);
    modalContent.appendChild(buttonGroup);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
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
    // 创建博客对象
    const newBlog = {
        title,
        content,
        category,
        tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags,
        imageData, // 保存图片数据
        isPopular: isPopular || false, // 是否设为热门文章
    };
    
    // 调用API保存到MongoDB
    return window.blogAPI.createPost(newBlog)
        .then(blog => {
            // 显示成功信息
            showNotification('博客发布成功！');
            return blog;
        })
        .catch(error => {
            console.error('保存博客失败:', error);
            showNotification('保存博客失败，请重试');
            throw error;
        });
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

// 更新热门文章列表的UI
function updatePopularArticlesList(articles) {
    const popularPostsList = document.querySelector('#popular-posts-container');
    if (!popularPostsList) return;
    
    // 清空现有列表
    popularPostsList.innerHTML = '';
    
    // 添加"无文章"提示
    const noPostsMessage = document.createElement('li');
    noPostsMessage.id = 'no-posts-message';
    noPostsMessage.textContent = '暂无文章';
    noPostsMessage.style.display = 'none';
    popularPostsList.appendChild(noPostsMessage);
    
    // 没有文章时显示提示信息
    if (!articles || articles.length === 0) {
        noPostsMessage.style.display = 'block';
        return;
    }
    
    // 去重 - 使用Map根据标题跟踪已添加的文章
    const addedArticles = new Map();
    
    // 添加基于浏览量的文章
    articles.forEach(article => {
        // 避免重复添加
        if (!addedArticles.has(article.title)) {
            addedArticles.set(article.title, true);
            
            const li = document.createElement('li');
            const link = document.createElement('a');
            
            link.href = "#";
            link.className = "popular-post";
            link.setAttribute("data-title", article.title);
            link.setAttribute("data-category", article.category || '未分类');
            link.setAttribute("data-blog-id", article.id);
            link.setAttribute("data-view-count", article.count || 0);
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
    
    // 检查并移除任何重复的文章（保险措施）
    removeDuplicateArticles();
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
            blog = blogIdOrObject;
            blogId = blog.id || ('blog-' + Date.now());
            console.log('Processing blog object, extracted ID:', blogId);
            if (!blog.id) {
                blog.id = blogId;
            }
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
            return;
        }
        
        // 如果已经有博客对象，直接显示详情
        displayBlogDetailModal(blog, blogId);
    } catch (error) {
        console.error('显示博客详情时出错:', error);
        window._showingBlogDetail = false;
    }
}

// 新增函数：显示博客详情模态框
function displayBlogDetailModal(blog, blogId) {
    try {
        let currentViewCount = blog.viewCount || 0;
        
        // 检查是否已有模态框
        const existingModal = document.querySelector('.blog-detail-modal');
        if (existingModal) {
            console.log('删除已存在的模态框，避免重复');
            document.body.removeChild(existingModal);
        }
        
        // 创建模态框
        const detailModal = document.createElement('div');
        detailModal.className = 'blog-detail-modal';
        
        console.log('开始创建博客详情模态框:', detailModal);
        
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
               console.error('Error parsing date:', blog.date, e);
               formattedDate = typeof blog.date === 'string' ? blog.date : '无效日期';
           }
        }
        
        // 图片HTML
        let detailImageHtml = '';
        const imageSource = blog.imageData || blog.imageUrl;
        if (imageSource) {
            detailImageHtml = `<div class="blog-detail-image"><img src="${imageSource}" alt="${blog.title || '博客图片'}"></div>`;
        }
        
        const deleteButtonHtml = `<button class="blog-detail-delete" data-blog-id="${blogId}"><i class="fas fa-trash"></i> 删除</button>`;
        
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
                    ${Array.isArray(blog.tags) ? blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('') : ''}
                </div>
                ${detailImageHtml}
                <div class="blog-detail-body">
                    ${formatBlogContent(blog.content)}
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
                showDeleteConfirmation(currentBlogId, detailModal);
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
    // 从MongoDB加载博客数据，而不是从localStorage加载
    window.blogAPI.getAllPosts()
        .then(blogs => {
            const blogGrid = document.querySelector('.blog-grid');
            
            if (!blogGrid) return;
            
            // 如果没有保存的博客，不需要清空现有的示例博客
            if (blogs.length === 0) {
                return;
            }
            
            // 清空现有博客
            blogGrid.innerHTML = '';
            
            // 按日期排序，最新的排在前面（服务器已排序，这里可以简化）
            
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
    
    const draft = {
        title: title || '无标题草稿',
        content,
        category,
        tags,
        imageData: null, // 如果有上传的图片，这里需要处理
        lastSaved: new Date().toISOString()
    };
    
    // 调用API保存草稿
    window.blogAPI.saveDraft(draft)
        .then(() => {
            showNotification('草稿已保存');
        })
        .catch(error => {
            console.error('保存草稿失败:', error);
            showNotification('保存草稿失败，请重试');
            
            // 作为备份，保存到localStorage
            localStorage.setItem('blogDraft', JSON.stringify(draft));
        });
}

// 从本地存储加载草稿
function loadDraft() {
    // 首先尝试从API加载草稿
    window.blogAPI.getAllDrafts()
        .then(drafts => {
            if (drafts && drafts.length > 0) {
                // 使用最新的草稿
                const latestDraft = drafts[0];
                
                document.getElementById('blog-title').value = latestDraft.title || '';
                document.getElementById('blog-category').value = latestDraft.category || 'tech';
                document.getElementById('blog-tags').value = latestDraft.tags || '';
                document.getElementById('blog-content').value = latestDraft.content || '';
            } else {
                // 如果没有从API加载到草稿，尝试从localStorage加载
                const draftJson = localStorage.getItem('blogDraft');
                if (draftJson) {
                    const draft = JSON.parse(draftJson);
                    
                    document.getElementById('blog-title').value = draft.title || '';
                    document.getElementById('blog-category').value = draft.category || 'tech';
                    document.getElementById('blog-tags').value = draft.tags || '';
                    document.getElementById('blog-content').value = draft.content || '';
                }
            }
        })
        .catch(error => {
            console.error('加载草稿失败:', error);
            
            // 失败时尝试从localStorage加载
            const draftJson = localStorage.getItem('blogDraft');
            if (draftJson) {
                const draft = JSON.parse(draftJson);
                
                document.getElementById('blog-title').value = draft.title || '';
                document.getElementById('blog-category').value = draft.category || 'tech';
                document.getElementById('blog-tags').value = draft.tags || '';
                document.getElementById('blog-content').value = draft.content || '';
            }
        });
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

// 清理所有测试文章 - 保留空方法以防被调用
function cleanupTestArticles() {
    console.log('清理文章功能已禁用');
}

// 添加单独删除特定文章的功能 - 保留空方法以防被调用
function deleteSpecificArticle(title) {
    console.log('删除特定文章功能已禁用');
} 