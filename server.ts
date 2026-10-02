import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing JSON with a strict payload size limit
app.use(express.json({ limit: '64kb' }));

// Allow iframe embedding from external domains (e.g. Blogger, Blogspot, custom domains)
app.use((_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// In-memory rate limiting to protect API cost and prevent abuse
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000; // 3 minutes window
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 title generation requests per IP per 3 min

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean old entries periodically
  if (rateLimitMap.size > 2000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'Te-ban AI Tools Server',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API endpoint for generating YouTube titles
app.post('/api/generate-titles', async (req, res) => {
  try {
    // 1. IP extraction and rate limiting
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: `لقد تجاوزت عدد الطلبات المسموح به مؤقتاً لحماية الخدمة. يرجى المحاولة بعد ${rateLimit.retryAfterSeconds} ثانية.`,
      });
    }

    // 2. Validate input fields
    const { topic, contentType, targetAudience, style, count } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'يرجى إدخال موضوع الفيديو لتوليد العناوين.',
      });
    }

    const trimmedTopic = topic.trim();
    if (trimmedTopic.length < 3) {
      return res.status(400).json({
        error: 'موضوع الفيديو قصير جداً. يرجى كتابة فكرة أو وصف أكثر وضوحاً (3 أحرف على الأقل).',
      });
    }

    if (trimmedTopic.length > 500) {
      return res.status(400).json({
        error: 'موضوع الفيديو طويل جداً. الحد الأقصى المسموح به هو 500 حرف لترشيد الاستهلاك.',
      });
    }

    const allowedContentTypes = ['تقني', 'تعليمي', 'قصص', 'أخبار', 'ترفيه', 'مراجعات', 'عام'];
    const validContentType = allowedContentTypes.includes(contentType) ? contentType : 'عام';

    const allowedStyles = ['جذاب', 'فضولي', 'مباشر', 'احترافي', 'تعليمي'];
    const validStyle = allowedStyles.includes(style) ? style : 'جذاب';

    const allowedCounts = [5, 10, 15];
    const requestedCount = allowedCounts.includes(Number(count)) ? Number(count) : 5;

    const sanitizedAudience =
      typeof targetAudience === 'string' && targetAudience.trim().length > 0
        ? targetAudience.trim().slice(0, 150)
        : null;

    // 3. Verify Gemini API Key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable.');
      return res.status(500).json({
        error: 'مفتاح Gemini API غير مهيأ على الخادم. يرجى ضبط GEMINI_API_KEY.',
      });
    }

    // 4. Initialize GoogleGenAI SDK on server-side
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `
أنت خبير محترف واستراتيجي في كتابة عناوين فيديوهات YouTube باللغة العربية (YouTube Title Strategist & Copywriter).

مهمتك: صياغة عناوين يوتيوب ذات نسبة نقر عالية (High CTR) تناسب عادات المشاهد العربي وفق القواعد التالية:
1. الارتباط بالموضوع: كل عنوان يجب أن يرتبط مباشرة بموضوع الفيديو المدخل من المستخدم دون اختلاق أرقام أو ادعاءات وهمية.
2. منع التضليل (No Fake Clickbait): اجعل العنوان مشوقاً وجذاباً دون وعود كاذبة.
3. التنوع: قدّم زوايا مختلفة في الصياغة (طرح سؤال، أسلوب إرشادي، كشف أسرار، تسليط الضوء على نتيجة مميزة، مقارنة).
4. عدم وضع علامات اقتباس (" " أو « ») حول العناوين.
5. عدم وضع أرقام تسلسلية داخل نص العنوان لأن النتائج تُعاد في مصفوفة JSON.
6. اللغة: عربية فصيحة، سلسة، وعصرية.
`.trim();

    const userPrompt = `
أنشئ بالضبط ${requestedCount} عنواناً مميزاً ومتنوعاً لفيديو يوتيوب:
- موضوع الفيديو: ${trimmedTopic}
- نوع المحتوى: ${validContentType}
- الأسلوب المطلوب: ${validStyle}
${sanitizedAudience ? `- الجمهور المستهدف: ${sanitizedAudience}` : ''}
- العدد المطلوب: ${requestedCount}
`.trim();

    // Call models with fallback (try fast & cost-efficient gemini-3.1-flash-lite, fallback to gemini-3.8-flash)
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;
    let responseText = '';

    for (const modelName of modelsToTry) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), 15000);
        });

        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                titles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                    description: 'عنوان مقترح لفيديو يوتيوب بدون علامات اقتباس أو ترقيم',
                  },
                  description: 'مصفوفة العناوين المولدة',
                },
              },
              required: ['titles'],
            },
          },
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response.text && response.text.trim()) {
          responseText = response.text.trim();
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('FAILED_ALL_MODELS');
    }

    let parsedData: { titles?: string[] } = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('INVALID_JSON');
      }
    }

    const rawTitles = Array.isArray(parsedData.titles) ? parsedData.titles : [];
    const cleanTitles = rawTitles
      .map((t) => (typeof t === 'string' ? t.replace(/^["'«»“”\s]+|["'«»“”\s]+$/g, '').trim() : ''))
      .filter((t) => t.length > 0)
      .slice(0, requestedCount);

    if (cleanTitles.length === 0) {
      return res.status(500).json({
        error: 'تعذر استخراج العناوين بالصيغة المطلوبة، يرجى المحاولة مرة أخرى.',
      });
    }

    return res.json({
      success: true,
      count: cleanTitles.length,
      titles: cleanTitles,
      meta: {
        contentType: validContentType,
        style: validStyle,
      },
    });
  } catch (err: any) {
    console.error('Error generating YouTube titles:', err);

    if (err?.message === 'TIMEOUT') {
      return res.status(504).json({
        error: 'استغرق طلب توليد العناوين وقتاً أطول من المعتاد. يرجى إعادة المحاولة.',
      });
    }

    const errStr = String(err?.message || err);
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'تم استهلاك حد الاستخدام المتاح مؤقتاً في Gemini API. يرجى المحاولة بعد دقيقة واحدة.',
      });
    }

    if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) {
      return res.status(503).json({
        error: 'خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً حالياً. يرجى إعادة المحاولة خلال ثوانٍ.',
      });
    }

    if (errStr.includes('API_KEY_INVALID') || errStr.includes('not valid')) {
      return res.status(401).json({
        error: 'مفتاح Gemini API غير صالح أو غير مصرح له. يرجى التحقق من إعدادات المفتاح.',
      });
    }

    return res.status(500).json({
      error: 'حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة لاحقاً.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Te-ban AI Tools] Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
