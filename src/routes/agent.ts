import { Router } from 'express';
import Agent from '../clients/Agent';
import MCPClient from '../clients/MCPClient';
import path from "path";

const agentRouter = Router();

// 初始化 MCPClient 和 Agent（你可以根据需要动态配置工具）
const outPath = path.join(process.cwd(), 'output');

const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", ['mcp-server-fetch']);
const fileMCP = new MCPClient("mcp-server-file", "npx", ['-y', '@modelcontextprotocol/server-filesystem', outPath]);

const mcpClients = [fetchMCP, fileMCP];
let agent: Agent | null = null;

// 延迟初始化 Agent（只初始化一次）
async function getAgent(systemPrompt: string, context: string) {
  if (!agent) {
    agent = new Agent('gpt-4', mcpClients, systemPrompt, context);
    await agent.init();
  }
  return agent;
}

// 处理聊天请求
agentRouter.post('/chat', async (req, res) => {
  const { question, context = '', systemPrompt = '' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const agentInstance = await getAgent(systemPrompt, context);
    const answer = await agentInstance.invoke(question);
    res.json({ answer });
  } catch (err) {
    console.error('[Agent Error]', err);
    res.status(500).json({ error: err || 'Internal Server Error' });
  }
});

// 处理流式聊天请求
agentRouter.get('/stream', async (req, res) => {
  const { question, context = '', systemPrompt = '' } = req.query;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' });
  }

  const agentInstance = await getAgent(systemPrompt as string, context as string);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const token of agentInstance.stream(question)) {
      res.write(`data: ${token}\n\n`);
    }

    res.write('event: end\ndata: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[Stream Error]', err);
    res.write(`event: error\ndata: ${(err as Error).message}\n\n`);
    res.end();
  }
});



export default agentRouter;
