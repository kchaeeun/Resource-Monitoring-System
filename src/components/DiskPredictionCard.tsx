import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { calculateDiskExhaustion } from '../utils/prediction';
import { HardDrive, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export const DiskPredictionCard: React.FC = () => {
  const { metrics } = useConsoleStore();

  const pred = calculateDiskExhaustion(metrics.storage.used_pct, metrics.storage.growth_pct_day);

  return (
    <div className={`p-4 rounded-xl border transition shadow-sm ${
      pred.isCritical
        ? 'border-rose-400/50 bg-rose-500/5 dark:bg-rose-950/20'
        : pred.isWarning
        ? 'border-amber-400/50 bg-amber-500/5 dark:bg-amber-950/20'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className={`w-4 h-4 ${pred.isCritical ? 'text-rose-500' : 'text-amber-500'}`} />
          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
            디스크 고갈 시간 예측 (F10)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          PV 스토리지 추이 모델링
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 block">현재 볼륨 사용률</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {pred.currentPct}%
          </span>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                pred.currentPct >= 90 ? 'bg-rose-500' : pred.currentPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, pred.currentPct)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sky-500" /> 일일 사용량 증가율
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            +{pred.growthPctDay}
            <span className="text-xs font-normal text-slate-500 ml-0.5">%/day</span>
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            잔여 여유 공간: {pred.remainingPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 예측 결과 배너 */}
      <div className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold ${
        pred.isCritical
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
          : pred.isWarning
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
      }`}>
        {pred.isCritical ? (
          <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
        ) : (
          <Clock className="w-4 h-4 flex-shrink-0" />
        )}
        <div className="flex-1">
          <span>100% 가득 찰 때까지: <strong>{pred.estimatedFullDateText}</strong></span>
          {pred.isCritical && (
            <p className="text-[10px] font-normal text-rose-600 dark:text-rose-400 mt-0.5">
              ⚠️ 긴급 용량 증설 또는 logrotate 아카이브 정리가 즉시 필요합니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
