import { useCallback } from 'react';
import { useSession, useDispatch } from '../context/SessionContext.js';
import type { BlackBoxParams, CopyLength, Message } from '../types/index.js';

function buildSystemPrompt(activeParams: BlackBoxParams, copyLength: CopyLength, customWordCount: number): string {
  const lengthInstruction: Record<CopyLength, string> = {
    tweet: 'Keep the copy under 280 characters (tweet-length).',
    short: 'Keep the copy concise — around 50-100 words.',
    medium: 'Aim for medium length — around 150-300 words.',
    long: 'Write comprehensive, detailed copy — 400-800 words.',
    custom: `Aim for approximately ${customWordCount} words.`,
  };

  return `You are an elite, world-class copywriter operating inside a highly configured closed-loop system. You write copy that converts, resonates, and stops the scroll.

CRITICAL SYSTEM PARAMETERS (The Black Box):

STRATEGY — What to say & who to say it to:
- Target Audience: ${activeParams.audiences.join(', ') || 'General Audience'}
- Core Brand Values: ${activeParams.values.join(', ') || 'Standard'}
- Tone of Voice: ${activeParams.tones.join(', ') || 'Professional'}
- Psychological Angle/Hook: ${activeParams.angles.join(', ') || 'Direct'}
- Desired Reader Emotion: ${activeParams.emotions.join(', ') || 'Interested'}
- Copywriting Framework: ${activeParams.frameworks.join(', ') || 'Standard'}
- Primary Objective: ${activeParams.objectives.join(', ') || 'Inform'}

CRAFT — How to say it:
- Hook Type (Opening Line): ${activeParams.hookTypes.join(', ') || 'Best judgment'}
- Content Structure: ${activeParams.contentStructures.join(', ') || 'Best judgment'}
- Call-to-Action Style: ${activeParams.ctaStyles.join(', ') || 'Best judgment'}
- Sentence Rhythm/Pacing: ${activeParams.rhythms.join(', ') || 'Mixed'}
- Pain Point Intensity: ${activeParams.painIntensities.join(', ') || 'Moderate'}
- Social Proof Style: ${activeParams.socialProofStyles.join(', ') || 'As appropriate'}
- Reading Level: ${activeParams.readingLevels.join(', ') || 'Grade 8'}
- Platform Convention: ${activeParams.platformConventions.join(', ') || 'Platform-Agnostic'}

LENGTH: ${lengthInstruction[copyLength]}

INSTRUCTIONS:
1. The user will provide a concept. Generate the absolute best possible written copy adhering STRICTLY to ALL parameters above.
2. Structure the copy using the requested 'Copywriting Framework' and 'Content Structure'.
3. Open with the specified 'Hook Type' — the first line must stop the scroll.
4. Match the 'Sentence Rhythm/Pacing' throughout the copy.
5. Apply the 'Pain Point Intensity' level when addressing the reader's challenges.
6. Incorporate 'Social Proof Style' naturally where appropriate.
7. Write at the specified 'Reading Level' — vocabulary and sentence complexity should match.
8. Follow 'Platform Convention' rules for formatting and style.
9. End with the specified 'Call-to-Action Style'.
10. Ensure the copy evokes the 'Desired Reader Emotion' and drives towards the 'Primary Objective'.
11. The user may provide feedback on your output. Analyze the feedback, adjust, and generate a revised version.
12. Always provide the full revised copy in your response without conversational filler.`;
}

