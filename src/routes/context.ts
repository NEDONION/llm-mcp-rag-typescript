import { Router } from 'express';

const contextRouter = Router();

contextRouter.post('/', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  // TODO: 调用实际的检索逻辑
  const context = '这是检索到的上下文（占位）';
  const sourceDocs = ['doc1.md', 'doc2.md'];
  res.json({ context, sourceDocs });
});

export default contextRouter; 