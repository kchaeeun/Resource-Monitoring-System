import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useConsoleStore();

  if (auditLogs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-4 text-center text-xs text-slate-500">
        <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-slate-400" />
        <span>아직 실행된 조치 감사 기록이 없습니다. (2단계 승인 후 조치 실행 시 영구 보관됩니다.)</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          승인 조치 감사 로그 (Audit Log - F6)
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          총 {auditLogs.length}건 보관
        </span>
      </div>

      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {log.actionTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {log.executedAt}
              </span>
            </div>

            <p className="text-[11px] text-slate-700 dark:text-slate-300">
              {log.resultDescription}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>승인자: <strong>{log.approvedBy}</strong></span>
              <span>사유: {log.approvalNotes}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                2단계 승인 완료
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
