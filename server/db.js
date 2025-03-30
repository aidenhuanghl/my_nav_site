const mongoose = require('mongoose');

// MongoDB连接URL - 替换为您的MongoDB连接字符串
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_db';

// 连接到MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('成功连接到MongoDB'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 定义博客文章的Schema
const blogSchema = new mongoose.Schema({
  id: String,
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: String,
  tags: [String],
  date: { type: Date, default: Date.now },
  author: { type: String, default: '网站作者' },
  imageData: String,
  viewCount: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false }
});

// 定义草稿的Schema
const draftSchema = new mongoose.Schema({
  id: String,
  title: String,
  content: String,
  category: String,
  tags: [String],
  date: { type: Date, default: Date.now },
  imageData: String,
  lastSaved: { type: Date, default: Date.now }
});

// 定义被删除文章的Schema
const deletedPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// 创建模型
const BlogPost = mongoose.model('BlogPost', blogSchema);
const Draft = mongoose.model('Draft', draftSchema);
const DeletedPost = mongoose.model('DeletedPost', deletedPostSchema);

module.exports = {
  mongoose,
  BlogPost,
  Draft,
  DeletedPost
};
