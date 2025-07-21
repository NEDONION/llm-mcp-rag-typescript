import { Router } from 'express';
import RAGService from '../service/RAGService';

const ragRouter = Router();
const rag = new RAGService(); // 默认模型 bge-m3

// GET /rag/retrieveFromMemory?prompt=xxx&topK=3
ragRouter.get('/retrieveFromMemory', async (req, res) => {
  const { prompt, topK } = req.query;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const context = await rag.retrieveContextFromMemory(String(prompt), Number(topK) || 3);
    res.json({ context });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve context' });
  }
});

// GET /rag/retrieveFromDB?prompt=xxx&topK=3
// 会超时因为不是[向量数据库]
ragRouter.get('/retrieveFromDB', async (req, res) => {
  const { prompt, topK } = req.query;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const context = await rag.retrieveContextFromDB(String(prompt), Number(topK) || 3);
    res.json({ context });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve context' });
  }
});

// POST /rag/embed
// { slug }
// POST /rag/embed
ragRouter.post('/embed', async (req, res) => {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'Missing slug as id of knowledge' });
  
    try {
      const result = await rag.saveEmbedding(slug);  // 获取插入后的内容
      res.json({ success: true, data: result });      // 返回给前端
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to embed content' });
    }
  });
  

// POST /rag/load
// { category, language, slug }
ragRouter.post('/load', async (req, res) => {
  const { category, language, slug } = req.body;
  try {
    await rag.loadFromDB({ category, language, slug });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load knowledge to memory' });
  }
});


// POST /rag/load-all-embeddings
ragRouter.post('/load-all-embeddings', async (req, res) => {
    try {
        await rag.loadEmbeddingsIntoVectorStoreFromDB(); // 调用服务层
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load all embeddings from DB' });
    }
});



// GET /rag/embeddings?category=movie
ragRouter.get('/embeddings', async (req, res) => {
    const { category, model } = req.query;
    try {
      const list = await rag.getEmbeddingList({ category: category as string, model: model as string });
      res.json({ success: true, list });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch embedding list' });
    }
  });


// GET /rag/vector-store
ragRouter.get('/vector-store', (req, res) => {
    try {
        const items = rag.getLoadedEmbeddingSummaries();
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read in-memory vector store' });
    }
});


// DELETE /rag/embedding?slug=xxx
ragRouter.delete('/embedding', async (req, res) => {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'Missing slug' });

    try {
        const result = await rag.removeEmbeddingFully(String(slug));
        if (result.removedFromMemory || result.removedFromDB) {
            res.json({
                success: true,
                message: `Removed embedding for slug=${slug}`,
                ...result
            });
        } else {
            res.status(404).json({ error: `No embedding found for slug=${slug}` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete embedding' });
    }
});


  

export default ragRouter;
