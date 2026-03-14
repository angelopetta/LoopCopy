import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient } from './_client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const anthropic = getClient();

    const { brandSeed } = req.body;
    if (!brandSeed || typeof brandSeed !== 'string') {
      return res.status(400).json({ error: 'brandSeed is required' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are the world's greatest direct-response and social media copywriter. Analyze the given brand/company description and generate the ultimate psychological, structural, and craft-level parameters for a copywriting AI engine.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this brand/company and generate copywriting parameters: "${brandSeed}"`,
        },
      ],
      tools: [
        {
          name: 'save_parameters',
          description: 'Save the generated copywriting parameters',
          input_schema: {
            type: 'object' as const,
            properties: {
              audiences: {
                type: 'array',
                items: { type: 'string' },
                description: "4 ultra-specific target audience segments",
              },
              values: {
                type: 'array',
                items: { type: 'string' },
                description: "4 core brand values to implicitly weave into copy",
              },
              tones: {
                type: 'array',
                items: { type: 'string' },
                description: "6 distinct tones of voice",
              },
              angles: {
                type: 'array',
                items: { type: 'string' },
                description: "4 psychological hooks/angles",
              },
              emotions: {
                type: 'array',
                items: { type: 'string' },
                description: "4 desired emotional responses from the reader",
              },
              frameworks: {
                type: 'array',
                items: { type: 'string' },
                description: "4 proven copywriting frameworks",
              },
              objectives: {
                type: 'array',
                items: { type: 'string' },
                description: "4 primary conversion objectives",
              },
              hookTypes: {
                type: 'array',
                items: { type: 'string' },
                description: "4 opening line hook styles",
              },
              contentStructures: {
                type: 'array',
                items: { type: 'string' },
                description: "4 content structure formats",
              },
              ctaStyles: {
                type: 'array',
                items: { type: 'string' },
                description: "4 call-to-action styles",
              },
              rhythms: {
                type: 'array',
                items: { type: 'string' },
                description: "4 sentence rhythm/pacing styles",
              },
              painIntensities: {
                type: 'array',
                items: { type: 'string' },
                description: "4 pain point intensity levels",
              },
              socialProofStyles: {
                type: 'array',
                items: { type: 'string' },
                description: "4 social proof approaches",
              },
              readingLevels: {
                type: 'array',
                items: { type: 'string' },
                description: "4 reading level options",
              },
              platformConventions: {
                type: 'array',
                items: { type: 'string' },
                description: "4 platform convention styles",
              },
            },
            required: [
              'audiences', 'values', 'tones', 'angles', 'emotions',
              'frameworks', 'objectives', 'hookTypes', 'contentStructures',
              'ctaStyles', 'rhythms', 'painIntensities', 'socialProofStyles',
              'readingLevels', 'platformConventions',
            ],
          },
        },
      ],
      tool_choice: { type: 'tool' as const, name: 'save_parameters' },
    });

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Failed to get structured parameters from Claude');
    }
    return res.json(toolUse.input);
  } catch (error: any) {
    console.error('Analyze error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to analyze brand' });
  }
}
