import { DiagnosisReport, Metrics, ScenarioId, ToolCallRecord } from '../types';
import { RUNBOOKS, searchRunbooks } from '../data/runbooks';
import { maskSensitiveData } from '../utils/masking';

export interface DiagnosisCallbacks {
  onToolStart?: (tool: 'get_metrics' | 'get_logs' | 'search_runbook', args?: any) => void;
  onToolComplete?: (record: ToolCallRecord) => void;
  onProgress?: (textChunk: string) => void;
}

/**
 * 진단 에이전트 실행 엔진
 * 1. 도구 3종(get_metrics, get_logs, search_runbook) 호출
 * 2. 근거 수집 및 분석
 * 3. 5단계 표준 진단 리포트 생성 및 반환
 */
export async function runAgentDiagnosis(
  scenarioId: ScenarioId,
  currentMetrics: Metrics,
  currentLogs: string[],
  callbacks?: DiagnosisCallbacks
): Promise<{ report: DiagnosisReport; toolCalls: ToolCallRecord[]; durationMs: number }> {
  const startTime = Date.now();
  const toolCalls: ToolCallRecord[] = [];

  // 도구 1: get_metrics
  callbacks?.onToolStart?.('get_metrics', { layer: 'all' });
  await new Promise(r => setTimeout(r, 450));
  const metricsSummary = `server(cpu: ${currentMetrics.server.cpu_pct}%, mem: ${currentMetrics.server.mem_pct}%, disk: ${currentMetrics.server.disk_pct}%), k8s(restarts: ${currentMetrics.k8s.restarts}, oomkilled: ${currentMetrics.k8s.oomkilled}), solution(p95: ${currentMetrics.solution.p95_ms}ms, err: ${currentMetrics.solution.err_pct}%, job_fail: ${currentMetrics.solution.job_failed}, cert_days: ${currentMetrics.solution.cert_days_left}일)`;
  const tool1: ToolCallRecord = {
    tool: 'get_metrics',
    args: { layer: 'all' },
    resultSummary: metricsSummary,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
  };
  toolCalls.push(tool1);
  callbacks?.onToolComplete?.(tool1);

  // 도구 2: get_logs
  callbacks?.onToolStart?.('get_logs');
  await new Promise(r => setTimeout(r, 450));
  const maskedLogs = currentLogs.map(l => maskSensitiveData(l));
  const tool2: ToolCallRecord = {
    tool: 'get_logs',
    args: {},
    resultSummary: `최근 로그 ${maskedLogs.length}건 수집 완료 (마스킹 적용됨)`,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
  };
  toolCalls.push(tool2);
  callbacks?.onToolComplete?.(tool2);

  // 도구 3: search_runbook
  const queryMap: Record<ScenarioId, string> = {
    normal: '시스템 점검',
    pod_crash: 'OOMKilled 파드 재시작',
    disk_full: '디스크 스토리지 용량',
    latency_spike: 'P95 응답 지연 CPU',
    batch_fail: '배치 잡 실패',
    cert_expire: '인증서 만료 TLS'
  };
  const searchQ = queryMap[scenarioId] || '장애 복구';
  callbacks?.onToolStart?.('search_runbook', { query: searchQ });
  await new Promise(r => setTimeout(r, 450));
  const matchedRunbooks = searchRunbooks(searchQ);
  const tool3: ToolCallRecord = {
    tool: 'search_runbook',
    args: { query: searchQ },
    resultSummary: `런북 ${matchedRunbooks.length}건 매칭: ${matchedRunbooks.map(r => r.id).join(', ')}`,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
  };
  toolCalls.push(tool3);
  callbacks?.onToolComplete?.(tool3);

  // 시나리오별 진단 결과 구조화
  const report = buildDiagnosisReport(scenarioId, currentMetrics, maskedLogs, matchedRunbooks);

  // 모의 스트리밍 chunk 전달
  if (callbacks?.onProgress) {
    const fullText = formatReportMarkdown(report);
    const chunkSize = 40;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      callbacks.onProgress(fullText.slice(i, i + chunkSize));
      await new Promise(r => setTimeout(r, 20));
    }
  }

  const durationMs = Date.now() - startTime;
  return { report, toolCalls, durationMs };
}

