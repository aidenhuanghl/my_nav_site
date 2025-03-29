require('dotenv').config();
const clientPromise = require('./db');

async function testConnection() {
  try {
    console.log('正在尝试连接到MongoDB...');
    const client = await clientPromise;
    
    // 尝试执行一个简单的数据库操作
    const db = client.db('ainav_db');
    const collections = await db.listCollections().toArray();
    
    console.log('可用的集合:', collections.map(c => c.name));
    
    // 尝试写入测试数据
    const testCollection = db.collection('test_collection');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: '测试连接成功'
    });
    
    console.log('测试数据写入成功，ID:', result.insertedId);
    
    // 读取刚刚写入的数据
    const doc = await testCollection.findOne({ _id: result.insertedId });
    console.log('读取测试数据:', doc);
    
    // 清理测试数据
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('测试数据已清理');
    
    console.log('✅ 数据库连接和操作测试全部成功！');
  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    if (err.cause) {
      console.error('根本原因:', err.cause.message || err.cause);
    }
    process.exit(1);
  }
}

testConnection(); 