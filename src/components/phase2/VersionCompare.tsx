import { X } from 'lucide-react';
import Markdown from 'react-markdown';
import { useSession, useDispatch } from '../../context/SessionContext.js';

export default function VersionCompare() {
  const { versions, compareVersions } = useSession();
  const dispatch = useDispatch();

  if (!compareVersions || versions.length < 2) return null;

  const [leftIdx, rightIdx] = compareVersions;
  const left = versions[leftIdx];
  const right = versions[rightIdx];

  if (!left || !right) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <h3 className="text-lg font-bold text-slate-800">Version Comparison</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <label className="text-slate-500">Left:</label>
              <select
                value={leftIdx}
                onChange={(e) =>
                  dispatch({ type: 'SET_COMPARE_VERSIONS', payload: [parseInt(e.target.value), rightIdx] })
                }
                className="border border-slate-300 rounded px-2 py-1 text-sm"
              >
                {versions.map((v, i) => (
                  <option key={v.id} value={i}>
                    v{v.id}
                  </option>
                ))}
              </select>
              <label className="text-slate-500 ml-2">Right:</label>
              <select
                value={rightIdx}
                onChange={(e) =>
                  dispatch({ type: 'SET_COMPARE_VERSIONS', payload: [leftIdx, parseInt(e.target.value)] })
                }
                className="border border-slate-300 rounded px-2 py-1 text-sm"
              >
                {versions.map((v, i) => (
                  <option key={v.id} value={i}>
                    v{v.id}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_COMPARE_VERSIONS', payload: null })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 border-r border-slate-100">
            <div className="text-sm font-semibold text-indigo-600 mb-3">Version {left.id}</div>
            <div className="prose prose-slate prose-sm max-w-none">
              <Markdown>{left.output}</Markdown>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-sm font-semibold text-indigo-600 mb-3">Version {right.id}</div>
            <div className="prose prose-slate prose-sm max-w-none">
              <Markdown>{right.output}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