function buildDiagnosisReport(
  scenarioId: ScenarioId,
  metrics: Metrics,
  logs: string[],
  matchedRunbooks: typeof RUNBOOKS
): DiagnosisReport {
  switch (scenarioId) {
    case 'pod_crash': {
      const rb = matchedRunbooks.find(r => r.id === 'RB-01') || RUNBOOKS.find(r => r.id === 'RB-01') || RUNBOOKS[0];
      return {
        id: `diag-${Date.now()}`,
        scenarioId,
        symptom: 'prod-solution 네임스페이스의 워커 파드에서 지속적인 CrashLoopBackOff 및 비정상 재시작 감지',
        evidence: {
          metricsConfirmed: [
            `k8s.restarts: ${metrics.k8s.restarts}회 (임계치 5회 이상 초과)`,
            `k8s.oomkilled: ${metrics.k8s.oomkilled}건 (임계치 1건 이상 초과)`,
            `server.mem_pct: ${metrics.server.mem_pct}% (위험 임계치 90% 초과)`
          ],
          logsConfirmed: [
            logs.find(l => l.includes('ExitCode 137') || l.includes('OOMKilled')) || 'Container terminated with ExitCode 137 (OOMKilled)',
            logs.find(l => l.includes('OutOfMemoryError')) || 'java.lang.OutOfMemoryError: Java heap space'
          ],
          toolsUsed: ['get_metrics(k8s, server)', 'get_logs()', 'search_runbook("OOMKilled 파드 재시작")']
        },
        candidateCauses: [
          { cause: '대용량 PDF 렌더링 요청 급증으로 인한 워커 컨테이너 힙 메모리 한도(2048Mi) 초과', confidence: 95, reason: 'OOMKilled 종료 코드(137) 및 힙 메모리 고갈 로그와 일치' },
          { cause: '노드 레벨 물리 메모리 압박으로 커널 레벨 프로세스 강제 종료', confidence: 45, reason: '호스트 메모리 점유율도 94%로 동반 상승' }
        ],
        suggestedAction: {
          runbookId: 'RB-01',
          actionTitle: rb.recommendedAction,
          description: 'solution-worker Deployment의 memory.limits를 1GiB -> 2GiB로 패치하고 순차적 롤링 재시작을 적용합니다. 본 작업은 운영 변경이므로 운영자의 명시적 2단계 승인이 필요합니다.',
          requiresHumanApproval: true
        },
        escalationNeeded: false,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      };
    }

    case 'disk_full': {
      const rb = matchedRunbooks.find(r => r.id === 'RB-02') || RUNBOOKS.find(r => r.id === 'RB-02') || RUNBOOKS[1];
      return {
        id: `diag-${Date.now()}`,
        scenarioId,
        symptom: 'RHEL 호스트 루트 볼륨 및 영구 공유 볼륨(PVC) 디스크 사용률 90% 초과 및 고갈 위기',
        evidence: {
          metricsConfirmed: [
            `server.disk_pct: ${metrics.server.disk_pct}% (임계치 90% 초과)`,
            `storage.used_pct: ${metrics.storage.used_pct}% (임계치 90% 초과)`,
            `storage.growth_pct_day: ${metrics.storage.growth_pct_day}%/일 (임계치 3.0% 초과)`
          ],
          logsConfirmed: [
            logs.find(l => l.includes('No space left on device') || l.includes('ENOSPC')) || 'IOException: No space left on device',
            logs.find(l => l.includes('capacity')) || '/dev/mapper/rhel-root mounted on / is at capacity'
          ],
          toolsUsed: ['get_metrics(storage, server)', 'get_logs()', 'search_runbook("디스크 스토리지 용량")']
        },
        candidateCauses: [
          { cause: '솔루션 상세 트랜잭션 감사 로그(audit_raw.log) 비정상 누적 및 logrotate 미동작', confidence: 92, reason: '하루 증가율 4.8% 및 I/O 장치 공간 부족 에러 검출' },
          { cause: '스토리지 PV 볼륨 기본 할당량 부족', confidence: 60, reason: '볼륨 크기 대비 급격한 데이터 유입' }
        ],
        suggestedAction: {
          runbookId: 'RB-02',
          actionTitle: rb.recommendedAction,
          description: '보관 주기 초과 아카이브 긴급 정리(logrotate 강제 트리거) 및 스토리지 PVC 50GiB 증설을 실행합니다. 시스템 영향도 검토 후 2단계 승인이 요구됩니다.',
          requiresHumanApproval: true
        },
        escalationNeeded: false,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      };
    }

    case 'latency_spike': {
      const rb = matchedRunbooks.find(r => r.id === 'RB-03') || RUNBOOKS.find(r => r.id === 'RB-03') || RUNBOOKS[2];
      return {
        id: `diag-${Date.now()}`,
        scenarioId,
        symptom: '솔루션 API 서비스 P95 지연시간 급증 및 서버 CPU 임계치 한계 도달',
        evidence: {
          metricsConfirmed: [
            `solution.p95_ms: ${metrics.solution.p95_ms}ms (임계치 2000ms 대폭 초과)`,
            `server.cpu_pct: ${metrics.server.cpu_pct}% (임계치 90% 초과)`,
            `solution.err_pct: ${metrics.solution.err_pct}% (임계치 5% 초과)`
          ],
          logsConfirmed: [
            logs.find(l => l.includes('HikariPool') || l.includes('Connection timed out')) || 'HikariPool-1 - Connection is not available, request timed out',
            logs.find(l => l.includes('Throttled') || l.includes('CPU load')) || 'gateway pods CPU throttling percentage reached 68%'
          ],
          toolsUsed: ['get_metrics(solution, server)', 'get_logs()', 'search_runbook("P95 응답 지연 CPU")']
        },
        candidateCauses: [
          { cause: '주문 검색 API(/api/v2/orders/search) 복합 인덱스 누락으로 인한 DB 커넥션 풀 고갈 및 CPU 쓰로틀링', confidence: 90, reason: 'P95 응답시간 3450ms 및 HikariPool 타임아웃 로그 확인' },
          { cause: '외부 네트워크 회선 대역폭 포화', confidence: 30, reason: '서버 내부 CPU와 로컬 풀 고갈 지표가 주원인으로 나타남' }
        ],
        suggestedAction: {
          runbookId: 'RB-03',
          actionTitle: rb.recommendedAction,
          description: '솔루션 게이트웨이 및 워커 파드 레플리카를 3개 -> 6개로 즉시 스케일아웃하고 캐시 쿼리 워밍을 활성화합니다. 인간 승인 필요.',
          requiresHumanApproval: true
        },
        escalationNeeded: false,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      };
    }

    case 'batch_fail': {
      const rb = matchedRunbooks.find(r => r.id === 'RB-04') || RUNBOOKS.find(r => r.id === 'RB-04') || RUNBOOKS[3];
      return {
        id: `diag-${Date.now()}`,
        scenarioId,
        symptom: '솔루션 야간 정산 배치 CronJob 연속 실패 및 트랜잭션 롤백 발생',
        evidence: {
          metricsConfirmed: [
            `solution.job_failed: ${metrics.solution.job_failed}건 (임계치 1건 이상 초과)`,
            `solution.err_pct: ${metrics.solution.err_pct}% (임계치 5% 초과)`
          ],
          logsConfirmed: [
            logs.find(l => l.includes('Deadlock') || l.includes('Transaction')) || 'Deadlock found when trying to get lock in settlementProcessor',
            logs.find(l => l.includes('backoffLimit')) || 'Job batch-daily-reconcile-289410 failed: backoffLimit reached'
          ],
          toolsUsed: ['get_metrics(solution)', 'get_logs()', 'search_runbook("배치 잡 실패")']
        },
        candidateCauses: [
          { cause: '정산 처리 중 동일 계정 레코드에 대한 동시성 트랜잭션 데드락 발생', confidence: 94, reason: '로그 상 Deadlock found 에러 및 롤백 명시' },
          { cause: 'DB 네트워크 단절', confidence: 20, reason: 'DB 접속은 정상이나 트랜잭션 락 문제' }
        ],
        suggestedAction: {
          runbookId: 'RB-04',
          actionTitle: rb.recommendedAction,
          description: '실패한 미처리 트랜잭션을 격리하고 재처리 워커(Retry-Worker)를 파티션 분할 모드로 재실행합니다. 인간 승인 필요.',
          requiresHumanApproval: true
        },
        escalationNeeded: false,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      };
    }

    case 'cert_expire': {
      const rb = matchedRunbooks.find(r => r.id === 'RB-05') || RUNBOOKS.find(r => r.id === 'RB-05') || RUNBOOKS[4];
      return {
        id: `diag-${Date.now()}`,
        scenarioId,
        symptom: '도메인 와일드카드 TLS/SSL 인증서 유효기간 3일 잔여 (만료 임박)',
        evidence: {
          metricsConfirmed: [
            `solution.cert_days_left: ${metrics.solution.cert_days_left}일 (임계치 7일 미만)`
          ],
          logsConfirmed: [
            logs.find(l => l.includes('expires in')) || 'Certificate prod-wildcard-tls expires in 3 days',
            logs.find(l => l.includes('webhook timed out')) || 'Automatic renewal via ACME DNS-01 webhook timed out'
          ],
          toolsUsed: ['get_metrics(solution)', 'get_logs()', 'search_runbook("인증서 만료 TLS")']
        },
        candidateCauses: [
          { cause: 'cert-manager의 DNS-01 챌린지 API 인증 토큰 만료로 자동 갱신 실패', confidence: 96, reason: 'ACME webhook timed out 및 잔여일수 3일 확인' }
        ],
        suggestedAction: {
          runbookId: 'RB-05',
          actionTitle: rb.recommendedAction,
          description: '갱신된 TLS Secret을 인그레스 네임스페이스에 동기화하고 인그레스 컨트롤러를 리로드합니다. 서비스 중단 방지를 위해 승인 후 적용합니다.',
          requiresHumanApproval: true
        },
        escalationNeeded: false,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      };
    }

    default:
      return {
        id: `diag-${Date.now()}`,
        scenarioId: 'normal',
        symptom: '시스템 전체 지표 정상 범위 내 유지 중',
        evidence: {
          metricsConfirmed: ['모든 4계층 지표 정상 임계치 내 유지 확인'],
          logsConfirmed: ['오류 또는 경보 로그 미발견'],
          toolsUsed: ['get_metrics(all)', 'get_logs()', 'search_runbook("시스템 점검")']
        },
        candidateCauses: [
          { cause: '정상 작동 상태', confidence: 100, reason: '모든 서비스와 파드가 헬스체크를 통과하고 있습니다.' }
        ],
        suggestedAction: {
          runbookId: 'N/A',
          actionTitle: '조치 불필요 (지속 모니터링)',
          description: '현재 시스템에 능동적 개입이 필요한 장애가 감지되지 않았습니다.',
          requiresHumanApproval: false
        },
        escalationNeeded: false,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      };
  }
}