export function useAI() {
  const state = useSession();
  const dispatch = useDispatch();

  const analyzeBrand = useCallback(async () => {
    dispatch({ type: 'START_ANALYSIS' });
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandSeed: state.brandSeed }),
      });
      if (!res.ok) {
        let message = 'Failed to analyze brand';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          // Response body may be empty or not JSON
        }
        if (res.status === 500 && message.includes('API key')) {
          message = 'Anthropic API key is not configured. Add ANTHROPIC_API_KEY to your .env file.';
        }
        throw new Error(message);
      }
      const params = await res.json();
      dispatch({ type: 'SET_SUGGESTIONS', payload: params });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to analyze brand' });
      dispatch({ type: 'ANALYSIS_FAILED' });
    }
  }, [state.brandSeed, dispatch]);

  const suggestMore = useCallback(async (category: keyof BlackBoxParams) => {
    dispatch({ type: 'START_SUGGEST_MORE', payload: category });
    try {
      const res = await fetch('/api/suggest-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSeed: state.brandSeed,
          category,
          existing: state.suggestions[category],
        }),
      });
      if (!res.ok) {
        let message = 'Failed to suggest more';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          // Response body may be empty or not JSON
        }
        throw new Error(message);
      }
      const { items } = await res.json();
      dispatch({ type: 'ADD_SUGGESTIONS', payload: { category, items } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to suggest more' });
      dispatch({ type: 'ADD_SUGGESTIONS', payload: { category, items: [] } });
    }
  }, [state.brandSeed, state.suggestions, dispatch]);

  const generateCopy = useCallback(async () => {
    dispatch({ type: 'START_GENERATION' });

    const systemPrompt = buildSystemPrompt(state.activeParams, state.copyLength, state.customWordCount);
    const userMessage: Message = { role: 'user', content: `Concept to write about: ${state.concept}` };
    const messages = [...state.messages, userMessage];

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages }),
      });

      if (!res.ok) {
        let message = 'Failed to generate';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          // Response body may be empty or not JSON
        }
        throw new Error(message);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') {
              fullOutput += data.text;
              dispatch({ type: 'APPEND_STREAM_CHUNK', payload: data.text });
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      const assistantMessage: Message = { role: 'assistant', content: fullOutput };
      dispatch({
        type: 'FINISH_GENERATION',
        payload: { output: fullOutput, messages: [...messages, assistantMessage] },
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to generate copy' });
    }
  }, [state.activeParams, state.copyLength, state.customWordCount, state.concept, state.messages, dispatch]);

  const submitFeedback = useCallback(async () => {
    dispatch({ type: 'START_FEEDBACK' });

    const systemPrompt = buildSystemPrompt(state.activeParams, state.copyLength, state.customWordCount);
    const feedbackMessage: Message = {
      role: 'user',
      content: `SYSTEM UPDATE: Ensure you are strictly following these updated parameters:

STRATEGY: Audience(${state.activeParams.audiences.join(', ')}), Values(${state.activeParams.values.join(', ')}), Tone(${state.activeParams.tones.join(', ')}), Angle(${state.activeParams.angles.join(', ')}), Emotion(${state.activeParams.emotions.join(', ')}), Framework(${state.activeParams.frameworks.join(', ')}), Objective(${state.activeParams.objectives.join(', ')})

CRAFT: Hook(${state.activeParams.hookTypes.join(', ')}), Structure(${state.activeParams.contentStructures.join(', ')}), CTA(${state.activeParams.ctaStyles.join(', ')}), Rhythm(${state.activeParams.rhythms.join(', ')}), Pain(${state.activeParams.painIntensities.join(', ')}), Proof(${state.activeParams.socialProofStyles.join(', ')}), Reading Level(${state.activeParams.readingLevels.join(', ')}), Platform(${state.activeParams.platformConventions.join(', ')})

USER FEEDBACK on previous output: ${state.feedback}

Please provide the revised copy.`,
    };
    const messages = [...state.messages, feedbackMessage];

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages }),
      });

      if (!res.ok) {
        let message = 'Failed to process feedback';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          // Response body may be empty or not JSON
        }
        throw new Error(message);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') {
              fullOutput += data.text;
              dispatch({ type: 'APPEND_STREAM_CHUNK', payload: data.text });
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      const assistantMessage: Message = { role: 'assistant', content: fullOutput };
      dispatch({
        type: 'FINISH_GENERATION',
        payload: { output: fullOutput, messages: [...messages, assistantMessage] },
      });
      dispatch({ type: 'SET_FEEDBACK', payload: '' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to process feedback' });
    }
  }, [state.activeParams, state.copyLength, state.customWordCount, state.feedback, state.messages, dispatch]);

  return { analyzeBrand, suggestMore, generateCopy, submitFeedback };
}
