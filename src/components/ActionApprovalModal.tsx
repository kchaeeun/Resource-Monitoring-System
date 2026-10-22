import React, { useState, useEffect } from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { ShieldCheck, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';
import { maskSensitiveData } from '../utils/masking';

export const ActionApprovalModal: React.FC = () => {
  const {
    isApprovalModalOpen,
    closeApprovalModal,
    currentReport,
    executeApprovedAction
  } = useConsoleStore();

  const [step1Agreed, setStep1Agreed] = useState(false);
  const [adminName, setAdminName] = useState('홍길동 (엔지니어)');
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    if (currentReport) {
      setApprovalNotes(
        `런북 ${currentReport.suggestedAction.runbookId} 절차에 따른 [${currentReport.suggestedAction.actionTitle}] 실행 승인`
      );
      setStep1Agreed(false);
    }
  }, [currentReport, isApprovalModalOpen]);

  if (!isApprovalModalOpen || !currentReport) return null;

  const handleConfirm = () => {
    if (!step1Agreed) return;
    const safeAdmin = maskSensitiveData(adminName);
    const safeNotes = maskSensitiveData(approvalNotes);
    executeApprovedAction(safeAdmin, safeNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-500/10">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm">
              사람의 명시적 승인 (Human-in-the-Loop - F6)
            </h3>
          </div>
          <button
            onClick={closeApprovalModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">에이전트 권한 한계 고지</p>
              <p className="text-[11px] mt-0.5 opacity-90">
                에이전트는 읽기 전용 도구만 보유하고 있으며 단독으로 시스템을 변경할 수 없습니다. 운영자의 2단계 명시적 승인 후에만 조치가 시뮬레이션 환경에 실행됩니다.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block">
              실행 대상 런북 및 조치 내용
            </span>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                [{currentReport.suggestedAction.runbookId}] {currentReport.suggestedAction.actionTitle}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {currentReport.suggestedAction.description}
              </div>
            </div>
          </div>

          {/* 1단계 승인: 영향도 확인 */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              1단계: 서비스 영향도 및 롤백 가능 여부 확인
            </span>
            <button
              type="button"
              onClick={() => setStep1Agreed(!step1Agreed)}
              className="flex items-center gap-2.5 text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 w-full transition cursor-pointer"
            >
              {step1Agreed ? (
                <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span className={`text-xs ${step1Agreed ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                조치 실행으로 인한 일시적 리로드 및 리소스 변경 사항을 인지하였으며 승인합니다.
              </span>
            </button>
          </div>

          {/* 2단계 승인: 승인자 정보 & 사유 */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              2단계: 감사 기록(Audit Log) 등록 및 서명
            </span>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                승인자 성명 / 담당 부서
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                승인 및 조치 사유
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={closeApprovalModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!step1Agreed}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            최종 승인 및 조치 실행
          </button>
        </div>
      </div>
    </div>
  );
};
