import { Router } from 'express';
import { connectMongo } from '../db/mongoClient';
import Knowledge from '../models/Knowledge'; 
import slugify from 'slugify';

const knowledgeRouter = Router();

// 统一连接 Mongo（可根据你的项目结构改为中间件）
knowledgeRouter.use(async (_req, _res, next) => {
  await connectMongo();
  next();
});

// 获取知识库列表
knowledgeRouter.get('/', async (_req, res) => {
  try {
    const list = await Knowledge.find({}, { _id: 0, __v: 0 });
    res.json({ list });
  } catch (error) {
    console.error('Failed to fetch knowledge:', error);
    res.status(500).json({ error: 'Failed to read knowledge from database' });
  }
});

// 上传知识库（支持新增或更新）
knowledgeRouter.post('/', async (req, res) => {
  const { category, title, language, content } = req.body;

  if (!category || !title || !language || !content) {
    return res.status(400).json({ error: 'Missing required fields: category, title, language, content' });
  }

  const slug = slugify(`${title}-${language}`, { lower: true });

  try {
    await Knowledge.findOneAndUpdate(
      { slug },
      { category, title, language, content, slug },
      { upsert: true, new: true }
    );
    res.json({ success: true, slug });
  } catch (error) {
    console.error('Failed to save knowledge:', error);
    res.status(500).json({ error: 'Failed to save knowledge to database' });
  }
});

// 删除知识库
knowledgeRouter.delete('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await Knowledge.deleteOne({ slug });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Knowledge not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete knowledge:', error);
    res.status(500).json({ error: 'Failed to delete knowledge from database' });
  }
});

export default knowledgeRouter;
