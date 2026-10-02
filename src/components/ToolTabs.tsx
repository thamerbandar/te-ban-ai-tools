import React from 'react';
import { TOOLS_CONFIG } from '../config/tools';
import { 
  Heading, 
  FileText, 
  Lightbulb, 
  Sparkles, 
  Anchor, 
  Tag, 
  ScrollText, 
  Lock 
} from 'lucide-react';

interface ToolTabsProps {
  activeToolId: string;
  onSelectTool: (id: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Heading: <Heading className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Lightbulb: <Lightbulb className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Anchor: <Anchor className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
  ScrollText: <ScrollText className="w-4 h-4" />,
};

export const ToolTabs: React.FC<ToolTabsProps> = ({ activeToolId, onSelectTool }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          مجموعة أدوات Te-ban
        </h2>
        <span className="text-xs text-slate-400">
          أداة نشطة + 6 أدوات قيد التطوير
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
        {TOOLS_CONFIG.map((tool) => {
          const isActive = tool.id === activeToolId;
          const isComingSoon = tool.status === 'coming_soon';

          return (
            <button
              key={tool.id}
              onClick={() => {
                if (!isComingSoon) {
                  onSelectTool(tool.id);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-200'
                  : isComingSoon
                  ? 'bg-white/80 text-slate-400 border-slate-200 hover:border-slate-300 cursor-not-allowed opacity-80'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title={isComingSoon ? `${tool.title} (قيد الإعداد للمرحلة القادمة)` : tool.title}
            >
              <span className={isActive ? 'text-white' : isComingSoon ? 'text-slate-400' : 'text-red-600'}>
                {iconMap[tool.icon] || <Heading className="w-4 h-4" />}
              </span>
              <span>{tool.title}</span>
              {isComingSoon && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-normal px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200">
                  <Lock className="w-2.5 h-2.5" />
                  قريباً
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
