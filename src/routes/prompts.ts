// import { Router } from 'express';
// import fs from 'fs';
// import path from 'path';

// const router = Router();
// const promptsDir = path.resolve(__dirname, '../../prompts');

// router.get('/', (req, res) => {
//   let files: string[] = [];
//   try {
//     files = fs.readdirSync(promptsDir).filter(f => f.endsWith('.md'));
//   } catch (e) {
//     return res.status(500).json({ error: 'Failed to read prompts directory' });
//   }
//   res.json({ files });
// });

// export default router; 