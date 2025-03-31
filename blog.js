// --- 数据迁移 --- 
// 在文档加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
    // 检查 localStorage 中是否存在 'dataMigratedToMongoDB' 标志
    const dataMigrated = localStorage.getItem('dataMigratedToMongoDB');
    
    // 如果标志不存在，则表示需要进行数据迁移
    if (!dataMigrated) {
        try {
            // 显示一个临时的加载通知给用户
            showNotification('正在迁移数据到MongoDB，请稍候...', 3000);
            
            // 调用 blogAPI (可能在 blog-api.js 中定义) 的函数，执行从 localStorage 到 MongoDB 的数据导入
            await window.blogAPI.importFromLocalStorage();
            
            // 数据迁移成功后，在 localStorage 中设置标志，避免重复迁移
            localStorage.setItem('dataMigratedToMongoDB', 'true');
            
            // 显示迁移成功的通知
            showNotification('数据成功迁移到MongoDB!', 3000);
        } catch (error) {
            // 如果迁移过程中出现错误，在控制台打印错误信息
            console.error('数据迁移失败:', error);
            // 并显示一个错误通知给用户
            showNotification('数据迁移失败，请刷新页面重试', 5000);
        }
    }
    
    // 无论是否进行了迁移，都初始化博客的主要功能
    initBlogFunctionality();
});

// --- 通知功能 --- 
// 显示一个短暂的通知消息在屏幕右下角
function showNotification(message, duration = 3000) {
    console.log('显示通知:', message);
    
    // 创建一个新的 div 元素作为通知框
    const notification = document.createElement('div');
    notification.className = 'notification'; // 设置 CSS 类名
    notification.textContent = message; // 设置通知内容
    
    // --- 设置通知框的样式 ---
    notification.style.position = 'fixed'; // 固定定位，不随页面滚动
    notification.style.bottom = '20px'; // 距离底部 20px
    notification.style.right = '20px'; // 距离右侧 20px
    notification.style.backgroundColor = '#4a6da7'; // 背景颜色
    notification.style.color = 'white'; // 文字颜色
    notification.style.padding = '12px 20px'; // 内边距
    notification.style.borderRadius = '4px'; // 圆角
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // 阴影效果
    notification.style.zIndex = '9999'; // 置于顶层
    notification.style.transition = 'all 0.3s ease'; // 过渡效果（透明度）
    notification.style.opacity = '0'; // 初始透明度为 0 (隐藏)
    
    // 将通知框添加到页面的 body 元素中
    document.body.appendChild(notification);
    
    // --- 显示和隐藏动画 ---
    // 使用 setTimeout 延迟一小段时间（10毫秒）后，将透明度设为 1，触发渐显效果
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // 设置一个定时器，在指定的 duration 毫秒后开始隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0'; // 将透明度设回 0，触发渐隐效果
        
        // 在渐隐动画（0.3秒）结束后，从 DOM 中移除通知元素
        setTimeout(() => {
            // 再次检查元素是否还在 DOM 中，防止重复移除
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300); // 300 毫秒对应 CSS 中的 transition 时间
    }, duration);
}

// --- 博客功能初始化 --- 
// 初始化博客相关的所有功能和事件监听器
function initBlogFunctionality() {
    console.log("初始化博客功能...");
    
    // 检查并加载 API 服务器配置
    checkAPIServerConfig();
    
    // 初始化热门文章的计数器（可能用于显示或排序）
    initPopularPostsCounters();
    // 更新页面上的博客文章列表
    updateBlogPostsList();
    // 更新页面上的热门文章列表
    updatePopularArticlesList();
    // 设置"新建文章"按钮的功能
    setupNewPostButton();
    // 设置草稿相关的功能（如自动保存、加载草稿）
    setupDraftFunctionality();
}

