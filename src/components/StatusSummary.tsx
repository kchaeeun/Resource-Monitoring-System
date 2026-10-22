import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { METRIC_DEFINITIONS } from '../utils/thresholds';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

export const StatusSummary: React.FC = () => {
  const { activeAlerts } = useConsoleStore();

  const totalMetricCount = Object.keys(METRIC_DEFINITIONS).length;
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;
  const normalCount = Math.max(0, totalMetricCount - (criticalCount + warningCount));

  let systemState: { text: string; bg: string; textCol: string; border: string; icon: React.ReactNode; desc: string } = {
    text: '정상 (Healthy)',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    textCol: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
    desc: '모든 시스템과 서비스 지표가 정상 허용 범위 내에 있습니다.'
  };

  if (criticalCount > 0) {
    systemState = {
      text: '위험 (Critical)',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      textCol: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
      desc: '서비스 영향이 우려되는 치명적 경보가 발생했습니다. 진단 및 조치가 요구됩니다.'
    };
  } else if (warningCount > 0) {
    systemState = {
      text: '경고 (Warning)',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      textCol: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      desc: '일부 지표가 주의 임계치에 도달했습니다. 선제적 모니터링이 필요합니다.'
    };
  }

  return (
    <section aria-label="시스템 전체 상태 요약" className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. 전체 상태 카드 */}
      <div className={`p-4 rounded-xl border ${systemState.border} ${systemState.bg} flex items-center gap-4 transition shadow-sm`}>
        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
          {systemState.icon}
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            전체 시스템 상태 (F1)
          </span>
          <span className={`text-lg font-bold ${systemState.textCol} block`}>
            {systemState.text}
          </span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
            {systemState.desc}
          </p>
        </div>
      </div>

      {/* 2. 활성 경보 수 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            활성 경보 (Active Alerts)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeAlerts.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              (위험 {criticalCount} · 경고 {warningCount})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            실시간 임계치 초과 지표
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* 3. 정상 지표 수 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            정상 지표 수 (Healthy)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {normalCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / 총 {totalMetricCount}개
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            규정 한도 내 안정 상태 유지
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* 4. 감시 인프라 계층 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            모니터링 계층
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              4
            </span>
            <span className="text-xs font-medium text-slate-500">
              계층 통합 감시
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            RHEL • K8s • 솔루션 • 스토리지
          </span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          4-Layer
        </div>
      </div>
    </section>
  );
};
