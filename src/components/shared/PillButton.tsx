import { X, Plus } from 'lucide-react';

interface Props {
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'light' | 'dark';
  tooltip?: string;
}

export default function PillButton({ label, isActive, onClick, variant = 'light', tooltip }: Props) {
  if (variant === 'dark') {
    return (
      <button
        onClick={onClick}
        title={tooltip}
        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center text-left group ${
          isActive
            ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-500'
            : 'bg-transparent text-slate-500 border border-dashed border-slate-700 hover:text-slate-300 hover:border-slate-500'
        }`}
      >
        {!isActive && <Plus className="w-3 h-3 mr-1.5 opacity-60 group-hover:opacity-100 shrink-0" />}
        <span>{label}</span>
        {isActive && <X className="w-3 h-3 ml-1.5 opacity-40 group-hover:opacity-100 group-hover:text-red-400 shrink-0" />}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border text-left ${
        isActive
          ? 'bg-indigo-100 border-indigo-300 text-indigo-800 shadow-sm'
          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
      }`}
    >
      {label}
      {isActive && <X className="w-3 h-3 inline-block ml-1.5 opacity-60" />}
    </button>
  );
}