export function formatReportMarkdown(report: DiagnosisReport): string {
  const causes = report.candidateCauses
    .map(c => `- **${c.cause}** (확신도: ${c.confidence}%)\n  *근거:* ${c.reason}`)
    .join('\n');

  const metricsText = report.evidence.metricsConfirmed.map(m => `  • ${m}`).join('\n');
  const logsText = report.evidence.logsConfirmed.map(l => `  • \`${l}\``).join('\n');
  const toolsText = report.evidence.toolsUsed.map(t => `\`${t}\``).join(', ');

  return `### 1. 증상
${report.symptom}

### 2. 근거
- **도구 확인:** ${toolsText}
- **확인된 지표:**
${metricsText}
- **확인된 로그:**
${logsText}

### 3. 원인 후보와 확신도
${causes}

### 4. 조치 제안 (${report.suggestedAction.runbookId})
- **권장 조치:** ${report.suggestedAction.actionTitle}
- **상세 내용:** ${report.suggestedAction.description}
- **원칙:** ⚠️ **사람의 명시적 승인(Human-in-the-Loop) 필요** (에이전트 단독 실행 불가)

### 5. 에스컬레이션 필요 여부
${report.escalationNeeded ? '🚨 **에스컬레이션 필요:** 벤더 기술지원팀 긴급 이관 권장' : '✅ **에스컬레이션 불필요:** 1차 런북 승인 및 적용으로 해결 가능 판단'}
`;
}
