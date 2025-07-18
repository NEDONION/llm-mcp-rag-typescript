import { Router } from 'express';
import { connectMongo } from '../db/mongoClient';
import mongoose from 'mongoose';
import slugify from 'slugify';

const knowledgeRouter = Router();

// 定义 Knowledge 模型
const KnowledgeSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    language: { type: String, enum: ['en', 'zh'], required: true },
    content: { type: String, required: true },
  }, { timestamps: true });
  
  
const Knowledge = mongoose.models.Knowledge || mongoose.model('Knowledge', KnowledgeSchema);

// 获取知识库列表
knowledgeRouter.get('/', async (req, res) => {
  await connectMongo();
  try {
    const list = await Knowledge.find({}, { _id: 0, __v: 0 });
    res.json({ list });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read knowledge from db' });
  }
});

// 上传知识库
knowledgeRouter.post('/', async (req, res) => {
    await connectMongo();
    const { category, title, language, content } = req.body;
    if (!category || !title || !language || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const slug = slugify(`${title}-${language}`, { lower: true });
  
    try {
      await Knowledge.findOneAndUpdate(
        { slug },
        { category, title, language, content },
        { upsert: true, new: true }
      );
      res.json({ success: true, slug });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save knowledge to db' });
    }
  });

  // 删除知识库
  knowledgeRouter.delete('/:slug', async (req, res) => {
    await connectMongo();
    const { slug } = req.params;
    try {
      await Knowledge.deleteOne({ slug });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete knowledge' });
    }
  });
  

export default knowledgeRouter; 