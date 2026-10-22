import { create } from 'zustand';
import {
  AgentMetrics,
  AlertItem,
  AuditLog,
  DiagnosisReport,
  Metrics,
  PodInfo,
  ScenarioEvaluation,
  ScenarioId,
  TimelineEvent,
  ToolCallRecord
} from '../types';
import {
  BASELINE_METRICS,
  BASELINE_PODS,
  SCENARIO_DEFINITIONS,
  SCENARIO_LOGS,
  SCENARIO_METRICS,
  SCENARIO_PODS
} from '../data/scenarios';
import { detectAllAlerts } from '../utils/thresholds';
import { runAgentDiagnosis } from '../api/agent';

export interface HistoryPoint {
  time: string;
  cpu: number;
  mem: number;
  p95: number;
}

interface ConsoleState {
  // 모드
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // 시나리오 & 데이터
  currentScenario: ScenarioId;
  metrics: Metrics;
  pods: PodInfo[];
  logs: string[];
  activeAlerts: AlertItem[];
  metricHistory: HistoryPoint[];

  // 타임라인 (F9)
  timeline: TimelineEvent[];

  // 에이전트 진단 상태 (F4)
  agentStatus: 'idle' | 'running' | 'completed' | 'error';
  activeTool: string | null;
  toolCallRecords: ToolCallRecord[];
  currentReport: DiagnosisReport | null;
  streamingText: string;

  // 조치 및 감사 기록 (F6)
  isApprovalModalOpen: boolean;
  isEscalationModalOpen: boolean;
  isObservabilityModalOpen: boolean;
  auditLogs: AuditLog[];
  lastActionApplied: string | null;

  // 관측 및 평가표 (F11, F12)
  agentMetrics: AgentMetrics;
  scenarioEvaluations: Record<ScenarioId, ScenarioEvaluation>;

  // 액션
  setScenario: (scenarioId: ScenarioId) => void;
  runDiagnosis: () => Promise<void>;
  openApprovalModal: () => void;
  closeApprovalModal: () => void;
  openEscalationModal: () => void;
  closeEscalationModal: () => void;
  openObservabilityModal: () => void;
  closeObservabilityModal: () => void;
  executeApprovedAction: (adminName: string, notes: string) => void;
  verifyEvaluation: (scenarioId: ScenarioId, isCorrect: boolean) => void;
  resetToNormal: () => void;
}

// 초기 히스토리 데이터 생성 함수
function generateInitialHistory(metrics: Metrics): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const now = Date.now();
  for (let i = 9; i >= 0; i--) {
    const t = new Date(now - i * 30000);
    const timeStr = t.toLocaleTimeString('ko-KR', { hour12: false, minute: '2-digit', second: '2-digit' });
    points.push({
      time: timeStr,
      cpu: Math.max(10, metrics.server.cpu_pct + (Math.random() * 6 - 3)),
      mem: Math.max(10, metrics.server.mem_pct + (Math.random() * 4 - 2)),
      p95: Math.max(50, metrics.solution.p95_ms + (Math.random() * 40 - 20))
    });
  }
  return points;
}

