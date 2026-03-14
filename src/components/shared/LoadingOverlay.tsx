import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  title: string;
  subtitle?: string;
}

export default function LoadingOverlay({ title, subtitle }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center"
    >
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-2 text-center">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
