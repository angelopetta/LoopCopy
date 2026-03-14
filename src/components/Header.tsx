import { Box, RotateCcw } from 'lucide-react';
import { useSession, useDispatch } from '../context/SessionContext.js';

export default function Header() {
  const { phase } = useSession();
  const dispatch = useDispatch();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-slate-900 p-2 rounded-lg shadow-inner">
          <Box className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-none">LoopCopy</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">
            Elite Copywriting Engine
          </p>
        </div>
      </div>
      {phase !== 'seed' && (
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Start Over
        </button>
      )}
    </header>
  );
}
