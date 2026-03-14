import { useCallback } from 'react';
import { useSession } from '../context/SessionContext.js';

export function useExport() {
  const state = useSession();

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const downloadMarkdown = useCallback((text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportCurrentVersion = useCallback(() => {
    const version = state.versions[state.currentVersionIndex];
    if (!version) return;
    downloadMarkdown(version.output, `loopcopy-v${version.id}.md`);
  }, [state.versions, state.currentVersionIndex, downloadMarkdown]);

  const exportAllVersions = useCallback(() => {
    const content = state.versions
      .map((v) => `# Version ${v.id}\n\n${v.output}\n\n${v.feedback ? `> Feedback: ${v.feedback}\n` : ''}`)
      .join('\n---\n\n');
    downloadMarkdown(content, 'loopcopy-all-versions.md');
  }, [state.versions, downloadMarkdown]);

  const exportSession = useCallback(() => {
    const session = {
      brandSeed: state.brandSeed,
      activeParams: state.activeParams,
      copyLength: state.copyLength,
      versions: state.versions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loopcopy-session.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state.brandSeed, state.activeParams, state.copyLength, state.versions]);

  return { copyToClipboard, downloadMarkdown, exportCurrentVersion, exportAllVersions, exportSession };
}
