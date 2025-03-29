/**
 * API路由处理
 * 定义用户管理相关的API接口
 */

const express = require('express');
const { getUserDAO } = require('./db-utils');
const jwt = require('jsonwebtoken');

// 创建路由
const router = express.Router();

// 密钥用于JWT签名
const SECRET_KEY = process.env.APP_SECRET || 'your_secure_app_secret_here';

// JWT有效期（24小时）
const JWT_EXPIRATION = '24h';

// 生成JWT令牌
function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      username: user.username,
      email: user.email
    },
    SECRET_KEY,
    { expiresIn: JWT_EXPIRATION }
  );
}

// 验证JWT中间件
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的令牌' });
  }
}

// 用户注册API
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({ error: '用户名、密码和邮箱是必填项' });
    }

    const userDAO = await getUserDAO();
    
    // 检查用户名是否已存在
    const existingUser = await userDAO.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    // 创建新用户
    const newUser = await userDAO.create({ username, password, email });
    
    // 生成JWT令牌
    const token = generateToken(newUser);

    // 返回用户信息（不包含密码）和令牌
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: '注册成功', 
      user: userWithoutPassword,
      token 
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 用户登录API
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' });
    }

    const userDAO = await getUserDAO();
    
    // 查找用户
    const user = await userDAO.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    if (user.password !== password) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 更新最后登录时间
    await userDAO.updateLoginTime(username);

    // 生成JWT令牌
    const token = generateToken(user);

    // 返回用户信息（不包含密码）和令牌
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: '登录成功', 
      user: userWithoutPassword,
      token 
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息API
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const userDAO = await getUserDAO();
    
    // 查找用户
    const user = await userDAO.findByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败，请稍后重试' });
  }
});

// 更新用户设置API
router.put('/settings', authenticateJWT, async (req, res) => {
  try {
    const { settings } = req.body;
    const userDAO = await getUserDAO();
    
    // 更新用户设置
    const success = await userDAO.updateSettings(req.user.username, settings);
    if (!success) {
      return res.status(404).json({ error: '用户不存在或更新失败' });
    }

    res.json({ message: '设置已更新', settings });
  } catch (error) {
    console.error('更新设置错误:', error);
    res.status(500).json({ error: '更新设置失败，请稍后重试' });
  }
});

// 获取用户保存的链接API
router.get('/links', authenticateJWT, async (req, res) => {
  try {
    const userDAO = await getUserDAO();
    
    // 查找用户
    const user = await userDAO.findByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user.savedLinks || []);
  } catch (error) {
    console.error('获取链接错误:', error);
    res.status(500).json({ error: '获取链接失败，请稍后重试' });
  }
});

// 添加保存链接API
router.post('/links', authenticateJWT, async (req, res) => {
  try {
    const { url, title, description, icon, category } = req.body;
    
    // 验证必填字段
    if (!url || !title) {
      return res.status(400).json({ error: 'URL和标题是必填项' });
    }

    const userDAO = await getUserDAO();
    
    // 添加或更新链接
    const link = { url, title, description, icon, category };
    const success = await userDAO.addSavedLink(req.user.username, link);
    
    if (!success) {
      return res.status(404).json({ error: '用户不存在或添加失败' });
    }

    // 获取更新后的链接列表
    const user = await userDAO.findByUsername(req.user.username);
    res.status(201).json(user.savedLinks || []);
  } catch (error) {
    console.error('添加链接错误:', error);
    res.status(500).json({ error: '添加链接失败，请稍后重试' });
  }
});

// 删除保存的链接API
router.delete('/links/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userDAO = await getUserDAO();
    
    // 删除链接
    const success = await userDAO.removeSavedLink(req.user.username, id);
    if (!success) {
      return res.status(404).json({ error: '链接不存在或删除失败' });
    }

    // 获取更新后的链接列表
    const user = await userDAO.findByUsername(req.user.username);
    res.json(user.savedLinks || []);
  } catch (error) {
    console.error('删除链接错误:', error);
    res.status(500).json({ error: '删除链接失败，请稍后重试' });
  }
});

module.exports = router; 