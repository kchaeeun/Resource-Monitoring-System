import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { Clock, AlertTriangle, Play, FileCheck, CheckCircle2, Info } from 'lucide-react';
import { TimelineEvent } from '../types';

export const Timeline: React.FC = () => {
  const { timeline } = useConsoleStore();

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'diagnosis_start':
        return <Play className="w-3.5 h-3.5 text-indigo-500 fill-current" />;
      case 'diagnosis_complete':
        return <FileCheck className="w-3.5 h-3.5 text-sky-500" />;
      case 'action_applied':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <section aria-label="경보 및 대응 타임라인 (F9)" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-500" />
          경보 & 대응 타임라인 (F9)
        </h3>
        <span className="text-[11px] text-slate-500">실시간 순차 기록</span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
        {timeline.map((evt, idx) => (
          <div key={evt.id} className="relative flex items-start gap-3 pl-1">
            {/* 연결선 */}
            {idx < timeline.length - 1 && (
              <div className="absolute left-[13px] top-6 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-800" />
            )}

            {/* 아이콘 원 */}
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 z-10 border border-slate-200 dark:border-slate-700">
              {getEventIcon(evt.type)}
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {evt.title}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono flex-shrink-0">
                  {evt.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
                {evt.description}
              </p>
              {evt.badge && (
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {evt.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
