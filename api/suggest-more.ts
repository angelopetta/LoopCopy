import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient } from './_client.js';

const categoryLabels: Record<string, string> = {
  audiences: 'target audience segments',
  values: 'core brand values',
  tones: 'tones of voice',
  angles: 'psychological hooks/angles',
  emotions: 'desired emotional responses',
  frameworks: 'copywriting frameworks',
  objectives: 'conversion objectives',
  hookTypes: 'opening line hook styles',
  contentStructures: 'content structure formats',
  ctaStyles: 'call-to-action styles',
  rhythms: 'sentence rhythm/pacing styles',
  painIntensities: 'pain point intensity levels',
  socialProofStyles: 'social proof approaches',
  readingLevels: 'reading level options',
  platformConventions: 'platform convention styles',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const anthropic = getClient();

    const { brandSeed, category, existing } = req.body;
    if (!brandSeed || !category || !Array.isArray(existing)) {
      return res.status(400).json({ error: 'brandSeed, category, and existing[] are required' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are an expert copywriter. Generate unique, creative options that are completely different from the existing ones.',
      messages: [
        {
          role: 'user',
          content: `Brand: "${brandSeed}"\n\nGenerate 4 MORE unique ${categoryLabels[category] || category} for a copywriting AI. They MUST be completely different from these existing ones: ${existing.join(', ')}`,
        },
      ],
      tools: [
        {
          name: 'save_items',
          description: 'Save the generated items',
          input_schema: {
            type: 'object' as const,
            properties: {
              items: {
                type: 'array',
                items: { type: 'string' },
                description: '4 new unique items',
              },
            },
            required: ['items'],
          },
        },
      ],
      tool_choice: { type: 'tool' as const, name: 'save_items' },
    });

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Failed to get suggestions from Claude');
    }
    return res.json({ items: (toolUse.input as { items: string[] }).items });
  } catch (error: any) {
    console.error('Suggest more error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to suggest more' });
  }
}
