/**
 * 博客API路由处理程序
 * 处理与博客相关的API请求，并与MongoDB进行交互
 */

const express = require('express');
const { ObjectId } = require('mongodb');
const path = require('path');
// 修复导入路径
const dbUtilsPath = path.join(__dirname, '../db-utils');
const { getBlogPostDAO, isMongoDBConnected, isUsingLocalStorage } = require(dbUtilsPath);
const multer = require('multer');
const fs = require('fs');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 中间件：验证MongoDB ObjectId
function validateObjectId(req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: '无效的ID格式' });
  }
  req.objectId = new ObjectId(id);
  next();
}

// 参数中间件：验证ID参数
router.param('id', validateObjectId);

// 获取状态信息
router.get('/status', async (req, res) => {
  try {
    const status = {
      isConnected: isMongoDBConnected(),
      usingLocalStorage: isUsingLocalStorage(),
      serverTime: new Date().toISOString()
    };
    res.json(status);
  } catch (error) {
    console.error('获取状态信息失败:', error);
    res.status(500).json({ error: '获取状态信息失败' });
  }
});

// 获取所有博客文章
router.get('/posts', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const posts = await blogPostDAO.getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 获取单个博客文章
router.get('/posts/:id', async (req, res) => {
  try {
    console.log('获取单个博客文章，ID:', req.params.id);
    
    const blogPostDAO = await getBlogPostDAO();
    const post = await blogPostDAO.getPostById(req.params.id);
    
    if (!post) {
      console.warn('未找到指定文章，ID:', req.params.id);
      return res.status(404).json({ error: '未找到指定文章' });
    }
    
    // 确保返回的对象同时包含id和_id字段
    const responsePost = { ...post };
    
    // 如果只有_id没有id，添加id字段（字符串格式）
    if (responsePost._id && !responsePost.id) {
      responsePost.id = responsePost._id.toString();
    }
    
    console.log('成功获取博客文章:', responsePost.title, 'ID:', responsePost.id);
    res.json(responsePost);
  } catch (error) {
    console.error('获取单个博客文章失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 创建新博客文章
router.post('/posts', async (req, res) => {
  try {
    const postData = req.body;
    
    // 基本验证
    if (!postData.title || !postData.content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    const blogPostDAO = await getBlogPostDAO();
    const newPost = await blogPostDAO.createPost(postData);
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('创建博客文章失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 更新博客文章
router.put('/posts/:id', async (req, res) => {
  try {
    const updateData = req.body;
    
    const blogPostDAO = await getBlogPostDAO();
    const success = await blogPostDAO.updatePost(req.objectId, updateData);
    
    if (!success) {
      return res.status(404).json({ error: '未找到指定文章' });
    }
    
    // 获取更新后的文章
    const updatedPost = await blogPostDAO.getPostById(req.objectId);
    res.json(updatedPost);
  } catch (error) {
    console.error('更新博客文章失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 删除博客文章
router.delete('/posts/:id', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const success = await blogPostDAO.deletePost(req.objectId);
    
    if (!success) {
      return res.status(404).json({ error: '未找到指定文章' });
    }
    
    res.json({ message: '文章已成功删除' });
  } catch (error) {
    console.error('删除博客文章失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 获取热门文章
router.get('/popular-posts', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const popularPosts = await blogPostDAO.getPopularPosts();
    res.json(popularPosts);
  } catch (error) {
    console.error('获取热门文章失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 增加文章阅读量
router.post('/posts/:id/increment-view', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const success = await blogPostDAO.incrementViewCount(req.objectId);
    
    if (!success) {
      return res.status(404).json({ error: '未找到指定文章' });
    }
    
    // 获取更新后的文章
    const updatedPost = await blogPostDAO.getPostById(req.objectId);
    res.json(updatedPost);
  } catch (error) {
    console.error('增加文章阅读量失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 获取已删除的文章列表
router.get('/deleted-posts', async (req, res) => {
    try {
        const deletedPosts = await getBlogPostDAO().getDeletedPosts();
        res.json(deletedPosts);
    } catch (error) {
        console.error('获取已删除文章失败:', error);
        res.status(500).json({ error: '获取已删除文章失败' });
    }
});

// 草稿相关API

// 保存草稿
router.post('/drafts', async (req, res) => {
  try {
    const draftData = req.body;
    
    const blogPostDAO = await getBlogPostDAO();
    const draft = await blogPostDAO.saveDraft(draftData);
    
    res.status(201).json(draft);
  } catch (error) {
    console.error('保存草稿失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 获取所有草稿
router.get('/drafts', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const drafts = await blogPostDAO.getAllDrafts();
    res.json(drafts);
  } catch (error) {
    console.error('获取草稿列表失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 删除草稿
router.delete('/drafts/:id', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const success = await blogPostDAO.deleteDraft(req.objectId);
    
    if (!success) {
      return res.status(404).json({ error: '未找到指定草稿' });
    }
    
    res.json({ message: '草稿已成功删除' });
  } catch (error) {
    console.error('删除草稿失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 从localStorage导入数据
router.post('/import-local-storage', async (req, res) => {
  try {
    const data = req.body;
    
    const blogPostDAO = await getBlogPostDAO();
    const result = await blogPostDAO.importFromLocalStorage(data);
    
    res.json({ message: '数据导入成功', ...result });
  } catch (error) {
    console.error('从localStorage导入数据失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 删除所有博客内容（文章、草稿和删除记录）
router.delete('/all-content', async (req, res) => {
  try {
    const blogPostDAO = await getBlogPostDAO();
    const result = await blogPostDAO.deleteAllContent();
    
    console.log('已删除所有博客内容:', result);
    res.json({ 
      message: '所有博客内容已成功删除',
      ...result
    });
  } catch (error) {
    console.error('删除所有博客内容失败:', error);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

// 上传图片
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    // 返回图片URL
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ error: '上传图片失败' });
  }
});

module.exports = router; 