import { useState, useRef, useEffect } from 'react';
import { Download, Copy, FileText, FileJson, ChevronDown } from 'lucide-react';
import { useSession } from '../../context/SessionContext.js';
import { useExport } from '../../hooks/useExport.js';

export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { versions, currentVersionIndex } = useSession();
  const { copyToClipboard, exportCurrentVersion, exportAllVersions, exportSession } = useExport();

  const currentVersion = versions[currentVersionIndex];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentVersion) return null;

  const handleCopy = async () => {
    await copyToClipboard(currentVersion.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center"
      >
        <Download className="w-4 h-4 mr-1" />
        Export
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[200px]">
          <button
            onClick={() => { handleCopy(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center"
          >
            <Copy className="w-4 h-4 mr-2 text-slate-400" />
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
          <button
            onClick={() => { exportCurrentVersion(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2 text-slate-400" />
            Download as .md
          </button>
          {versions.length > 1 && (
            <button
              onClick={() => { exportAllVersions(); setOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2 text-slate-400" />
              Download all versions
            </button>
          )}
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => { exportSession(); setOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center"
          >
            <FileJson className="w-4 h-4 mr-2 text-slate-400" />
            Export session (JSON)
          </button>
        </div>
      )}
    </div>
  );
}
