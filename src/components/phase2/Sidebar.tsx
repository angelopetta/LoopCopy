import { useState } from 'react';
import { Settings2, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Target, Heart, Mic, Brain, Zap, LayoutTemplate, Flag, Anchor, List, MousePointerClick, AudioLines, Flame, Users, BookOpen, Globe, Gauge } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';
import { PARAM_CATEGORIES, type CopyLength } from '../../types/index.js';
import ParamCategory from '../phase1/ParamCategory.js';

const ICONS: Record<string, React.ReactNode> = {
  Target: <Target className="w-3.5 h-3.5" />,
  Heart: <Heart className="w-3.5 h-3.5" />,
  Mic: <Mic className="w-3.5 h-3.5" />,
  Brain: <Brain className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  LayoutTemplate: <LayoutTemplate className="w-3.5 h-3.5" />,
  Flag: <Flag className="w-3.5 h-3.5" />,
  Anchor: <Anchor className="w-3.5 h-3.5" />,
  List: <List className="w-3.5 h-3.5" />,
  MousePointerClick: <MousePointerClick className="w-3.5 h-3.5" />,
  AudioLines: <AudioLines className="w-3.5 h-3.5" />,
  Flame: <Flame className="w-3.5 h-3.5" />,
  Users: <Users className="w-3.5 h-3.5" />,
  BookOpen: <BookOpen className="w-3.5 h-3.5" />,
  Globe: <Globe className="w-3.5 h-3.5" />,
};

const LENGTH_OPTIONS: Array<{ value: CopyLength; label: string }> = [
  { value: 'tweet', label: 'Tweet (280 chars)' },
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (150-300 words)' },
  { value: 'long', label: 'Long (400-800 words)' },
  { value: 'custom', label: 'Custom' },
];

export default function Sidebar() {
  const state = useSession();
  const dispatch = useDispatch();
  const [strategyOpen, setStrategyOpen] = useState(true);
  const [craftOpen, setCraftOpen] = useState(true);
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const strategyParams = PARAM_CATEGORIES.filter((p) => p.group === 'strategy');
  const craftParams = PARAM_CATEGORIES.filter((p) => p.group === 'craft');

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    dispatch({ type: 'SAVE_PRESET', payload: presetName.trim() });
    setPresetName('');
    setShowPresetInput(false);
  };

  return (
    <div className="w-80 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 overflow-y-auto">
      <div className="p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
          <Settings2 className="w-4 h-4 mr-2 text-indigo-400" />
          Active Parameters
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tweaking these will drastically alter the next generation.
        </p>
        <div className="flex gap-2 mt-3">
          {showPresetInput ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                placeholder="Preset name..."
                autoFocus
                className="px-2 py-1 rounded text-xs bg-slate-800 border border-slate-600 text-slate-200 flex-1 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={handleSavePreset} className="text-indigo-400 hover:text-indigo-300 text-xs">
                Save
              </button>
              <button onClick={() => setShowPresetInput(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowPresetInput(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
              >
                <Save className="w-3 h-3 mr-1" /> Save Preset
              </button>
              {state.presets.length > 0 && (
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-xs text-slate-400 hover:text-slate-300 flex items-center"
                >
                  <FolderOpen className="w-3 h-3 mr-1" /> Load
                </button>
              )}
            </>
          )}
        </div>

        {showPresets && state.presets.length > 0 && (
          <div className="mt-2 space-y-1">
            {state.presets.map((preset) => (
              <div key={preset.name} className="flex items-center justify-between bg-slate-800 rounded px-2 py-1.5">
                <button
                  onClick={() => {
                    dispatch({ type: 'LOAD_PRESET', payload: preset });
                    setShowPresets(false);
                  }}
                  className="text-xs text-slate-200 hover:text-white truncate flex-1 text-left"
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_PRESET', payload: preset.name })}
                  className="text-slate-500 hover:text-red-400 ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Copy Length Control */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            <Gauge className="w-3.5 h-3.5 mr-2" />
            Copy Length
          </h3>
          <select
            value={state.copyLength}
            onChange={(e) => dispatch({ type: 'SET_COPY_LENGTH', payload: e.target.value as CopyLength })}
            className="w-full px-2 py-1.5 rounded-md text-xs bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {LENGTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {state.copyLength === 'custom' && (
            <input
              type="number"
              value={state.customWordCount}
              onChange={(e) => dispatch({ type: 'SET_CUSTOM_WORD_COUNT', payload: parseInt(e.target.value) || 0 })}
              placeholder="Word count"
              className="w-full px-2 py-1.5 rounded-md text-xs bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          )}
        </div>

        {/* Strategy Parameters */}
        <div>
          <button
            onClick={() => setStrategyOpen(!strategyOpen)}
            className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center mb-4 hover:text-indigo-300"
          >
            {strategyOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
            Strategy
          </button>
          {strategyOpen && (
            <div className="space-y-6">
              {strategyParams.map((param) => (
                <ParamCategory
                  key={param.key}
                  category={param.key}
                  label={param.label}
                  icon={ICONS[param.icon]}
                  variant="dark"
                />
              ))}
            </div>
          )}
        </div>

        {/* Craft Parameters */}
        <div>
          <button
            onClick={() => setCraftOpen(!craftOpen)}
            className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center mb-4 hover:text-indigo-300"
          >
            {craftOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
            Craft
          </button>
          {craftOpen && (
            <div className="space-y-6">
              {craftParams.map((param) => (
                <ParamCategory
                  key={param.key}
                  category={param.key}
                  label={param.label}
                  icon={ICONS[param.icon]}
                  variant="dark"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
