import { History, GitCompare } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';

export default function VersionHistory() {
  const { versions, currentVersionIndex, compareVersions } = useSession();
  const dispatch = useDispatch();

  if (versions.length === 0) return null;

  return (
    <div className="w-72 bg-slate-50 border-l border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200 font-semibold text-sm text-slate-700 flex items-center justify-between">
        <span className="flex items-center">
          <History className="w-4 h-4 mr-2" /> Iteration History
        </span>
        {versions.length >= 2 && (
          <button
            onClick={() => {
              if (compareVersions) {
                dispatch({ type: 'SET_COMPARE_VERSIONS', payload: null });
              } else {
                dispatch({
                  type: 'SET_COMPARE_VERSIONS',
                  payload: [Math.max(0, versions.length - 2), versions.length - 1],
                });
              }
            }}
            className={`text-xs flex items-center px-2 py-1 rounded ${
              compareVersions
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-400 hover:text-indigo-600'
            }`}
            title="Compare versions side by side"
          >
            <GitCompare className="w-3 h-3 mr-1" />
            Compare
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {versions.map((v, idx) => (
          <div
            key={v.id}
            onClick={() => dispatch({ type: 'SET_CURRENT_VERSION', payload: idx })}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              idx === currentVersionIndex
                ? 'bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-transparent border-slate-200 hover:border-indigo-300 hover:bg-white'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`text-sm font-bold ${
                  idx === currentVersionIndex ? 'text-indigo-700' : 'text-slate-600'
                }`}
              >
                Version {v.id}
              </span>
            </div>
            {v.feedback ? (
              <p className="text-xs text-slate-500 line-clamp-2 italic">"{v.feedback}"</p>
            ) : (
              <p className="text-xs text-slate-400">Initial generation</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
