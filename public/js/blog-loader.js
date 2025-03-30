// 博客加载器 - 负责从API加载博客数据并渲染到页面
class BlogLoader {
    constructor() {
        this.blogAPI = window.blogAPI; // 使用全局API实例
        this.blogContainer = document.getElementById('blog-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.noPostsMessage = document.getElementById('no-posts-message');
    }

    // 初始化加载
    async init() {
        try {
            // 清除localStorage中可能存在的博客数据缓存
            localStorage.removeItem('blogPosts');
            localStorage.removeItem('userBlogs');
            localStorage.removeItem('deletedPopularPosts');
            
            // 显示加载指示器
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'block';
            }
            
            // 从服务器获取最新数据
            const posts = await this.blogAPI.getPosts();
            
            // 隐藏加载指示器
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none';
            }
            
            // 渲染博客文章
            if (posts.length === 0) {
                if (this.noPostsMessage) {
                    this.noPostsMessage.style.display = 'block';
                }
            } else {
                this.renderPosts(posts);
            }
        } catch (error) {
            console.error('加载博客文章失败：', error);
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none';
            }
            if (this.blogContainer) {
                this.blogContainer.innerHTML = `<div class="error-message">加载文章时出错: ${error.message}</div>`;
            }
        }
    }

    // ... existing code ...
} 