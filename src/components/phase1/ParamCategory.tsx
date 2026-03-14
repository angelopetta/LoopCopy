import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';
import { useAI } from '../../hooks/useAI.js';
import PillButton from '../shared/PillButton.js';
import type { BlackBoxParams } from '../../types/index.js';

// Tooltip descriptions for common parameters
const TOOLTIPS: Record<string, string> = {
  'Problem-Agitate-Solve (PAS)': 'Identify a problem, amplify the pain, then present your solution',
  'AIDA': 'Attention → Interest → Desire → Action: a classic sales funnel in copy',
  'Before-After-Bridge (BAB)': 'Show the current state, paint the ideal future, bridge with your product',
  'Staccato (short. punchy.)': 'Short sentences. No fluff. Every word earns its place.',
  'Flowing Narrative': 'Longer, connected sentences that draw readers in with a warm, meandering cadence',
  'Mixed Rhythm': 'Varies between long buildup sentences and short punchy lines for emphasis',
  'Bold Contrarian Claim': 'Opens with a provocative statement that challenges conventional wisdom',
  'Shocking Statistic': 'Leads with a surprising number that stops the scroll',
  'Personal Confession': 'Starts with a vulnerable admission that builds instant relatability',
  'Provocative Question': 'Opens with a question that makes the reader pause and think',
  'Aspirational (light touch)': 'Gently paints a picture of what\'s possible without pressing hard',
  'Aggressive Agitation': 'Directly confronts the reader with the cost of inaction',
  'Data-Driven (stats)': 'Builds credibility through specific numbers, percentages, and research',
  'Testimonial-Led': 'Establishes trust through customer quotes and success stories',
  'Grade 5 (simple)': 'Short words, simple sentences. Everyone understands it instantly.',
  'Grade 8 (clear but educated)': 'Clear writing that assumes basic education. Most marketing copy.',
  'Technical / Jargon-Heavy': 'Insider language that signals you\'re part of the tribe',
};

interface Props {
  category: keyof BlackBoxParams;
  label: string;
  icon: React.ReactNode;
  variant?: 'light' | 'dark';
}

export default function ParamCategory({ category, label, icon, variant = 'light' }: Props) {
  const { suggestions, activeParams, generatingCategory } = useSession();
  const dispatch = useDispatch();
  const { suggestMore } = useAI();
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const items = suggestions[category];
  const isLoading = generatingCategory === category;

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    dispatch({ type: 'ADD_CUSTOM_PARAM', payload: { category, value: customInput.trim() } });
    setCustomInput('');
    setShowCustom(false);
  };

  return (
    <div className="space-y-3">
      <h3
        className={`text-sm font-semibold flex items-center uppercase tracking-wider ${
          variant === 'dark' ? 'text-slate-400 text-xs' : 'text-slate-700'
        }`}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <PillButton
            key={item}
            label={item}
            isActive={activeParams[category].includes(item)}
            onClick={() => dispatch({ type: 'TOGGLE_PARAM', payload: { category, value: item } })}
            variant={variant}
            tooltip={TOOLTIPS[item]}
          />
        ))}
        <button
          onClick={() => suggestMore(category)}
          disabled={isLoading}
          className={`px-2.5 py-1.5 rounded-${variant === 'dark' ? 'md' : 'full'} text-${variant === 'dark' ? 'xs' : 'sm'} font-medium border border-dashed border-indigo-${variant === 'dark' ? '500/30' : '300'} text-indigo-${variant === 'dark' ? '400' : '600'} hover:${variant === 'dark' ? 'text-indigo-300 hover:border-indigo-400' : 'bg-indigo-50'} flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          )}
          {variant === 'dark' ? 'More' : 'Suggest More'}
        </button>
        {variant === 'dark' && (
          showCustom ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="Custom..."
                autoFocus
                className="px-2 py-1 rounded-md text-xs bg-slate-800 border border-slate-600 text-slate-200 w-32 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={handleAddCustom} className="text-indigo-400 hover:text-indigo-300">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 flex items-center transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" />
              Custom
            </button>
          )
        )}
      </div>
    </div>
  );
}
