import { Router } from 'express';

const agentRouter = Router();

agentRouter.post('/', async (req, res) => {
  const { question, context } = req.body;
  if (!question || !context) return res.status(400).json({ error: 'Missing question or context' });

  // TODO: 调用实际的 LLM/MCP 逻辑
  const answer = '这是大模型生成的回复（占位）';
  res.json({ answer });
});

export default agentRouter; 