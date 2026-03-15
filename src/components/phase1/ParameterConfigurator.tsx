import { Box, ArrowRight, Target, Heart, Mic, Brain, Zap, LayoutTemplate, Flag, Anchor, List, MousePointerClick, AudioLines, Flame, Users, BookOpen, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useDispatch } from '../../context/SessionContext.js';
import { PARAM_CATEGORIES } from '../../types/index.js';
import ParamCategory from './ParamCategory.js';

const ICONS: Record<string, React.ReactNode> = {
  Target: <Target className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  LayoutTemplate: <LayoutTemplate className="w-4 h-4" />,
  Flag: <Flag className="w-4 h-4" />,
  Anchor: <Anchor className="w-4 h-4" />,
  List: <List className="w-4 h-4" />,
  MousePointerClick: <MousePointerClick className="w-4 h-4" />,
  AudioLines: <AudioLines className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
};

export default function ParameterConfigurator() {
  const dispatch = useDispatch();
  const strategyParams = PARAM_CATEGORIES.filter((p) => p.group === 'strategy');
  const craftParams = PARAM_CATEGORIES.filter((p) => p.group === 'craft');

  return (
    <motion.div
      key="configure"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-start justify-center p-6 bg-slate-50/80 backdrop-blur-sm z-10 overflow-y-auto"
    >
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="p-8 border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <Box className="w-6 h-6 mr-3 text-indigo-400" />
            Configure Black Box Parameters
          </h2>
          <p className="text-slate-400 mt-2">
            The AI has generated 15 elite copywriting parameters based on your brand.
            Select the active modules for your engine.
          </p>
        </div>

        <div className="p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Strategy — What to say & who to say it to
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {strategyParams.map((param) => (
              <ParamCategory
                key={param.key}
                category={param.key}
                label={param.label}
                icon={ICONS[param.icon]}
              />
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Craft — How to say it
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {craftParams.map((param) => (
                <ParamCategory
                  key={param.key}
                  category={param.key}
                  label={param.label}
                  icon={ICONS[param.icon]}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => dispatch({ type: 'FINALIZE_SETUP' })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center shadow-sm"
          >
            Initialize System <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