// --- API 服务器配置 --- 
// 检查 localStorage 中是否有保存的 API 服务器配置，并应用它
function checkAPIServerConfig() {
    // 从 localStorage 读取 'api_server_config' 项
    const apiServerConfig = localStorage.getItem('api_server_config');
    
    // 如果存在配置
    if (apiServerConfig) {
        try {
            // 解析 JSON 格式的配置字符串
            const config = JSON.parse(apiServerConfig);
            // 如果配置中有 baseURL
            if (config.baseURL) {
                // 使用 blogAPI 对象的方法设置 API 的基础 URL
                blogAPI.setBaseURL(config.baseURL);
                console.log(`已从本地存储加载API服务器配置: ${config.baseURL}`);
            }
        } catch (error) {
            // 如果解析失败，打印错误信息
            console.error('解析API服务器配置失败:', error);
        }
    }
    
    // 添加一个按钮到页面上，允许用户手动配置 API 服务器地址
    addAPIConfigButton();
}

// 在页面上添加一个"配置API服务器"的按钮
function addAPIConfigButton() {
    // 查找博客控制按钮的容器，如果不存在则创建一个
    const controlsContainer = document.querySelector('.blog-controls') || createBlogControlsContainer();
    
    // 检查页面上是否已经存在 ID 为 'api-config-button' 的按钮，如果存在则不重复添加
    if (document.getElementById('api-config-button')) {
        return;
    }
    
    // 创建一个新的 button 元素
    const configButton = document.createElement('button');
    configButton.id = 'api-config-button'; // 设置按钮 ID
    configButton.className = 'control-button'; // 设置 CSS 类名
    configButton.innerHTML = '<i class="fas fa-cog"></i> 配置API服务器'; // 按钮文本和图标
    // 设置按钮样式
    configButton.style.backgroundColor = '#4a6da7';
    configButton.style.color = 'white';
    configButton.style.marginLeft = '10px'; // 与其他按钮保持间距
    
    // 为按钮添加点击事件监听器，点击时调用 showAPIConfigDialog 函数
    configButton.addEventListener('click', showAPIConfigDialog);
    
    // 将按钮添加到控制容器中
    controlsContainer.appendChild(configButton);
}

// 如果页面上不存在博客控制按钮的容器，则创建一个并添加到页面中
function createBlogControlsContainer() {
    // 查找博客内容的主要区域元素
    const blogSection = document.querySelector('.blog-section');
    // 创建一个新的 div 元素作为容器
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'blog-controls'; // 设置 CSS 类名
    // 设置容器样式
    controlsContainer.style.marginBottom = '20px'; // 底部外边距
    controlsContainer.style.display = 'flex'; // 使用 flex 布局
    controlsContainer.style.justifyContent = 'flex-end'; // 按钮靠右对齐
    
    // 将控制容器插入到博客区域的顶部
    if (blogSection.firstChild) {
        // 如果博客区域已有子元素，则插入到第一个子元素之前
        blogSection.insertBefore(controlsContainer, blogSection.firstChild);
    } else {
        // 如果博客区域为空，则直接添加
        blogSection.appendChild(controlsContainer);
    }
    
    // 返回创建的容器元素
    return controlsContainer;
}

