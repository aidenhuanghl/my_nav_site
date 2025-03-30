const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 获取MongoDB连接字符串，如果环境变量不存在则使用默认值
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_db';

// 增强的连接选项，特别适合云MongoDB服务
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 增加服务器选择超时
    connectTimeoutMS: 30000, // 增加连接超时
    socketTimeoutMS: 45000, // 增加套接字超时
    family: 4 // 强制IPv4连接，有时可以避免IPv6相关问题
};

// 如果环境变量中设置了副本集，则添加到选项中
if (process.env.MONGODB_REPLICA_SET) {
    mongooseOptions.replicaSet = process.env.MONGODB_REPLICA_SET;
}

// 如果环境变量中设置了直接连接选项，则添加到选项中
if (process.env.MONGODB_DIRECT_CONNECTION) {
    mongooseOptions.directConnection = process.env.MONGODB_DIRECT_CONNECTION === 'true';
}

console.log('准备连接到MongoDB，环境:', process.env.NODE_ENV || 'development');

// 建立数据库连接
const connectDB = async () => {
    try {
        console.log('尝试连接到MongoDB...');
        
        const conn = await mongoose.connect(mongoURI, mongooseOptions);
        
        console.log(`MongoDB已连接: ${conn.connection.host}`);
        
        return conn;
    } catch (error) {
        console.error(`MongoDB连接错误: ${error.message}`);
        console.log('将在5秒后重试连接...');
        
        // 如果连接失败，5秒后重试
        setTimeout(connectDB, 5000);
        
        return null;
    }
};

// 设置事件监听器
mongoose.connection.on('connected', () => {
    console.log('Mongoose已连接到MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose连接出错:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose与MongoDB连接已断开');
});

// 应用终止时关闭连接
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('应用终止，MongoDB连接已关闭');
    process.exit(0);
});

// 博客文章模型
const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'uncategorized' },
    tags: [String],
    date: { type: Date, default: Date.now },
    author: { type: String, default: '网站作者' },
    imageData: String,
    viewCount: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false }
});

// 草稿模型
const draftSchema = new mongoose.Schema({
    title: { type: String, default: '无标题草稿' },
    content: String,
    category: String,
    tags: [String],
    imageData: String,
    lastSaved: { type: Date, default: Date.now }
});

// 已删除文章记录模型
const deletedPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now }
});

// 创建模型
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
const Draft = mongoose.model('Draft', draftSchema);
const DeletedPost = mongoose.model('DeletedPost', deletedPostSchema);

module.exports = {
    connectDB,
    mongoose,
    BlogPost,
    Draft,
    DeletedPost
};
