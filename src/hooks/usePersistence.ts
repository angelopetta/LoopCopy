import { useEffect, useRef } from 'react';
import { useSession, useDispatch } from '../context/SessionContext.js';
import type { SessionState } from '../types/index.js';

const STORAGE_KEY = 'loopcopy_session';
const PRESETS_KEY = 'loopcopy_presets';

const PERSISTED_KEYS: Array<keyof SessionState> = [
  'phase', 'brandSeed', 'suggestions', 'activeParams', 'concept',
  'versions', 'currentVersionIndex', 'messages', 'copyLength', 'customWordCount',
];

export function usePersistence() {
  const state = useSession();
  const dispatch = useDispatch();
  const hasRestored = useRef(false);

  // Restore on mount
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if there's actual content worth restoring
        if (parsed.phase && parsed.phase !== 'seed' && parsed.brandSeed) {
          // Don't restore transient states
          if (parsed.phase === 'analyzing') parsed.phase = 'seed';
          dispatch({ type: 'RESTORE_SESSION', payload: parsed });
        }
      }
      const presets = localStorage.getItem(PRESETS_KEY);
      if (presets) {
        dispatch({ type: 'RESTORE_SESSION', payload: { presets: JSON.parse(presets) } });
      }
    } catch {
      // Corrupted storage, ignore
    }
  }, [dispatch]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const toSave: Record<string, any> = {};
        for (const key of PERSISTED_KEYS) {
          toSave[key] = state[key];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        localStorage.setItem(PRESETS_KEY, JSON.stringify(state.presets));
      } catch {
        // Storage full or unavailable
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state]);
}
