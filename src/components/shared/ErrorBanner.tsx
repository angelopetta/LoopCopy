import { AlertTriangle, X } from 'lucide-react';
import { useSession, useDispatch } from '../../context/SessionContext.js';

export default function ErrorBanner() {
  const { error } = useSession();
  const dispatch = useDispatch();

  if (!error) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center text-red-800 text-sm">
        <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
        <span>{error}</span>
      </div>
      <button
        onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
        className="text-red-400 hover:text-red-600 ml-4"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