export const useConsoleStore = create<ConsoleState>((set, get) => {
  const initialMetrics = { ...BASELINE_METRICS };
  const initialAlerts = detectAllAlerts(initialMetrics);
  const initialHistory = generateInitialHistory(initialMetrics);

  return {
    isDarkMode: true,
    toggleDarkMode: () => {
      const next = !get().isDarkMode;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ isDarkMode: next });
    },

    currentScenario: 'normal',
    metrics: initialMetrics,
    pods: BASELINE_PODS,
    logs: SCENARIO_LOGS.normal,
    activeAlerts: initialAlerts,
    metricHistory: initialHistory,

    timeline: [
      {
        id: 'init',
        type: 'system',
        title: '모니터링 콘솔 가동',
        description: 'RHEL 9.2 + 쿠버네티스 v1.28 감시 에이전트 감시가 시작되었습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      }
    ],

    agentStatus: 'idle',
    activeTool: null,
    toolCallRecords: [],
    currentReport: null,
    streamingText: '',

    isApprovalModalOpen: false,
    isEscalationModalOpen: false,
    isObservabilityModalOpen: false,
    auditLogs: [],
    lastActionApplied: null,

    agentMetrics: {
      totalDiagnoses: 0,
      toolCallCounts: {
        get_metrics: 0,
        get_logs: 0,
        search_runbook: 0
      },
      lastDiagnosisDurationMs: 0,
      averageDiagnosisDurationMs: 0
    },

    scenarioEvaluations: {
      normal: {
        scenarioId: 'normal',
        scenarioName: '정상 상태',
        toolsCalled: { get_metrics: false, get_logs: false, search_runbook: false },
        expectedRunbook: 'N/A',
        mentionedExpectedRunbook: true,
        durationMs: 0,
        humanVerifiedCause: null
      },
      pod_crash: {
        scenarioId: 'pod_crash',
        scenarioName: '파드 반복 종료',
        toolsCalled: { get_metrics: false, get_logs: false, search_runbook: false },
        expectedRunbook: 'RB-01',
        mentionedExpectedRunbook: false,
        durationMs: 0,
        humanVerifiedCause: null
      },
      disk_full: {
        scenarioId: 'disk_full',
        scenarioName: '디스크 가득 참',
        toolsCalled: { get_metrics: false, get_logs: false, search_runbook: false },
        expectedRunbook: 'RB-02',
        mentionedExpectedRunbook: false,
        durationMs: 0,
        humanVerifiedCause: null
      },
      latency_spike: {
        scenarioId: 'latency_spike',
        scenarioName: '응답 지연 급증',
        toolsCalled: { get_metrics: false, get_logs: false, search_runbook: false },
        expectedRunbook: 'RB-03',
        mentionedExpectedRunbook: false,
        durationMs: 0,
        humanVerifiedCause: null
      },
      batch_fail: {
        scenarioId: 'batch_fail',
        scenarioName: '배치 잡 실패',
        toolsCalled: { get_metrics: false, get_logs: false, search_runbook: false },
        expectedRunbook: 'RB-04',
        mentionedExpectedRunbook: false,
        durationMs: 0,
        humanVerifiedCause: null
      },
      cert_expire: {
        scenarioId: 'cert_expire',
        scenarioName: '인증서 만료 임박',
        toolsCalled: { get_metrics: false, get_logs: false, search_runbook: false },
        expectedRunbook: 'RB-05',
        mentionedExpectedRunbook: false,
        durationMs: 0,
        humanVerifiedCause: null
      }
    },

    setScenario: (scenarioId: ScenarioId) => {
      const newMetrics = { ...SCENARIO_METRICS[scenarioId] };
      const newPods = [...SCENARIO_PODS[scenarioId]];
      const newLogs = [...SCENARIO_LOGS[scenarioId]];
      const newAlerts = detectAllAlerts(newMetrics);
      const nowTime = new Date().toLocaleTimeString('ko-KR', { hour12: false });

      // 히스토리에 새 포인트 추가
      const prevHist = get().metricHistory;
      const updatedHistory = [
        ...prevHist.slice(1),
        {
          time: nowTime,
          cpu: newMetrics.server.cpu_pct,
          mem: newMetrics.server.mem_pct,
          p95: newMetrics.solution.p95_ms
        }
      ];

      const scDef = SCENARIO_DEFINITIONS.find(s => s.id === scenarioId);

      const alertEvent: TimelineEvent = {
        id: `event-${Date.now()}`,
        type: scenarioId === 'normal' ? 'system' : 'alert',
        title: scenarioId === 'normal' ? '시스템 정상 상태' : `[경보 발생] ${scDef?.name}`,
        description: scenarioId === 'normal'
          ? '모든 지표가 안정 상태입니다.'
          : `${newAlerts.length}건의 이상 지표 감지: ${scDef?.targetMetricChanges}`,
        timestamp: nowTime,
        badge: scenarioId === 'normal' ? '정상' : '경보 주입'
      };

      set({
        currentScenario: scenarioId,
        metrics: newMetrics,
        pods: newPods,
        logs: newLogs,
        activeAlerts: newAlerts,
        metricHistory: updatedHistory,
        currentReport: null,
        toolCallRecords: [],
        streamingText: '',
        agentStatus: 'idle',
        activeTool: null,
        lastActionApplied: null,
        timeline: [alertEvent, ...get().timeline]
      });
    },

    runDiagnosis: async () => {
      const { currentScenario, metrics, logs, timeline, agentMetrics, scenarioEvaluations } = get();
      const startTime = Date.now();
      const nowTime = new Date().toLocaleTimeString('ko-KR', { hour12: false });

      // 타임라인 이벤트 추가
      const startEvent: TimelineEvent = {
        id: `diag-start-${Date.now()}`,
        type: 'diagnosis_start',
        title: '에이전트 장애 분석 개시',
        description: '지표(get_metrics), 로그(get_logs), 런북(search_runbook) 조회를 시작합니다.',
        timestamp: nowTime
      };

      set({
        agentStatus: 'running',
        streamingText: '',
        toolCallRecords: [],
        currentReport: null,
        timeline: [startEvent, ...timeline]
      });

      try {
        const { report, toolCalls, durationMs } = await runAgentDiagnosis(
          currentScenario,
          metrics,
          logs,
          {
            onToolStart: (tool) => {
              set({ activeTool: tool });
            },
            onToolComplete: (record) => {
              set((prev) => ({
                toolCallRecords: [...prev.toolCallRecords, record]
              }));
            },
            onProgress: (chunk) => {
              set((prev) => ({
                streamingText: prev.streamingText + chunk
              }));
            }
          }
        );

        const completeTime = new Date().toLocaleTimeString('ko-KR', { hour12: false });

        // 타임라인 완료 이벤트
        const completeEvent: TimelineEvent = {
          id: `diag-done-${Date.now()}`,
          type: 'diagnosis_complete',
          title: `진단 보고서 완성 (${report.suggestedAction.runbookId})`,
          description: `원인: ${report.candidateCauses[0]?.cause || '알 수 없음'} (확신도 ${report.candidateCauses[0]?.confidence}%)`,
          timestamp: completeTime,
          badge: `${durationMs}ms 소요`
        };

        // 에이전트 관측 지표 업데이트 (F11)
        const updatedTotal = agentMetrics.totalDiagnoses + 1;
        const newToolCounts = {
          get_metrics: agentMetrics.toolCallCounts.get_metrics + 1,
          get_logs: agentMetrics.toolCallCounts.get_logs + 1,
          search_runbook: agentMetrics.toolCallCounts.search_runbook + 1
        };
        const newAvg = Math.round(
          (agentMetrics.averageDiagnosisDurationMs * agentMetrics.totalDiagnoses + durationMs) / updatedTotal
        );

        // 평가표 업데이트 (F12)
        const currentEval = scenarioEvaluations[currentScenario];
        const scDef = SCENARIO_DEFINITIONS.find(s => s.id === currentScenario);
        const mentioned = scDef ? report.suggestedAction.runbookId === scDef.expectedRunbook : false;

        const updatedEval: ScenarioEvaluation = {
          scenarioId: currentScenario,
          scenarioName: scDef?.name || currentScenario,
          toolsCalled: {
            get_metrics: true,
            get_logs: true,
            search_runbook: true
          },
          expectedRunbook: scDef?.expectedRunbook || 'N/A',
          mentionedExpectedRunbook: mentioned || currentScenario === 'normal',
          durationMs,
          humanVerifiedCause: currentEval?.humanVerifiedCause ?? null,
          completedAt: completeTime
        };

        set({
          agentStatus: 'completed',
          activeTool: null,
          currentReport: report,
          timeline: [completeEvent, ...get().timeline],
          agentMetrics: {
            totalDiagnoses: updatedTotal,
            toolCallCounts: newToolCounts,
            lastDiagnosisDurationMs: durationMs,
            averageDiagnosisDurationMs: newAvg
          },
          scenarioEvaluations: {
            ...scenarioEvaluations,
            [currentScenario]: updatedEval
          }
        });
      } catch (err: any) {
        set({
          agentStatus: 'error',
          activeTool: null,
          streamingText: `오류 발생: ${err.message || '진단 중 에러가 발생했습니다.'}`
        });
      }
    },

    openApprovalModal: () => set({ isApprovalModalOpen: true }),
    closeApprovalModal: () => set({ isApprovalModalOpen: false }),

    openEscalationModal: () => set({ isEscalationModalOpen: true }),
    closeEscalationModal: () => set({ isEscalationModalOpen: false }),

    openObservabilityModal: () => set({ isObservabilityModalOpen: true }),
    closeObservabilityModal: () => set({ isObservabilityModalOpen: false }),

    executeApprovedAction: (adminName: string, notes: string) => {
      const { currentScenario, currentReport, timeline, auditLogs } = get();
      const nowTime = new Date().toLocaleTimeString('ko-KR', { hour12: false });
      const actionTitle = currentReport?.suggestedAction.actionTitle || '긴급 복구 조치';

      // 시나리오별 맞춤 복구 설명
      const resultDescriptions: Record<ScenarioId, string> = {
        normal: '정상 상태 확인이 완료되었습니다.',
        pod_crash: '파드 메모리 리밋 증설(1GiB -> 2GiB) 및 롤링 재시작 완료. OOMKilled 해소 및 모든 파드가 Running 상태로 정상 복구되었습니다.',
        disk_full: '오래된 임시 로그 긴급 정전(Logrotate) 및 영구 볼륨(PVC 50GiB) 확장 완료. 스토리지 사용률이 62%로 안정화되었습니다.',
        latency_spike: '솔루션 Deployment 수평 스케일아웃(3 -> 6 Pods) 및 캐시 워밍 완료. P95 지연시간이 260ms로 정상 회복되었습니다.',
        batch_fail: '실패 트랜잭션 롤백 및 격리 워커 재실행 완료. 일일 정산 배치 잡이 정상 종료되었습니다.',
        cert_expire: 'TLS 와일드카드 인증서 Secret 갱신 및 인그레스 컨트롤러 리로드 완료. 인증서 잔여일이 365일로 갱신되었습니다.'
      };

      const resultDescription =
        resultDescriptions[currentScenario] ||
        `${actionTitle} 작업이 시뮬레이션 환경에 성공적으로 배포 및 적용되었습니다.`;

      // 1. 감사 로그 기록 (F6)
      const auditItem: AuditLog = {
        id: `audit-${Date.now()}`,
        scenarioId: currentScenario,
        actionTitle,
        approvedBy: adminName || '운영 엔지니어 (Admin)',
        approvalNotes: notes || `런북 절차에 따른 [${actionTitle}] 정식 승인 후 실행`,
        step1Confirmed: true,
        step2Confirmed: true,
        executedAt: nowTime,
        status: 'success',
        resultDescription
      };

      // 2. 조치 적용 후 지표를 정상치로 회복
      const recoveredMetrics: Metrics = {
        server: { cpu_pct: 42, mem_pct: 64, disk_pct: 58 },
        k8s: { restarts: 0, oomkilled: 0, pending_pods: 0 },
        solution: { p95_ms: 260, err_pct: 0.1, job_failed: 0, cert_days_left: 365 },
        storage: { used_pct: 62, growth_pct_day: 0.4 }
      };

      const recoveredAlerts = detectAllAlerts(recoveredMetrics);

      // 3. 타임라인 이벤트
      const actionEvent: TimelineEvent = {
        id: `act-exec-${Date.now()}`,
        type: 'action_applied',
        title: `[조치 실행 완료] ${actionTitle}`,
        description: `승인자: ${adminName || 'Admin'} | 사유: ${notes || '런북 승인'} | 지표 정상화 복구됨`,
        timestamp: nowTime,
        badge: '승인 실행'
      };

      set({
        isApprovalModalOpen: false,
        metrics: recoveredMetrics,
        pods: BASELINE_PODS,
        activeAlerts: recoveredAlerts,
        lastActionApplied: actionTitle,
        auditLogs: [auditItem, ...auditLogs],
        timeline: [actionEvent, ...timeline]
      });
    },

    verifyEvaluation: (scenarioId: ScenarioId, isCorrect: boolean) => {
      const { scenarioEvaluations } = get();
      const current = scenarioEvaluations[scenarioId];
      if (current) {
        set({
          scenarioEvaluations: {
            ...scenarioEvaluations,
            [scenarioId]: {
              ...current,
              humanVerifiedCause: isCorrect
            }
          }
        });
      }
    },

    resetToNormal: () => {
      get().setScenario('normal');
    }
  };
});
