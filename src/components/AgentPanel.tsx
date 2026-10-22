import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import {
  Activity,
  Bot,
  CheckCircle2,
  FileText,
  Play,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
  AlertOctagon
} from 'lucide-react';

export const AgentPanel: React.FC = () => {
  const {
    agentStatus,
    activeTool,
    toolCallRecords,
    currentReport,
    streamingText,
    runDiagnosis,
    openApprovalModal,
    openEscalationModal,
    activeAlerts
  } = useConsoleStore();

  const isRunning = agentStatus === 'running';

  return (
    <section aria-label="장애 진단 AI 에이전트 패널 (F4)" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      {/* 헤더 및 실행 버튼 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                운영 장애 진단 에이전트 (F4)
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Read-Only Tools
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              도구 3종으로 원인을 자율 분석하고, 사람이 승인한 조치만 실행합니다.
            </p>
          </div>
        </div>

        <button
          onClick={runDiagnosis}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>도구 호출 및 진단 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>장애 진단 시작</span>
            </>
          )}
        </button>
      </div>

      {/* 도구 3종 호출 상태 바 */}
      <div className="py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-indigo-500" />
            읽기 전용 도구 3종 파이프라인
          </span>
          <span className="text-[11px] text-slate-500">
            {toolCallRecords.length}/3 호출 완료
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 도구 1: get_metrics */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
            activeTool === 'get_metrics'
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 animate-pulse font-bold'
              : toolCallRecords.some(t => t.tool === 'get_metrics')
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
          }`}>
            <span className="font-mono">1. get_metrics</span>
            {toolCallRecords.some(t => t.tool === 'get_metrics') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : activeTool === 'get_metrics' ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <span className="text-[10px]">대기</span>
            )}
          </div>

          {/* 도구 2: get_logs */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
            activeTool === 'get_logs'
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 animate-pulse font-bold'
              : toolCallRecords.some(t => t.tool === 'get_logs')
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
          }`}>
            <span className="font-mono">2. get_logs</span>
            {toolCallRecords.some(t => t.tool === 'get_logs') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : activeTool === 'get_logs' ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <span className="text-[10px]">대기</span>
            )}
          </div>

          {/* 도구 3: search_runbook */}
          <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
            activeTool === 'search_runbook'
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 animate-pulse font-bold'
              : toolCallRecords.some(t => t.tool === 'search_runbook')
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
          }`}>
            <span className="font-mono">3. search_runbook</span>
            {toolCallRecords.some(t => t.tool === 'search_runbook') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : activeTool === 'search_runbook' ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <span className="text-[10px]">대기</span>
            )}
          </div>
        </div>
      </div>

      {/* 진단 결과 렌더링 영역 */}
      <div className="mt-4">
        {agentStatus === 'idle' && !currentReport && (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="text-sm font-semibold">장애 진단 대기 중</p>
            <p className="text-xs mt-1">
              상단의 <strong>[장애 진단 시작]</strong> 버튼을 누르면 4계층 지표와 로그를 분석합니다.
            </p>
          </div>
        )}

        {isRunning && (
          <div className="py-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>에이전트가 시스템 근거를 수집하고 추론 중입니다...</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {streamingText || '도구 파이프라인 가동 중...'}
            </div>
          </div>
        )}

        {currentReport && (
          <div className="space-y-4">
            {/* 5단계 표준 보고서 */}
            {/* 1. 증상 */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 1. 증상 (Symptom)
              </h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                {currentReport.symptom}
              </p>
            </div>

            {/* 2. 근거 */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> 2. 근거 (Evidence - 지표 & 로그 & 도구)
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="text-[11px] font-semibold text-slate-500">
                  확인한 도구: {currentReport.evidence.toolsUsed.join(', ')}
                </div>
                <div>
                  <span className="font-semibold block text-[11px] text-slate-600 dark:text-slate-400">지표 근거:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {currentReport.evidence.metricsConfirmed.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold block text-[11px] text-slate-600 dark:text-slate-400">로그 근거:</span>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
                    {currentReport.evidence.logsConfirmed.map((l, i) => (
                      <li key={i} className="text-rose-600 dark:text-rose-400">{l}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. 원인 후보와 확신도 */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span> 3. 원인 후보 및 확신도 (Causes)
              </h4>
              <div className="space-y-2">
                {currentReport.candidateCauses.map((c, i) => (
                  <div key={i} className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{c.cause}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        확신도 {c.confidence}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>판단 근거:</strong> {c.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 조치 제안 (런북 ID & 사람 승인 필요) */}
            <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 4. 조치 제안 (런북 {currentReport.suggestedAction.runbookId})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  사람의 승인 필수 (Human-in-the-Loop)
                </span>
              </h4>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {currentReport.suggestedAction.actionTitle}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                {currentReport.suggestedAction.description}
              </p>
            </div>

            {/* 5. 에스컬레이션 필요 여부 */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                5. 벤더 기술지원 3단계 에스컬레이션 필요 여부
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                currentReport.escalationNeeded
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              }`}>
                {currentReport.escalationNeeded ? '🚨 에스컬레이션 권고' : '✅ 1차 런북 자체 조치 권장'}
              </span>
            </div>

            {/* 하단 액션 버튼 그룹 */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={openApprovalModal}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>승인 후 조치 실행 (F6)</span>
              </button>

              <button
                onClick={openEscalationModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-600 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>에스컬레이션 문서 생성 (F5)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
