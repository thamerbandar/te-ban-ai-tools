import React from 'react';
import { Youtube, Code, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenEmbedModal: () => void;
  isEmbedMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenEmbedModal, isEmbedMode = false }) => {
  if (isEmbedMode) {
    return (
      <header className="py-2.5 px-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight">Te-ban AI Tools</span>
            <span className="text-[11px] text-slate-500 block -mt-1">مولد عناوين YouTube</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          نسخة آمنة ومجانية
        </span>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-sm shadow-red-200">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Te-ban AI Tools</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500">أدوات ذكاء اصطناعي متخصصة لصناع محتوى YouTube</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenEmbedModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            title="تضمين الأداة في مدونة بلوجر"
          >
            <Code className="w-4 h-4 text-red-600" />
            <span>تضمين في Blogger</span>
          </button>
        </div>
      </div>
    </header>
  );
};
