import React, { useState } from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { formatReportMarkdown } from '../api/agent';
import { FileText, Copy, Download, Check, X } from 'lucide-react';

export const EscalationModal: React.FC = () => {
  const { isEscalationModalOpen, closeEscalationModal, currentReport, currentScenario } = useConsoleStore();
  const [copied, setCopied] = useState(false);

  if (!isEscalationModalOpen || !currentReport) return null;

  const docContent = `# [장애 진단 및 기술지원 이관 요청서]
발행 시각: ${new Date().toLocaleString('ko-KR')}
시스템 환경: RHEL 9.2 / Kubernetes v1.28
시나리오 ID: ${currentScenario}
진단 리포트 ID: ${currentReport.id}

---

${formatReportMarkdown(currentReport)}

---
*주의: 본 문서는 AI 진단 에이전트의 확인 사실 기반 분석 결과이며, 민감 식별자는 마스킹 처리되었습니다.*
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(docContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([docContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escalation-report-${currentScenario}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm">
              벤더·파트너 전달용 에스컬레이션 문서 (F5)
            </h3>
          </div>
          <button
            onClick={closeEscalationModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 미리보기 */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 select-all">
            {docContent}
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            마스킹(이메일·IP) 및 런북 절차가 포함된 정형 Markdown 문서입니다.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨!' : '클립보드 복사'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
