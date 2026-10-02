export type ContentType =
  | 'تقني'
  | 'تعليمي'
  | 'قصص'
  | 'أخبار'
  | 'ترفيه'
  | 'مراجعات'
  | 'عام';

export type TitleStyle =
  | 'جذاب'
  | 'فضولي'
  | 'مباشر'
  | 'احترافي'
  | 'تعليمي';

export type TitleCount = 5 | 10 | 15;

export interface TitleGenerationParams {
  topic: string;
  contentType: ContentType;
  targetAudience: string;
  style: TitleStyle;
  count: TitleCount;
}

export interface TitleGenerationResponse {
  success?: boolean;
  count?: number;
  titles?: string[];
  meta?: {
    contentType: string;
    style: string;
  };
  error?: string;
}

export interface ToolItem {
  id: string;
  title: string;
  shortDesc: string;
  badge?: string;
  status: 'active' | 'coming_soon';
  icon: string;
}