// 显示一个模态对话框，用于配置 API 服务器地址
function showAPIConfigDialog() {
    // --- 创建模态框背景层 ---
    const modal = document.createElement('div');
    modal.className = 'modal'; // CSS 类名
    // 设置样式使其覆盖整个屏幕并居中内容
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)'; // 半透明黑色背景
    modal.style.display = 'flex';
    modal.style.alignItems = 'center'; // 垂直居中
    modal.style.justifyContent = 'center'; // 水平居中
    modal.style.zIndex = '1000'; // 置于顶层
    
    // --- 创建模态框内容区域 ---
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content'; // CSS 类名
    // 设置样式
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '500px'; // 对话框宽度
    modalContent.style.maxWidth = '90%'; // 最大宽度，适应小屏幕
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'; // 阴影效果
    
    // --- 创建对话框标题 ---
    const title = document.createElement('h2');
    title.textContent = 'API服务器配置';
    // 设置样式
    title.style.marginTop = '0';
    title.style.color = '#333';
    
    // --- 显示当前配置 --- 
    const currentConfig = document.createElement('div');
    // 使用 innerHTML 插入包含当前 API URL 的段落
    // blogAPI.getBaseURL() 获取当前的 API 基础 URL
    currentConfig.innerHTML = `<p><strong>当前API服务器:</strong> <span id="current-api-url">${blogAPI.getBaseURL()}</span></p>`;
    
    // --- 创建输入表单 --- 
    const form = document.createElement('form');
    form.style.marginTop = '20px';
    
    // 创建输入框组（标签 + 输入框）
    const inputGroup = document.createElement('div');
    inputGroup.style.marginBottom = '15px';
    
    // 创建标签
    const label = document.createElement('label');
    label.htmlFor = 'api-base-url'; // 关联到输入框
    label.textContent = 'API服务器地址:';
    // 设置标签样式
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    label.style.fontWeight = 'bold';
    
    // 创建文本输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'api-base-url'; // ID，与 label 的 htmlFor 对应
    input.value = blogAPI.getBaseURL(); // 默认值为当前的 API URL
    input.placeholder = 'http://your-api-server.com/api'; // 输入提示
    // 设置输入框样式
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.boxSizing = 'border-box'; // 防止 padding 影响总宽度
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    
    // --- 创建测试连接结果显示区域 --- 
    const testResult = document.createElement('div');
    testResult.id = 'test-result'; // ID，用于后续更新内容
    testResult.style.marginTop = '10px';
    testResult.style.padding = '8px';
    testResult.style.display = 'none'; // 默认隐藏
    
    // --- 创建按钮组容器 --- 
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex'; // 使用 flex 布局排列按钮
    buttonGroup.style.justifyContent = 'space-between'; // 按钮之间留有空间
    buttonGroup.style.marginTop = '20px';
    
    // --- 创建"保存配置"按钮 --- 
    const saveButton = document.createElement('button');
    saveButton.type = 'button'; // 避免触发表单提交
    saveButton.textContent = '保存配置';
    // 设置按钮样式
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#4CAF50'; // 绿色
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    // --- 创建"测试连接"按钮 --- 
    const testButton = document.createElement('button');
    testButton.type = 'button';
    testButton.textContent = '测试连接';
    // 设置按钮样式
    testButton.style.padding = '8px 16px';
    testButton.style.backgroundColor = '#2196F3'; // 蓝色
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // --- 创建"恢复默认"按钮 --- 
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = '恢复默认';
    // 设置按钮样式
    resetButton.style.padding = '8px 16px';
    resetButton.style.backgroundColor = '#607D8B';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    
    // --- 创建取消按钮 --- 
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

// --- 博客功能初始化 --- 
// 为 HTML 中预先存在的静态博客卡片添加点击查看详情的功能
function initExistingBlogCards() {
    // 查找所有带有 .blog-card 类和 .blog-read-more 类的链接元素
    const readMoreLinks = document.querySelectorAll('.blog-card .blog-read-more');
    
    // 遍历所有找到的"阅读更多"链接
    readMoreLinks.forEach((link, index) => {
        // 为每个链接添加点击事件监听器
        link.addEventListener('click', function(e) {
            // 阻止链接的默认行为（例如页面跳转）
            e.preventDefault();
            
            // 获取包含该链接的父级 .blog-card 元素
            const blogCard = this.closest('.blog-card');
            // 如果找不到父级卡片，则退出
            if (!blogCard) return;
            
            // 尝试从链接的 data-blog-id 属性获取博客 ID
            // 如果没有该属性，则生成一个基于索引的临时 ID (例如 'static-0')
            const blogId = this.getAttribute('data-blog-id') || ('static-' + index);
            
            // --- 从卡片元素中提取博客信息 --- 
            // 获取标题
            const title = blogCard.querySelector('.blog-card-title').textContent;
            // 获取摘要
            const excerpt = blogCard.querySelector('.blog-card-excerpt').textContent;
            // 获取日期元素，如果存在则获取其文本内容，否则使用当前日期
            const dateElement = blogCard.querySelector('.blog-card-date');
            const date = dateElement ? dateElement.textContent : new Date().toISOString().split('T')[0];
            
            // 获取标签
            const tags = [];
            // 查找卡片内所有 .blog-tag 元素并提取文本内容
            blogCard.querySelectorAll('.blog-tag').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // 获取分类 (从卡片的 data-categories 属性读取，默认为 'tech')
            const categories = blogCard.getAttribute('data-categories') || '';
            const category = categories.split(',')[0] || 'tech'; // 取第一个分类
            
            // --- 创建一个临时的博客对象 --- 
            // 这个对象用于传递给 showBlogDetail 函数，模拟从 API 获取的数据结构
            const blog = {
                id: blogId,       // 博客 ID (可能是真实的或临时的)
                title: title,     // 标题
                content: excerpt + '\n\n这是预设的静态博客文章。您可以点击右下角的"写博客"按钮创建自己的博客内容。', // 内容 (使用摘要 + 提示信息)
                date: date,       // 日期
                author: '网站作者', // 作者 (固定值)
                category: category, // 分类
                tags: tags        // 标签数组
            };
            
            console.log('Opening blog with ID:', blogId);
            
            // 调用 showBlogDetail 函数，显示包含博客信息的模态框
            showBlogDetail(blog); // 注意：这里传递的是 blog 对象，而不是 blogId
        });
    });
}

