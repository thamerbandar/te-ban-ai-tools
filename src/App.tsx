/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ToolTabs } from './components/ToolTabs';
import { YouTubeTitleGenerator } from './components/YouTubeTitleGenerator';
import { BloggerEmbedModal } from './components/BloggerEmbedModal';
import { Youtube, ShieldCheck, Code, Sparkles } from 'lucide-react';

export default function App() {
  const [activeToolId, setActiveToolId] = useState('youtube-title-generator');
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isEmbedMode, setIsEmbedMode] = useState(false);

  useEffect(() => {
    // Check if loaded in embed mode (e.g., inside an iframe on Blogger)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('embed') === 'true') {
      setIsEmbedMode(true);
    }
  }, []);

  if (isEmbedMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 font-sans dir-rtl">
        <div className="max-w-3xl mx-auto">
          <Header onOpenEmbedModal={() => setIsEmbedModalOpen(true)} isEmbedMode={true} />
          <main className="mt-3">
            <YouTubeTitleGenerator />
          </main>
          <footer className="mt-4 py-3 text-center text-xs text-slate-400 border-t border-slate-200/60">
            <span>مدعوم بواسطة <strong>Te-ban AI Tools</strong> لصناع المحتوى</span>
          </footer>
        </div>
        <BloggerEmbedModal
          isOpen={isEmbedModalOpen}
          onClose={() => setIsEmbedModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans dir-rtl">
      {/* Top Navbar */}
      <Header onOpenEmbedModal={() => setIsEmbedModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tool Navigation Bar (Extensible Architecture) */}
        <ToolTabs
          activeToolId={activeToolId}
          onSelectTool={(id) => setActiveToolId(id)}
        />

        {/* Active Tool View */}
        {activeToolId === 'youtube-title-generator' && <YouTubeTitleGenerator />}

        {/* Blogger Banner Helper */}
        <section className="mt-12 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="p-1.5 rounded-lg bg-red-600/30 text-red-400">
                <Code className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg">
                هل تملك مدونة على بلوجر (Blogger)؟
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm">
              يمكنك بسهولة تضمين هذه الأداة داخل مقالاتك أو في صفحة مخصصة بمدونتك بضغطة زر وبدون كتابة أكواد معقدة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEmbedModalOpen(true)}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            الحصول على كود التضمين
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
              <Youtube className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-700">Te-ban AI Tools</span>
            <span>&copy; {new Date().getFullYear()} - أدوات ذكاء اصطناعي لصناع المحتوى</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              حماية API آمنة بالكامل
            </span>
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="text-slate-600 hover:text-red-600 hover:underline cursor-pointer"
            >
              كود التضمين
            </button>
          </div>
        </div>
      </footer>

      {/* Blogger Embed Modal */}
      <BloggerEmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />
    </div>
  );
}
