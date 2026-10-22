import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { Box, CheckCircle2, Clock, AlertOctagon, XCircle } from 'lucide-react';
import { PodInfo } from '../types';

export const PodGrid: React.FC = () => {
  const { pods } = useConsoleStore();

  const getStatusBadge = (status: PodInfo['status']) => {
    switch (status) {
      case 'Running':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          text: 'Running (정상 가동)',
          style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        };
      case 'Pending':
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          text: 'Pending (스케줄 대기)',
          style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        };
      case 'CrashLoopBackOff':
        return {
          icon: <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />,
          text: 'CrashLoopBackOff (비정상 종료)',
          style: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
        };
      case 'Error':
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          text: 'Error (실패)',
          style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        };
      case 'Completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          text: 'Completed (완료)',
          style: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        };
    }
  };

  return (
    <section aria-label="쿠버네티스 파드 상태 그리드 (F8)" className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>쿠버네티스 파드 상태 그리드 (F8)</span>
        </h2>
        <span className="text-xs text-slate-500">
          총 {pods.length}개 파드 감시 중
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {pods.map((pod) => {
          const badge = getStatusBadge(pod.status);
          const isError = pod.status === 'CrashLoopBackOff' || pod.status === 'Error';

          return (
            <div
              key={pod.name}
              className={`p-3 rounded-xl border transition shadow-sm ${
                isError
                  ? 'border-rose-400/50 bg-rose-500/5 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Box className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span
                    className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate"
                    title={pod.name}
                  >
                    {pod.name}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${badge.style}`}
                >
                  {badge.icon}
                  <span>{badge.text}</span>
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>네임스페이스:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {pod.namespace}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>재시작 횟수:</span>
                  <span
                    className={`font-mono font-bold ${
                      pod.restarts >= 5 ? 'text-rose-600 dark:text-rose-400' : ''
                    }`}
                  >
                    {pod.restarts}회
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>리소스 (CPU/Mem):</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {pod.cpuUsage} / {pod.memUsage}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
