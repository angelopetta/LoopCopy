import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import {
  type SessionState,
  type SessionAction,
  emptyParams,
} from '../types/index.js';

const initialState: SessionState = {
  phase: 'seed',
  brandSeed: '',
  suggestions: emptyParams,
  activeParams: emptyParams,
  concept: '',
  feedback: '',
  versions: [],
  currentVersionIndex: 0,
  messages: [],
  isGenerating: false,
  streamingOutput: '',
  error: null,
  generatingCategory: null,
  copyLength: 'medium',
  customWordCount: 300,
  presets: [],
  compareVersions: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_BRAND_SEED':
      return { ...state, brandSeed: action.payload };

    case 'START_ANALYSIS':
      return { ...state, phase: 'analyzing', error: null };

    case 'ANALYSIS_FAILED':
      return { ...state, phase: 'seed' };

    case 'SET_SUGGESTIONS': {
      const suggestions = action.payload;
      // Auto-select first item from each category
      const activeParams = { ...emptyParams };
      for (const key of Object.keys(suggestions) as Array<keyof typeof suggestions>) {
        activeParams[key] = suggestions[key]?.slice(0, 1) || [];
      }
      return { ...state, suggestions, activeParams, phase: 'configuring' };
    }

    case 'TOGGLE_PARAM': {
      const { category, value } = action.payload;
      const current = state.activeParams[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...state, activeParams: { ...state.activeParams, [category]: updated } };
    }

    case 'ADD_CUSTOM_PARAM': {
      const { category, value } = action.payload;
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [category]: [...state.suggestions[category], value],
        },
        activeParams: {
          ...state.activeParams,
          [category]: [...state.activeParams[category], value],
        },
      };
    }

    case 'FINALIZE_SETUP':
      return { ...state, phase: 'workspace' };

    case 'SET_CONCEPT':
      return { ...state, concept: action.payload };

    case 'START_GENERATION':
      return { ...state, isGenerating: true, streamingOutput: '', error: null };

    case 'APPEND_STREAM_CHUNK':
      return { ...state, streamingOutput: state.streamingOutput + action.payload };

    case 'FINISH_GENERATION': {
      const newVersion = {
        id: state.versions.length + 1,
        prompt: state.concept,
        output: action.payload.output,
      };
      const versions = [...state.versions, newVersion];
      return {
        ...state,
        isGenerating: false,
        streamingOutput: '',
        versions,
        currentVersionIndex: versions.length - 1,
        messages: action.payload.messages,
      };
    }

    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };

    case 'START_FEEDBACK': {
      const updatedVersions = [...state.versions];
      updatedVersions[state.currentVersionIndex] = {
        ...updatedVersions[state.currentVersionIndex],
        feedback: state.feedback,
      };
      return { ...state, versions: updatedVersions, isGenerating: true, streamingOutput: '', error: null };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isGenerating: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'RESET':
      return { ...initialState, presets: state.presets };

    case 'NEW_CONCEPT':
      return {
        ...state,
        concept: '',
        feedback: '',
        versions: [],
        currentVersionIndex: 0,
        messages: [],
        isGenerating: false,
        streamingOutput: '',
        compareVersions: null,
      };

    case 'RESTORE_SESSION':
      return { ...state, ...action.payload };

    case 'SET_CURRENT_VERSION':
      return { ...state, currentVersionIndex: action.payload };

    case 'START_SUGGEST_MORE':
      return { ...state, generatingCategory: action.payload };

    case 'ADD_SUGGESTIONS': {
      const { category, items } = action.payload;
      return {
        ...state,
        generatingCategory: null,
        suggestions: {
          ...state.suggestions,
          [category]: [...state.suggestions[category], ...items],
        },
      };
    }

    case 'SET_COPY_LENGTH':
      return { ...state, copyLength: action.payload };

    case 'SET_CUSTOM_WORD_COUNT':
      return { ...state, customWordCount: action.payload };

    case 'SAVE_PRESET': {
      const preset = {
        name: action.payload,
        activeParams: state.activeParams,
        copyLength: state.copyLength,
        customWordCount: state.customWordCount,
      };
      const existingIdx = state.presets.findIndex((p) => p.name === action.payload);
      const presets = existingIdx >= 0
        ? state.presets.map((p, i) => (i === existingIdx ? preset : p))
        : [...state.presets, preset];
      return { ...state, presets };
    }

    case 'LOAD_PRESET':
      return {
        ...state,
        activeParams: action.payload.activeParams,
        copyLength: action.payload.copyLength,
        customWordCount: action.payload.customWordCount,
      };

    case 'DELETE_PRESET':
      return { ...state, presets: state.presets.filter((p) => p.name !== action.payload) };

    case 'SET_COMPARE_VERSIONS':
      return { ...state, compareVersions: action.payload };

    case 'SET_ACTIVE_PARAMS':
      return { ...state, activeParams: action.payload };

    default:
      return state;
  }
}

const SessionContext = createContext<SessionState>(initialState);
const DispatchContext = createContext<Dispatch<SessionAction>>(() => {});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  return (
    <SessionContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function useDispatch() {
  return useContext(DispatchContext);
}
