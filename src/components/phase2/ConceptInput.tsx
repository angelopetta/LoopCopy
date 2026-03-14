import { useState } from 'react';
import { Sparkles, FileText, ChevronDown, RefreshCw } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';
import { useAI } from '../../hooks/useAI.js';
import { CONTENT_TEMPLATES } from '../../types/index.js';

export default function ConceptInput() {
  const { concept, isGenerating, versions } = useSession();
  const dispatch = useDispatch();
  const { generateCopy } = useAI();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (prompt: string) => {
    dispatch({ type: 'SET_CONCEPT', payload: prompt });
    setShowTemplates(false);
  };

  return (
    <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={concept}
              onChange={(e) => dispatch({ type: 'SET_CONCEPT', payload: e.target.value })}
              placeholder="What specific piece of copy do you need right now? (e.g., 'Instagram post announcing our summer sale')"
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && concept.trim() && generateCopy()}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="h-full px-4 rounded-xl border border-slate-300 text-slate-600 hover:bg-white hover:border-indigo-300 flex items-center text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Templates
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[280px]">
                {CONTENT_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleTemplateSelect(template.prompt)}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
                  >
                    <div className="text-sm font-medium text-slate-800">{template.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={generateCopy}
            disabled={!concept.trim() || isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium flex items-center shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Generate
          </button>
          {versions.length > 0 && (
            <button
              onClick={() => dispatch({ type: 'NEW_CONCEPT' })}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-white hover:border-indigo-300 flex items-center text-sm font-medium transition-colors whitespace-nowrap"
              title="Start new concept (keep parameters)"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              New
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