// --- 写博客模态框初始化 --- 
// 初始化"写博客"按钮和相关的模态框交互
function initWriteBlogModal() {
    // 获取"写博客"按钮、模态框本身、关闭按钮和表单元素
    const writeBtn = document.querySelector('.write-blog-btn');
    const modal = document.querySelector('.write-blog-modal');
    const closeBtn = document.querySelector('.close-modal-btn');
    const form = document.querySelector('.write-blog-form');
    
    // 如果任何一个元素不存在，则退出初始化
    if (!writeBtn || !modal || !closeBtn) return;
    
    // 为"写博客"按钮添加点击事件
    writeBtn.addEventListener('click', function() {
        // 添加 'active' 类以显示模态框 (假设 CSS 中定义了 .active 类的样式)
        modal.classList.add('active');
        // 禁止背景页面滚动
        document.body.style.overflow = 'hidden'; 
    });
    
    // 为关闭按钮添加点击事件
    closeBtn.addEventListener('click', function() {
        // 移除 'active' 类以隐藏模态框
        modal.classList.remove('active');
        // 恢复背景页面滚动
        document.body.style.overflow = '';
    });
    
    // 为模态框背景层添加点击事件 (点击模态框外部区域关闭)
    modal.addEventListener('click', function(e) {
        // 检查点击的目标是否是模态框背景本身 (而不是内容区域)
        if (e.target === modal) {
            // 隐藏模态框并恢复滚动
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // --- 处理图片上传和预览 --- 
    // 获取图片上传输入框元素
    const imageInput = document.querySelector('#blog-image');
    // 用于存储上传的图片数据 (Base64 格式)
    let uploadedImageData = null;
    
    // 如果图片输入框存在
    if (imageInput) {
        // 为其添加 change 事件监听器 (当用户选择文件后触发)
        imageInput.addEventListener('change', function(e) {
            // 获取用户选择的文件
            const file = e.target.files[0];
            // 如果没有选择文件，则退出
            if (!file) return;
            
            // --- 文件校验 ---
            // 检查文件大小是否超过 2MB
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过2MB');
                // 清空文件选择框，以便用户可以重新选择
                e.target.value = ''; 
                return;
            }
            
            // 检查文件类型是否为图片
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                e.target.value = '';
                return;
            }
            
            // --- 读取并预览图片 ---
            // 创建 FileReader 对象
            const reader = new FileReader();
            // 设置文件读取完成后的回调函数
            reader.onload = function(event) {
                // 将读取到的文件内容 (Base64 编码) 保存到 uploadedImageData 变量
                uploadedImageData = event.target.result;
                
                // --- 显示图片预览 --- 
                // 查找或创建图片预览容器
                const previewContainer = document.querySelector('.image-preview-container') || document.createElement('div');
                // 如果是新创建的容器，设置类名和添加标题及图片元素
                if (!previewContainer.classList.contains('image-preview-container')) {
                    previewContainer.className = 'image-preview-container'; // CSS 类名
                    const previewLabel = document.createElement('p');
                    previewLabel.textContent = '图片预览:';
                    previewContainer.appendChild(previewLabel);
                    const previewImg = document.createElement('img');
                    previewImg.className = 'image-preview'; // CSS 类名
                    previewContainer.appendChild(previewImg);
                    // 将预览容器添加到图片输入框的父节点下
                    imageInput.parentNode.appendChild(previewContainer);
                }
                
                // 获取预览图片元素，并设置其 src 为读取到的 Base64 数据
                const previewImg = previewContainer.querySelector('.image-preview');
                previewImg.src = uploadedImageData;
                // 显示预览容器
                previewContainer.style.display = 'block';
            };
            // 以 Data URL (Base64) 格式读取文件内容
            reader.readAsDataURL(file);
        });
    }
    
    // --- 处理表单提交 (发布文章) --- 
    // 如果表单元素存在
    if (form) {
        // 为表单添加 submit 事件监听器
        form.addEventListener('submit', function(e) {
            // 阻止表单的默认提交行为 (页面刷新)
            e.preventDefault();
            
            // --- 获取表单输入值 ---
            const title = document.querySelector('#blog-title').value;
            const content = document.querySelector('#blog-content').value;
            const category = document.querySelector('#blog-category').value;
            const tags = document.querySelector('#blog-tags').value;
            
            // 简单的输入校验
            if (!title || !content) {
                alert('请填写标题和内容');
                return;
            }
            
            // 调用 publishBlog 函数处理文章发布逻辑 (可能包含 API 调用等)
            // 注意: uploadedImageData 变量在此函数作用域内可用
            publishBlog(); 
        });
    }
    
    // --- 处理保存草稿按钮 --- 
    // 获取"保存草稿"按钮元素
    const saveDraftBtn = document.querySelector('.save-draft-btn');
    // 如果按钮存在
    if (saveDraftBtn) {
        // 为按钮添加点击事件监听器
        saveDraftBtn.addEventListener('click', function() {
            // 获取表单中的值，如果标题为空则设置默认值
            const title = document.querySelector('#blog-title').value || '无标题草稿';
            const content = document.querySelector('#blog-content').value || '';
            const category = document.querySelector('#blog-category').value;
            const tags = document.querySelector('#blog-tags').value;
            
            // 校验内容是否为空
            if (!content) {
                alert('请至少填写一些内容');
                return;
            }
            
            // --- 将草稿保存到 localStorage --- 
            // 从 localStorage 读取现有的草稿数组，如果不存在则初始化为空数组
            const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
            // 创建新的草稿对象
            const draft = {
                id: Date.now(), // 使用时间戳作为唯一 ID
                title,          // 标题
                content,        // 内容
                category,       // 分类
                tags,           // 标签 (字符串形式)
                date: new Date().toISOString(), // 保存日期
                imageData: uploadedImageData // 保存上传的图片数据 (Base64)
            };
            
            // 将新草稿添加到数组中
            drafts.push(draft);
            // 将更新后的草稿数组存回 localStorage
            localStorage.setItem('blogDrafts', JSON.stringify(drafts));
            
            // 提示用户保存成功
            alert('草稿已保存');
        });
    }
}

// --- 博客分类筛选 --- 
// 初始化分类标签的点击筛选功能
function initBlogCategories() {
    // 获取所有的分类标签元素和博客卡片元素
    const categories = document.querySelectorAll('.blog-category');
    const blogCards = document.querySelectorAll('.blog-card');
    
    // 如果页面上没有分类标签或博客卡片，则退出
    if (!categories.length || !blogCards.length) return;
    
    // 遍历所有分类标签
    categories.forEach(category => {
        // 为每个标签添加点击事件监听器
        category.addEventListener('click', function() {
            // --- 更新分类标签的激活状态 --- 
            // 移除所有分类标签的 'active' 类
            categories.forEach(c => c.classList.remove('active'));
            // 为当前点击的标签添加 'active' 类
            this.classList.add('active');
            
            // --- 根据选择的分类筛选博客卡片 --- 
            // 获取当前点击标签的 data-category 属性值 (例如 'tech', 'life', 'all')
            const filter = this.getAttribute('data-category');
            
            // 如果选择的是"全部"
            if (filter === 'all') {
                // 显示所有博客卡片 (通过移除 display:none 样式)
                blogCards.forEach(card => {
                    card.style.display = '';
                });
                // 结束函数执行
                return;
            }
            
            // 如果选择的是特定分类
            // 遍历所有博客卡片
            blogCards.forEach(card => {
                // 获取卡片的 data-categories 属性值 (可能包含多个分类，用逗号分隔)
                const cardCategories = card.getAttribute('data-categories');
                // 检查卡片的分类是否包含当前选择的分类
                if (cardCategories && cardCategories.includes(filter)) {
                    // 如果包含，则显示卡片
                    card.style.display = '';
                } else {
                    // 如果不包含，则隐藏卡片
                    card.style.display = 'none';
                }
            });
        });
    });
}

// --- 博客搜索功能 --- 
// 初始化博客搜索框的功能
function initBlogSearch() {
    // 获取搜索表单、输入框和所有博客卡片元素
    const searchForm = document.querySelector('.blog-search');
    const searchInput = document.querySelector('.blog-search input');
    const blogCards = document.querySelectorAll('.blog-card');
    
    // 如果缺少必要的元素，则退出
    if (!searchForm || !searchInput || !blogCards.length) return;
    
    // 为搜索表单添加 submit 事件监听器 (用户按回车或点击搜索按钮)
    searchForm.addEventListener('submit', function(e) {
        // 阻止表单默认提交行为
        e.preventDefault();
        
        // 获取搜索关键词，转换为小写并去除首尾空格
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // 如果搜索词为空，显示所有博客卡片
        if (!searchTerm) {
            blogCards.forEach(card => {
                card.style.display = '';
            });
            return;
        }
        
        // --- 根据搜索词筛选博客卡片 --- 
        blogCards.forEach(card => {
            // 获取卡片的标题、摘要，并转换为小写
            const title = card.querySelector('.blog-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
            // 获取卡片的所有标签元素
            const tags = card.querySelectorAll('.blog-tag');
            
            // 检查标签是否匹配搜索词
            let tagMatch = false;
            tags.forEach(tag => {
                if (tag.textContent.toLowerCase().includes(searchTerm)) {
                    tagMatch = true;
                }
            });
            
            // 如果标题、摘要或任何标签包含搜索词，则显示卡片，否则隐藏
            if (title.includes(searchTerm) || excerpt.includes(searchTerm) || tagMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // --- 添加实时搜索功能 (当用户在输入框中输入时) --- 
    searchInput.addEventListener('input', function() {
        // 获取当前输入框的值，转换为小写并去除空格
        const searchTerm = this.value.toLowerCase().trim();
        
        // 如果输入为空，显示所有卡片
        if (!searchTerm) {
            blogCards.forEach(card => {
                card.style.display = '';
            });
            return;
        }
        
        // --- 实时筛选卡片 (仅基于标题和摘要) --- 
        // (注意：实时搜索可能需要优化性能，例如使用 debounce)
        blogCards.forEach(card => {
            const title = card.querySelector('.blog-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
            
            // 如果标题或摘要包含搜索词，显示卡片，否则隐藏
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// --- 博客分页功能 --- 
// 初始化分页组件的点击切换功能 (主要是视觉效果)
function initBlogPagination() {
    // 获取所有分页项元素 (例如页码按钮)
    const paginationItems = document.querySelectorAll('.pagination-item');
    
    // 如果没有分页项，则退出
    if (!paginationItems.length) return;
    
    // 遍历所有分页项
    paginationItems.forEach(item => {
        // 为每个分页项添加点击事件监听器
        item.addEventListener('click', function() {
            // --- 更新分页项的激活状态 --- 
            // 移除所有分页项的 'active' 类
            paginationItems.forEach(p => p.classList.remove('active'));
            // 为当前点击的项添加 'active' 类
            this.classList.add('active');
            
            // --- 实际的分页逻辑 (此处为占位符) --- 
            // 在实际应用中，这里应该根据点击的页码 (data-page 属性)
            // 异步加载并显示对应页的博客文章。
            // 由于这是一个静态示例，这里只打印日志并滚动页面。
            const page = this.getAttribute('data-page');
            console.log('加载博客页面:', page);
            
            // 平滑滚动到博客区域的顶部
            window.scrollTo({
                top: document.querySelector('#blog-section').offsetTop - 100, // 减去 100px 作为偏移量
                behavior: 'smooth' // 平滑滚动效果
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