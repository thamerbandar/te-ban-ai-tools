import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  Hash,
  CheckCheck
} from 'lucide-react';
import { ContentType, TitleStyle, TitleCount, TitleGenerationResponse } from '../types';

export const YouTubeTitleGenerator: React.FC = () => {
  // Form State
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('تقني');
  const [targetAudience, setTargetAudience] = useState('');
  const [style, setStyle] = useState<TitleStyle>('جذاب');
  const [count, setCount] = useState<TitleCount>(5);

  // Interaction State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  // Validation
  const validateForm = (): string | null => {
    const trimmed = topic.trim();
    if (!trimmed) {
      return 'يرجى كتابة موضوع الفيديو في الحقل المخصص أولاً.';
    }
    if (trimmed.length < 3) {
      return 'موضوع الفيديو قصير جداً، يرجى كتابة فكرة أو جملة واضحة (3 أحرف على الأقل).';
    }
    if (trimmed.length > 500) {
      return 'موضوع الفيديو تجاوز الحد الأقصى (500 حرف). يرجى اختصار الفكرة.';
    }
    return null;
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent submitting while already loading
    if (isLoading) return;

    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          contentType,
          targetAudience: targetAudience.trim() || undefined,
          style,
          count,
        }),
      });

      const data: TitleGenerationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء معالجة الطلب، يرجى إعادة المحاولة.');
      }

      if (data.titles && Array.isArray(data.titles) && data.titles.length > 0) {
        setGeneratedTitles(data.titles);
        // Scroll smoothly to results on mobile/small screens
        setTimeout(() => {
          const resultsEl = document.getElementById('results-section');
          if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else {
        throw new Error('لم يتم استلام أي عناوين، يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      console.error('API call failed:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setErrorMessage('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.');
      } else {
        setErrorMessage(err.message || 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySingle = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  const handleCopyAll = async () => {
    if (generatedTitles.length === 0) return;
    const combined = generatedTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
    try {
      await navigator.clipboard.writeText(combined);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = combined;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2500);
    }
  };

  const handleResetAndRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="space-y-8">
      {/* Tool Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-3 border border-red-100">
              <Sparkles className="w-3.5 h-3.5" />
              أداة YouTube رقم 1
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              مولد عناوين YouTube بالذكاء الاصطناعي
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
              أنشئ عناوين جذابة ومناسبة لفيديوهات YouTube خلال ثوانٍ.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-8 space-y-6">
          {/* Topic Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="video-topic" className="block text-sm font-bold text-slate-800">
                موضوع الفيديو <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${topic.length > 450 ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                {topic.length} / 500 حرف
              </span>
            </div>
            <textarea
              id="video-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="اكتب موضوع الفيديو هنا بتفصيل بسيط... (مثال: طريقة بناء متجر إلكتروني احترافي بالذكاء الاصطناعي بدون خبرة برمجية في 15 دقيقة)"
              rows={3}
              maxLength={500}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base transition resize-y disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              كلما كان الموضوع محدداً وواضحاً، كانت العناوين أكثر ملاءمة وقوة.
            </p>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Content Type */}
            <div>
              <label htmlFor="content-type" className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع المحتوى
              </label>
              <select
                id="content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition disabled:bg-slate-50"
              >
                <option value="تقني">تقني</option>
                <option value="تعليمي">تعليمي</option>
                <option value="قصص">قصص</option>
                <option value="أخبار">أخبار</option>
                <option value="ترفيه">ترفيه</option>
                <option value="مراجعات">مراجعات</option>
                <option value="عام">عام</option>
              </select>
            </div>

            {/* Title Style */}
            <div>
              <label htmlFor="title-style" className="block text-xs font-bold text-slate-700 mb-1.5">
                أسلوب العنوان
              </label>
              <select
                id="title-style"
                value={style}
                onChange={(e) => setStyle(e.target.value as TitleStyle)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition disabled:bg-slate-50"
              >
                <option value="جذاب">جذاب (High CTR)</option>
                <option value="فضولي">فضولي (Curiosity)</option>
                <option value="مباشر">مباشر (Direct)</option>
                <option value="احترافي">احترافي (Professional)</option>
                <option value="تعليمي">تعليمي (How-To)</option>
              </select>
            </div>

            {/* Target Audience (Optional) */}
            <div>
              <label htmlFor="target-audience" className="block text-xs font-bold text-slate-700 mb-1.5">
                الجمهور المستهدف <span className="text-slate-400 font-normal">(اختياري)</span>
              </label>
              <input
                id="target-audience"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="مثال: المبتدئون، صناع المحتوى..."
                maxLength={150}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition placeholder:text-slate-400 disabled:bg-slate-50"
              />
            </div>

            {/* Count */}
            <div>
              <label htmlFor="titles-count" className="block text-xs font-bold text-slate-700 mb-1.5">
                عدد العناوين
              </label>
              <select
                id="titles-count"
                value={count}
                onChange={(e) => setCount(Number(e.target.value) as TitleCount)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition disabled:bg-slate-50"
              >
                <option value={5}>5 عناوين</option>
                <option value={10}>10 عناوين</option>
                <option value={15}>15 عنواناً</option>
              </select>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-xs text-red-600 mt-1">
                  يمكنك تعديل المدخلات والضغط على زر "توليد العناوين" للمحاولة مجدداً.
                </p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow shadow-red-200 flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري إنشاء العناوين...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>توليد العناوين</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Placeholder Banner */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">جاري إنشاء العناوين...</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            يقوم محرك الذكاء الاصطناعي الآن بتحليل موضوع الفيديو وصياغة عناوين متوافقة مع خوارزميات يوتيوب وأسلوبك المفضل.
          </p>
        </div>
      )}

      {/* Results Section */}
      {generatedTitles.length > 0 && !isLoading && (
        <div id="results-section" className="space-y-4">
          {/* Results Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                {generatedTitles.length}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">العناوين المقترحة</h3>
                <p className="text-xs text-slate-500">
                  تم توليدها بأسلوب "{style}" لنوع محتوى "{contentType}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                title="نسخ جميع العناوين بنقرة واحدة"
              >
                {allCopied ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">تم نسخ كل العناوين</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>نسخ كل العناوين</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetAndRegenerate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                title="توليد مجموعة عناوين جديدة لنفس الموضوع"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>توليد عناوين جديدة</span>
              </button>
            </div>
          </div>

          {/* Title Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {generatedTitles.map((title, index) => {
              const isCopied = copiedIndex === index;
              const formattedIndex = String(index + 1).padStart(2, '0');

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 hover:border-red-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-bold group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                      {formattedIndex}
                    </span>
                    <p className="text-slate-900 font-semibold text-base sm:text-lg leading-relaxed select-all">
                      {title}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(title, index)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-transparent'
                      }`}
                      title="نسخ العنوان إلى الحافظة"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>تم نسخ العنوان</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
