const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB, BlogPost, Draft, DeletedPost } = require('./db');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 启用CORS
app.use(express.json({ limit: '10mb' })); // 解析JSON请求体，增大限制以处理图片
app.use(morgan('dev')); // HTTP请求日志

// 连接数据库
connectDB();

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        message: '服务器正常运行',
        time: new Date().toISOString()
    });
});

// 获取所有博客文章
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error('获取博客文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取单个博客文章
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: '文章未找到' });
        }
        // 增加浏览量
        post.viewCount += 1;
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('获取单个博客文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 创建博客文章
app.post('/api/posts', async (req, res) => {
    try {
        const post = new BlogPost({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            tags: req.body.tags,
            imageData: req.body.imageData,
            author: req.body.author || '网站作者',
            isPopular: req.body.isPopular || false,
            viewCount: req.body.viewCount || 0
        });
        
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('创建博客文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新博客文章
app.put('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: '文章未找到' });
        }
        
        // 更新文章
        Object.assign(post, req.body);
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        console.error('更新博客文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除博客文章
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: '文章未找到' });
        }
        
        // 记录已删除的文章
        const deletedPost = new DeletedPost({
            title: post.title
        });
        await deletedPost.save();
        
        // 删除文章
        await BlogPost.findByIdAndDelete(req.params.id);
        res.json({ message: '文章已删除' });
    } catch (error) {
        console.error('删除博客文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取热门文章
app.get('/api/popular-posts', async (req, res) => {
    try {
        const popularPosts = await BlogPost.find()
            .sort({ viewCount: -1 })
            .limit(10);
        res.json(popularPosts);
    } catch (error) {
        console.error('获取热门文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 创建或更新草稿
app.post('/api/drafts', async (req, res) => {
    try {
        const draft = new Draft({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            tags: req.body.tags,
            imageData: req.body.imageData
        });
        
        const savedDraft = await draft.save();
        res.status(201).json(savedDraft);
    } catch (error) {
        console.error('保存草稿错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取所有草稿
app.get('/api/drafts', async (req, res) => {
    try {
        const drafts = await Draft.find().sort({ lastSaved: -1 });
        res.json(drafts);
    } catch (error) {
        console.error('获取草稿错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除草稿
app.delete('/api/drafts/:id', async (req, res) => {
    try {
        await Draft.findByIdAndDelete(req.params.id);
        res.json({ message: '草稿已删除' });
    } catch (error) {
        console.error('删除草稿错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取已删除的文章标题列表
app.get('/api/deleted-posts', async (req, res) => {
    try {
        const deletedPosts = await DeletedPost.find().sort({ deletedAt: -1 });
        res.json(deletedPosts.map(post => post.title));
    } catch (error) {
        console.error('获取已删除文章错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 导入localStorage数据到MongoDB
app.post('/api/import-local-storage', async (req, res) => {
    try {
        const { blogPosts, userBlogs, deletedPosts } = req.body;
        
        // 处理博客文章
        if (Array.isArray(blogPosts)) {
            for (const post of blogPosts) {
                // 检查是否已存在
                const existingPost = await BlogPost.findOne({ title: post.title });
                if (!existingPost) {
                    await new BlogPost({
                        title: post.title,
                        content: post.content || '内容为空',
                        category: post.category || '未分类',
                        tags: post.tags || [],
                        date: post.date ? new Date(post.date) : new Date(),
                        author: post.author || '网站作者',
                        imageData: post.imageData,
                        viewCount: post.viewCount || 0,
                        isPopular: post.isPopular || false
                    }).save();
                }
            }
        }
        
        // 处理用户创建的博客
        if (Array.isArray(userBlogs)) {
            for (const post of userBlogs) {
                // 检查是否已存在
                const existingPost = await BlogPost.findOne({ title: post.title });
                if (!existingPost) {
                    await new BlogPost({
                        title: post.title,
                        content: post.content || '内容为空',
                        category: post.category || '未分类',
                        tags: post.tags || [],
                        date: post.date ? new Date(post.date) : new Date(),
                        author: post.author || '网站作者',
                        imageData: post.imageData || post.imageUrl,
                        viewCount: post.viewCount || 0,
                        isPopular: post.isPopular || false
                    }).save();
                }
            }
        }
        
        // 处理已删除的文章
        if (Array.isArray(deletedPosts)) {
            for (const title of deletedPosts) {
                // 检查是否已存在
                const existingPost = await DeletedPost.findOne({ title });
                if (!existingPost) {
                    await new DeletedPost({
                        title,
                        deletedAt: new Date()
                    }).save();
                }
            }
        }
        
        res.json({ 
            success: true,
            message: '数据成功导入MongoDB' 
        });
    } catch (error) {
        console.error('导入数据错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API可通过 http://localhost:${PORT}/api 访问`);
});
