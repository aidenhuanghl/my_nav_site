# MongoDB 数据库配置指南

## 获取 MongoDB 连接字符串

### 选项1: 使用 MongoDB Atlas (推荐)

MongoDB Atlas是一个云数据库服务，提供免费的入门套餐，无需本地安装。

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) 并创建账户
2. 创建新集群 (选择免费M0套餐)
3. 设置数据库用户
   - 记得设置强密码并保存
4. 设置IP访问控制
   - 添加您的IP地址到白名单，或选择"允许所有IP访问"(0.0.0.0/0)用于开发
5. 获取连接字符串
   - 点击"Connect"按钮
   - 选择"Connect your application"
   - 复制连接字符串，它应该类似于:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - 替换 `<username>` 和 `<password>` 为您创建的数据库用户信息
   - 在 `mongodb.net/` 后添加 `ainav_db` 作为数据库名称

### 选项2: 使用本地 MongoDB

如果您已经在本地安装了MongoDB:

```
MONGODB_URI=mongodb://localhost:27017/ainav_db
```

## 更新 .env 文件

1. 打开根目录和 `server/` 目录下的 `.env` 文件
2. 用您获取的真实连接字符串替换 `MONGODB_URI` 变量
3. 确保两个 `.env` 文件中的连接字符串相同

## 测试数据库连接

测试您的连接是否正常工作:

```bash
node test-db-connection.js
```

如果连接成功，您将看到集合列表和成功消息。
如果失败，脚本会提供故障排除建议。

## 常见问题解决

### 连接失败的常见原因:

1. **用户名/密码不正确**
   - 重新检查MongoDB Atlas中创建的用户名和密码

2. **IP地址未列入白名单**
   - 确保您的当前IP已添加到MongoDB Atlas的IP访问列表

3. **连接字符串格式错误**
   - 确保连接字符串格式正确，包括数据库名称 
   - 示例: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ainav_db?retryWrites=true&w=majority`

4. **本地MongoDB未运行**
   - 如果使用本地MongoDB，确保服务已启动

## 下一步

成功连接到数据库后:

1. 启动应用程序服务器:
   ```bash
   node server.js
   ```

2. 监控启动过程中的控制台日志，查看是否成功连接到数据库

3. 在浏览器中访问应用程序: http://localhost:3000 