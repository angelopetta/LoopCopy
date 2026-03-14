import { Settings2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Wand2 } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';
import { useAI } from '../../hooks/useAI.js';

export default function BrandSeedInput() {
  const { brandSeed, phase } = useSession();
  const dispatch = useDispatch();
  const { analyzeBrand } = useAI();
  const isAnalyzing = phase === 'analyzing';

  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 flex items-center justify-center p-6 bg-slate-50 z-10"
    >
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
            <Wand2 className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Define the Black Box</h2>
          <p className="text-lg text-slate-500">
            Tell us briefly about your brand or project. Our AI will generate 15 elite copywriting parameters
            — from target audience to sentence rhythm — to configure your custom engine.
          </p>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <textarea
            value={brandSeed}
            onChange={(e) => dispatch({ type: 'SET_BRAND_SEED', payload: e.target.value })}
            disabled={isAnalyzing}
            placeholder="e.g., We are a B2B SaaS company selling AI analytics to enterprise marketing teams. We want to sound smart, authoritative, but approachable."
            className="w-full h-32 p-4 bg-transparent border-none resize-none focus:ring-0 text-lg placeholder:text-slate-400 disabled:opacity-50"
          />
          <div className="flex justify-end p-2">
            <button
              onClick={analyzeBrand}
              disabled={!brandSeed.trim() || isAnalyzing}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Brand...
                </>
              ) : (
                <>
                  <Settings2 className="w-5 h-5 mr-2" /> Generate Parameters
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
