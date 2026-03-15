import Anthropic from '@anthropic-ai/sdk';

export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
      'Add it in your Vercel project settings under Settings → Environment Variables, ' +
      'then redeploy.'
    );
  }
  return new Anthropic();
}
