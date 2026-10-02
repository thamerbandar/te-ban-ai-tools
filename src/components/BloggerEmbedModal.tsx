import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';

interface BloggerEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloggerEmbedModal: React.FC<BloggerEmbedModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const [customDomain, setCustomDomain] = useState(defaultOrigin);

  if (!isOpen) return null;

  const isDevUrl = defaultOrigin.includes('ais-dev-') || defaultOrigin.includes('localhost') || defaultOrigin.includes('127.0.0.1');
  const activeUrl = customDomain.trim() ? customDomain.trim().replace(/\/+$/, '') : defaultOrigin;
  const embedUrl = `${activeUrl}/?embed=true`;

  const embedCode = `<!-- بداية كود تضمين أداة Te-ban AI Tools في بلوجر -->
<div style="width: 100%; max-width: 850px; margin: 0 auto; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
  <iframe
    src="${embedUrl}"
    title="مولد عناوين YouTube بالذكاء الاصطناعي - Te-ban AI Tools"
    width="100%"
    height="750"
    style="border: none; display: block; width: 100%; min-height: 700px;"
    loading="lazy"
    allow="clipboard-write"
  ></iframe>
</div>
<!-- نهاية كود التضمين -->`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
              &lt;/&gt;
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                تضمين الأداة في مدونة بلوجر (Blogger)
              </h3>
              <p className="text-xs text-slate-500">
                طريقة آمنة ومتجاوبة بدون كشف مفتاح API
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Explanation for 401 Error in Dev Mode */}
          {isDevUrl && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>تنبيه هام بخصوص خطأ 401 في بيئة التطوير الحالية:</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                رابط بيئة المعاينة الحالية (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">ais-dev-...run.app</code>) هو نطاق سحابي خاص ومحمي بصلاحيات حساب المطور في جوجل. لذلك عند تضمينه داخل إطار Blogger تمنع جوجل وصول الزوار بدون تسجيل دخول وتُظهر الخطأ <strong>401 Unauthorized</strong>.
              </p>
              <p className="text-xs text-amber-900 font-semibold">
                لجعل الأداة تعمل لجميع زوار مدونتك دون أي قيود: انشر التطبيق على استضافة مجانية عامة (مثل Render أو Vercel أو Cloud Run) وضع رابط استضافتك في الحقل أدناه ليتم تحديث كود التضمين فوراً.
              </p>
            </div>
          )}

          {/* Custom Domain Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>رابط استضافة الأداة الخاص بك:</span>
            </label>
            <input
              type="url"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="https://your-app-domain.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono dir-ltr text-left focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              يتغير رابط الـ iframe تلقائياً بالرابط الذي تضعه أعلاه.
            </span>
          </div>

          {/* Iframe Code Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                كود التضمين المباشر (HTML Iframe)
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 dir-ltr text-left leading-relaxed">
              {embedCode}
            </pre>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              خطوات وضع الكود في Blogger:
            </h4>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>داخل مقال أو صفحة ثابتة:</strong> افتح محرر المقال في Blogger، ثم حوّل وضع العرض من "عرض التأليف" إلى <strong>"عرض HTML"</strong>، والصق الكود أعلاه في المكان المناسب.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>في الشريط الجانبي أو التخطيط:</strong> اذهب إلى لوحة تحكم Blogger &gt; <strong>التنسيق (Layout)</strong> &gt; انقر على "إضافة أداة" &gt; اختر <strong>HTML/JavaScript</strong> والصق الكود.
                </span>
              </li>
            </ol>
          </div>

          {/* Security Note */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">أمان تام للمفتاح:</p>
              <p className="mt-0.5 text-emerald-800">
                مهما كان مكان التضمين، يظل استدعاء الذكاء الاصطناعي معزولاً في الخادم الخلفي، ولا يستطيع أي زائر أو أداة فحص استخراج مفتاح Gemini API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
