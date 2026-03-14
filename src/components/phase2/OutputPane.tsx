import { FileText, Box } from 'lucide-react';
import Markdown from 'react-markdown';
import { useSession } from '../../context/SessionContext.js';
import ExportMenu from '../shared/ExportMenu.js';

export default function OutputPane() {
  const { versions, currentVersionIndex, isGenerating, streamingOutput, phase } = useSession();
  const currentVersion = versions[currentVersionIndex];
  const hasOutput = versions.length > 0 || isGenerating;

  if (!hasOutput && phase === 'workspace') {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center">
        <div>
          <Box className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">The Black Box is configured and ready.</p>
          <p className="text-sm mt-2">Enter a concept above to generate your first piece of copy.</p>
        </div>
      </div>
    );
  }

  const displayContent = isGenerating ? streamingOutput : currentVersion?.output || '';

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-500" />
            Generated Copy
            {currentVersion && (
              <span className="ml-3 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-mono">
                v{currentVersion.id}
              </span>
            )}
            {isGenerating && (
              <span className="ml-3 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full animate-pulse">
                streaming...
              </span>
            )}
          </h2>
          <ExportMenu />
        </div>
        <div className="prose prose-slate prose-indigo max-w-none">
          <Markdown>{displayContent}</Markdown>
          {isGenerating && (
            <span className="inline-block w-2 h-5 bg-indigo-500 animate-pulse ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}
