import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { Activity, BarChart2, CheckCircle2, CheckSquare, Square, X, Award, Wrench } from 'lucide-react';
import { SCENARIO_DEFINITIONS } from '../data/scenarios';
import { ScenarioId } from '../types';

export const ObservabilityModal: React.FC = () => {
  const {
    isObservabilityModalOpen,
    closeObservabilityModal,
    agentMetrics,
    scenarioEvaluations,
    verifyEvaluation
  } = useConsoleStore();

  if (!isObservabilityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-500/10">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm">
              에이전트 관측(F11) 및 시나리오별 품질 평가표(F12)
            </h3>
          </div>
          <button
            onClick={closeObservabilityModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* F11 관측 지표 요약 카드 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-indigo-500" />
                1. 에이전트 성능 관측 메트릭 (F11)
              </h4>
              <span className="text-[11px] text-slate-500">
                실제 측정 시간 기반 (시뮬레이션 데이터 명시)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">총 진단 실행 횟수</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {agentMetrics.totalDiagnoses}회
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">최근 진단 소요 시간</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {agentMetrics.lastDiagnosisDurationMs}ms
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">평균 진단 소요 시간</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {agentMetrics.averageDiagnosisDurationMs}ms
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">도구 호출 총합</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {agentMetrics.toolCallCounts.get_metrics +
                    agentMetrics.toolCallCounts.get_logs +
                    agentMetrics.toolCallCounts.search_runbook}회
                </span>
              </div>
            </div>

            {/* 도구별 개별 호출 수 */}
            <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between text-xs gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-500" /> 도구별 누적 호출:
              </span>
              <div className="flex items-center gap-4 font-mono">
                <span>get_metrics: <strong>{agentMetrics.toolCallCounts.get_metrics}</strong></span>
                <span>get_logs: <strong>{agentMetrics.toolCallCounts.get_logs}</strong></span>
                <span>search_runbook: <strong>{agentMetrics.toolCallCounts.search_runbook}</strong></span>
              </div>
            </div>
          </div>

          {/* F12 시나리오별 평가표 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-500" />
                2. 시나리오별 품질 평가표 (F12)
              </h4>
              <span className="text-[11px] text-slate-500">
                도구 3종 호출 여부 • 기대 런북 ID 일치 여부 • 사람의 최종 확인
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
                      <th className="py-2.5 px-3">시나리오</th>
                      <th className="py-2.5 px-3">도구 3종 호출</th>
                      <th className="py-2.5 px-3">기대 런북</th>
                      <th className="py-2.5 px-3">런북 언급 여부</th>
                      <th className="py-2.5 px-3">측정 소요 시간</th>
                      <th className="py-2.5 px-3 text-center">사람 최종 검증 (정확도)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {SCENARIO_DEFINITIONS.map((sc) => {
                      const ev = scenarioEvaluations[sc.id];
                      const allTools = ev?.toolsCalled.get_metrics && ev?.toolsCalled.get_logs && ev?.toolsCalled.search_runbook;

                      return (
                        <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <span className="font-bold block">{sc.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{sc.id}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            {allTools ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 3종 전원 호출
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">미실행 / 대기</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {sc.expectedRunbook}
                          </td>
                          <td className="py-2.5 px-3">
                            {ev?.durationMs ? (
                              ev.mentionedExpectedRunbook ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> 일치
                                </span>
                              ) : (
                                <span className="text-rose-500 font-bold">불일치</span>
                              )
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {ev?.durationMs ? `${ev.durationMs}ms` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => verifyEvaluation(sc.id, true)}
                                className={`p-1.5 rounded transition ${
                                  ev?.humanVerifiedCause === true
                                    ? 'bg-emerald-500 text-white font-bold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500'
                                }`}
                                title="원인 분석 정확함 확인"
                              >
                                {ev?.humanVerifiedCause === true ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                              <span className="text-[11px]">
                                {ev?.humanVerifiedCause === true
                                  ? '적합'
                                  : ev?.humanVerifiedCause === false
                                  ? '보완필요'
                                  : '미검증'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            원칙: 확인한 사실만 기재 • 데모 측정 수치만 표기 • 사람이 최종 확인
          </p>
          <button
            onClick={closeObservabilityModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
