require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { BlogPost, Draft, DeletedPost } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // 增加限制以处理图片数据
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件
app.use(express.static('../'));

// API路由

// 获取所有博客文章
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单个博客文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ error: '文章未找到' });
    
    // 增加浏览量
    post.viewCount += 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建新博客文章
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, category, tags, imageData } = req.body;
    
    const post = new BlogPost({
      id: 'post-' + Date.now(),
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
      date: new Date(),
      imageData,
      viewCount: 0
    });
    
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新博客文章
app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    
    if (!post) return res.status(404).json({ error: '文章未找到' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除博客文章
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ id: req.params.id });
    if (!post) return res.status(404).json({ error: '文章未找到' });
    
    // 保存删除记录
    if (post.title) {
      await new DeletedPost({ title: post.title }).save();
    }
    
    await BlogPost.deleteOne({ id: req.params.id });
    res.json({ message: '文章已成功删除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取热门文章
app.get('/api/popular-posts', async (req, res) => {
  try {
    const posts = await BlogPost.find()
      .sort({ viewCount: -1 })
      .limit(10);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 存储草稿
app.post('/api/drafts', async (req, res) => {
  try {
    const { title, content, category, tags, imageData } = req.body;
    
    const draft = new Draft({
      id: 'draft-' + Date.now(),
      title: title || '无标题草稿',
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
      imageData,
      lastSaved: new Date()
    });
    
    await draft.save();
    res.status(201).json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取草稿
app.get('/api/drafts', async (req, res) => {
  try {
    const drafts = await Draft.find().sort({ lastSaved: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除草稿
app.delete('/api/drafts/:id', async (req, res) => {
  try {
    await Draft.deleteOne({ id: req.params.id });
    res.json({ message: '草稿已成功删除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取已删除的文章标题
app.get('/api/deleted-posts', async (req, res) => {
  try {
    const deletedPosts = await DeletedPost.find().sort({ date: -1 });
    res.json(deletedPosts.map(post => post.title));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 数据迁移API - 从localStorage导入数据
app.post('/api/import-local-storage', async (req, res) => {
  try {
    const { blogPosts, userBlogs, deletedPosts } = req.body;
    
    // 导入博客文章
    if (blogPosts && blogPosts.length) {
      for (const post of blogPosts) {
        // 检查是否已存在相同ID的文章
        const existingPost = await BlogPost.findOne({ id: post.id });
        if (!existingPost) {
          await new BlogPost(post).save();
        }
      }
    }
    
    // 导入用户博客
    if (userBlogs && userBlogs.length) {
      for (const blog of userBlogs) {
        // 检查是否已存在相同ID的文章
        const existingBlog = await BlogPost.findOne({ id: blog.id });
        if (!existingBlog) {
          await new BlogPost(blog).save();
        }
      }
    }
    
    // 导入删除记录
    if (deletedPosts && deletedPosts.length) {
      for (const title of deletedPosts) {
        // 检查是否已存在相同标题的删除记录
        const existingDeletedPost = await DeletedPost.findOne({ title });
        if (!existingDeletedPost) {
          await new DeletedPost({ title }).save();
        }
      }
    }
    
    res.json({ message: '数据导入成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
