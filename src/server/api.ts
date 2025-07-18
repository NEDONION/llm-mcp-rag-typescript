import express from 'express';
import contextRouter from './context';
import agentRouter from './agent';
import knowledgeRouter from './knowledge';
// import promptsRouter from './prompts';

const app = express();
app.use(express.json());

app.use('/api/context', contextRouter);
app.use('/api/agent', agentRouter);
app.use('/api/knowledge', knowledgeRouter);
// app.use('/api/prompts', promptsRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 