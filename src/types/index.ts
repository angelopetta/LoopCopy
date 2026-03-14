export interface BlackBoxParams {
  audiences: string[];
  values: string[];
  tones: string[];
  angles: string[];
  emotions: string[];
  frameworks: string[];
  objectives: string[];
  hookTypes: string[];
  contentStructures: string[];
  ctaStyles: string[];
  rhythms: string[];
  painIntensities: string[];
  socialProofStyles: string[];
  readingLevels: string[];
  platformConventions: string[];
}

export const PARAM_CATEGORIES: Array<{
  key: keyof BlackBoxParams;
  label: string;
  group: 'strategy' | 'craft';
  icon: string;
}> = [
  // Strategy: What to say & who to say it to
  { key: 'audiences', label: 'Target Audience', group: 'strategy', icon: 'Target' },
  { key: 'values', label: 'Core Values', group: 'strategy', icon: 'Heart' },
  { key: 'tones', label: 'Tone of Voice', group: 'strategy', icon: 'Mic' },
  { key: 'angles', label: 'Psychological Angle', group: 'strategy', icon: 'Brain' },
  { key: 'emotions', label: 'Desired Emotion', group: 'strategy', icon: 'Zap' },
  { key: 'frameworks', label: 'Copy Framework', group: 'strategy', icon: 'LayoutTemplate' },
  { key: 'objectives', label: 'Primary Objective', group: 'strategy', icon: 'Flag' },
  // Craft: How to say it
  { key: 'hookTypes', label: 'Hook Type', group: 'craft', icon: 'Anchor' },
  { key: 'contentStructures', label: 'Content Structure', group: 'craft', icon: 'List' },
  { key: 'ctaStyles', label: 'Call-to-Action', group: 'craft', icon: 'MousePointerClick' },
  { key: 'rhythms', label: 'Sentence Rhythm', group: 'craft', icon: 'AudioLines' },
  { key: 'painIntensities', label: 'Pain Intensity', group: 'craft', icon: 'Flame' },
  { key: 'socialProofStyles', label: 'Social Proof', group: 'craft', icon: 'Users' },
  { key: 'readingLevels', label: 'Reading Level', group: 'craft', icon: 'BookOpen' },
  { key: 'platformConventions', label: 'Platform', group: 'craft', icon: 'Globe' },
];

export const emptyParams: BlackBoxParams = {
  audiences: [], values: [], tones: [], angles: [], emotions: [],
  frameworks: [], objectives: [], hookTypes: [], contentStructures: [],
  ctaStyles: [], rhythms: [], painIntensities: [], socialProofStyles: [],
  readingLevels: [], platformConventions: [],
};

export interface Version {
  id: number;
  prompt: string;
  output: string;
  feedback?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type CopyLength = 'tweet' | 'short' | 'medium' | 'long' | 'custom';

export interface Preset {
  name: string;
  activeParams: BlackBoxParams;
  copyLength: CopyLength;
  customWordCount?: number;
}

export interface ContentTemplate {
  name: string;
  description: string;
  prompt: string;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    name: 'LinkedIn Post',
    description: 'Professional thought leadership post',
    prompt: 'Write a LinkedIn post about [TOPIC]. Include a compelling hook, personal insight or story, key takeaway, and engagement-driving question.',
  },
  {
    name: 'Twitter/X Thread',
    description: 'Multi-tweet thread with hook',
    prompt: 'Write a Twitter/X thread (5-7 tweets) about [TOPIC]. Start with a scroll-stopping hook tweet, build value in the middle tweets, and end with a strong CTA.',
  },
  {
    name: 'Instagram Caption',
    description: 'Visual-first social caption',
    prompt: 'Write an Instagram caption for a post about [TOPIC]. Make it lifestyle-forward, include relevant hashtag suggestions, and end with an engagement prompt.',
  },
  {
    name: 'Email Subject + Body',
    description: 'Marketing email with subject line options',
    prompt: 'Write a marketing email about [TOPIC]. Include 3 subject line options (A/B testable), a compelling preview text, and a scannable email body with a clear CTA.',
  },
  {
    name: 'Landing Page Hero',
    description: 'Above-the-fold copy',
    prompt: 'Write landing page hero copy for [TOPIC]. Include a main headline, sub-headline, 3 benefit bullets, and a CTA button text.',
  },
  {
    name: 'Ad Copy (Paid Social)',
    description: 'Short-form ad for paid campaigns',
    prompt: 'Write 3 variations of ad copy for [TOPIC]. Each variation should have: primary text (125 chars max), headline (40 chars), description (30 chars), and CTA.',
  },
  {
    name: 'Product Description',
    description: 'E-commerce product copy',
    prompt: 'Write a product description for [TOPIC]. Include a benefit-driven headline, feature-to-benefit copy, social proof elements, and urgency/scarcity angle.',
  },
  {
    name: 'Custom',
    description: 'Write your own brief',
    prompt: '',
  },
];

export type AppPhase = 'seed' | 'analyzing' | 'configuring' | 'workspace';

export interface SessionState {
  phase: AppPhase;
  brandSeed: string;
  suggestions: BlackBoxParams;
  activeParams: BlackBoxParams;
  concept: string;
  feedback: string;
  versions: Version[];
  currentVersionIndex: number;
  messages: Message[];
  isGenerating: boolean;
  streamingOutput: string;
  error: string | null;
  generatingCategory: keyof BlackBoxParams | null;
  copyLength: CopyLength;
  customWordCount: number;
  presets: Preset[];
  compareVersions: [number, number] | null;
}

export type SessionAction =
  | { type: 'SET_BRAND_SEED'; payload: string }
  | { type: 'START_ANALYSIS' }
  | { type: 'SET_SUGGESTIONS'; payload: BlackBoxParams }
  | { type: 'TOGGLE_PARAM'; payload: { category: keyof BlackBoxParams; value: string } }
  | { type: 'ADD_CUSTOM_PARAM'; payload: { category: keyof BlackBoxParams; value: string } }
  | { type: 'FINALIZE_SETUP' }
  | { type: 'SET_CONCEPT'; payload: string }
  | { type: 'START_GENERATION' }
  | { type: 'APPEND_STREAM_CHUNK'; payload: string }
  | { type: 'FINISH_GENERATION'; payload: { output: string; messages: Message[] } }
  | { type: 'SET_FEEDBACK'; payload: string }
  | { type: 'START_FEEDBACK' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }
  | { type: 'NEW_CONCEPT' }
  | { type: 'RESTORE_SESSION'; payload: Partial<SessionState> }
  | { type: 'SET_CURRENT_VERSION'; payload: number }
  | { type: 'START_SUGGEST_MORE'; payload: keyof BlackBoxParams }
  | { type: 'ADD_SUGGESTIONS'; payload: { category: keyof BlackBoxParams; items: string[] } }
  | { type: 'SET_COPY_LENGTH'; payload: CopyLength }
  | { type: 'SET_CUSTOM_WORD_COUNT'; payload: number }
  | { type: 'SAVE_PRESET'; payload: string }
  | { type: 'LOAD_PRESET'; payload: Preset }
  | { type: 'DELETE_PRESET'; payload: string }
  | { type: 'SET_COMPARE_VERSIONS'; payload: [number, number] | null }
  | { type: 'SET_ACTIVE_PARAMS'; payload: BlackBoxParams }
  | { type: 'ANALYSIS_FAILED' };
