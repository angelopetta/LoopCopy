import { Router, Request, Response } from 'express';
import { analyzeBrand, suggestMore, createGenerateStream } from '../services/claude.js';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { brandSeed } = req.body;
    if (!brandSeed || typeof brandSeed !== 'string') {
      res.status(400).json({ error: 'brandSeed is required' });
      return;
    }
    const params = await analyzeBrand(brandSeed);
    res.json(params);
  } catch (error: any) {
    console.error('Analyze error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to analyze brand' });
  }
});

router.post('/suggest-more', async (req: Request, res: Response) => {
  try {
    const { brandSeed, category, existing } = req.body;
    if (!brandSeed || !category || !Array.isArray(existing)) {
      res.status(400).json({ error: 'brandSeed, category, and existing[] are required' });
      return;
    }
    const items = await suggestMore(brandSeed, category, existing);
    res.json({ items });
  } catch (error: any) {
    console.error('Suggest more error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to suggest more' });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { systemPrompt, messages } = req.body;
    if (!systemPrompt || !Array.isArray(messages)) {
      res.status(400).json({ error: 'systemPrompt and messages[] are required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = createGenerateStream(systemPrompt, messages);

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
    });

    stream.on('error', (error) => {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      stream.abort();
    });
  } catch (error: any) {
    console.error('Generate error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate' });
  }
});

export default router;
