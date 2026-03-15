import { MessageSquare, ArrowRight } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';
import { useAI } from '../../hooks/useAI.js';

export default function FeedbackBar() {
  const { feedback, versions, currentVersionIndex, isGenerating } = useSession();
  const dispatch = useDispatch();
  const { submitFeedback } = useAI();

  // Only show when viewing the latest version and not generating
  if (versions.length === 0 || currentVersionIndex !== versions.length - 1 || isGenerating) {
    return null;
  }

  return (
    <div className="p-4 border-t-2 border-indigo-200 bg-indigo-50/50 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-10">
      <div className="max-w-4xl mx-auto">
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
          Assess & Refine (The Loop)
        </label>
        <div className="flex gap-4">
          <textarea
            value={feedback}
            onChange={(e) => dispatch({ type: 'SET_FEEDBACK', payload: e.target.value })}
            placeholder="What should be improved? (e.g., 'Make it punchier', 'Focus more on the sustainability value')"
            className="flex-1 h-14 min-h-[56px] max-h-32 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (feedback.trim()) submitFeedback();
              }
            }}
          />
          <button
            onClick={submitFeedback}
            disabled={!feedback.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 rounded-xl font-medium flex items-center transition-colors shrink-0"
          >
            Feed back into loop <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Tip: You can also tweak the parameters in the left sidebar before submitting feedback to drastically alter the next version.
        </p>
      </div>
    </div>
  );
}
