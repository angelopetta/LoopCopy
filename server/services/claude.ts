import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\n⚠️  ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.\n');
}

const anthropic = new Anthropic();

export async function analyzeBrand(brandSeed: string) {
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
              description:
                "4 ultra-specific target audience segments (e.g., 'Time-starved millennial founders', 'Eco-anxious urbanites')",
            },
            values: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 core brand values to implicitly weave into copy (e.g., 'Radical Transparency', 'Relentless Innovation')",
            },
            tones: {
              type: 'array',
              items: { type: 'string' },
              description:
                "6 distinct tones of voice (e.g., 'Conversational & Witty', 'Authoritative & Strategic')",
            },
            angles: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 psychological hooks/angles (e.g., 'The Contrarian Take', 'FOMO & Scarcity', 'Curiosity Gap')",
            },
            emotions: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 desired emotional responses from the reader (e.g., 'Empowered', 'Understood', 'Urgent Action')",
            },
            frameworks: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 proven copywriting frameworks (e.g., 'Problem-Agitate-Solve (PAS)', 'AIDA', 'Before-After-Bridge')",
            },
            objectives: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 primary conversion objectives (e.g., 'Drive Link Clicks', 'Spark Debate/Comments', 'Direct Sales')",
            },
            hookTypes: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 opening line hook styles (e.g., 'Bold Contrarian Claim', 'Shocking Statistic', 'Personal Confession', 'Provocative Question')",
            },
            contentStructures: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 content structure formats (e.g., 'Listicle (numbered tips)', 'Story Arc', 'Hot Take / Opinion', 'Before & After Transformation')",
            },
            ctaStyles: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 call-to-action styles (e.g., 'Soft Engagement (comment your take)', 'Direct Conversion (buy now)', 'Curiosity Bridge (link in bio)', 'No CTA (value-only)')",
            },
            rhythms: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 sentence rhythm/pacing styles (e.g., 'Staccato (short. punchy.)', 'Flowing Narrative', 'Mixed Rhythm', 'One-Word Paragraph Emphasis')",
            },
            painIntensities: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 pain point intensity levels (e.g., 'Aspirational (light touch)', 'Empathetic Nudge', 'Direct Challenge', 'Aggressive Agitation')",
            },
            socialProofStyles: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 social proof approaches (e.g., 'Data-Driven (stats)', 'Testimonial-Led', 'Authority (endorsed by)', 'Peer Proof (10k founders already...)')",
            },
            readingLevels: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 reading level options (e.g., 'Grade 5 (simple)', 'Grade 8 (clear but educated)', 'Slang & Casual', 'Technical / Jargon-Heavy')",
            },
            platformConventions: {
              type: 'array',
              items: { type: 'string' },
              description:
                "4 platform convention styles (e.g., 'LinkedIn (professional storytelling)', 'Twitter/X (punchy, contrarian)', 'Instagram (lifestyle-forward)', 'Email (scannable)')",
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
  return toolUse.input as Record<string, string[]>;
}

export async function suggestMore(
  brandSeed: string,
  category: string,
  existing: string[]
) {
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
  return (toolUse.input as { items: string[] }).items;
}

export function createGenerateStream(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  return anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });
}
