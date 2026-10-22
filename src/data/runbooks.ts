import { Runbook } from '../types';

export const RUNBOOKS: Runbook[] = [
  {
    id: 'RB-01',
    title: 'Kubernetes 파드 반복 재시작 및 OOMKilled 대응 절차',
    description: '메모리 한도(Memory Limit) 부족 또는 메모리 누수로 인한 컨테이너 비정상 종료 시 조치 절차',
    triggers: [
      'k8s.restarts >= 5',
      'k8s.oomkilled >= 1',
      'CrashLoopBackOff 상태 파드 발생'
    ],
    steps: [
      '1. kubectl describe pod <pod-name> 명령으로 종료 원인(Exit Code 137 / OOMKilled) 확인',
      '2. 직전 로그(kubectl logs --previous) 분석하여 비정상 객체 할당 여부 점검',
      '3. Deployment 리소스 사양의 memory.limits 및 requests를 1GiB -> 2GiB로 상향 패치',
      '4. 롤링 업데이트 진행 및 파드 헬스체크 모니터링'
    ],
    recommendedAction: '파드 메모리 리밋 증설(1GiB -> 2GiB) 및 롤링 재시작',
    actionCode: 'patch_deployment_memory_limit'
  },
  {
    id: 'RB-02',
    title: '스토리지 및 루트 볼륨 용량 초과(Disk Full) 비상 대응 절차',
    description: '서버 또는 PV 디스크 사용률이 90% 이상이고 증가율이 급증할 때 긴급 회수 및 확장 절차',
    triggers: [
      'server.disk_pct >= 90',
      'storage.used_pct >= 90',
      'storage.growth_pct_day >= 3.0'
    ],
    steps: [
      '1. df -h 및 du -sh /var/log/* 점검으로 비정상적으로 누적된 임시 파일/로그 식별',
      '2. 보관 주기 초과된 7일 이상 된 백업 아카이브 및 컨테이너 로그 강제 정리(logrotate 긴급 실행)',
      '3. 영구 볼륨(PVC) 스토리지 요청량 즉시 확장(50GiB -> 100GiB)',
      '4. 임계치 80% 이하 회복 확인 및 슬랙 알림'
    ],
    recommendedAction: '오래된 임시 로그 긴급 정전(Logrotate) 및 PVC 볼륨 확장',
    actionCode: 'purge_logs_and_expand_pvc'
  },
  {
    id: 'RB-03',
    title: '솔루션 응답 지연 급증(P95 Latency Spike) 및 CPU 고갈 대응',
    description: 'API P95 응답시간이 2000ms를 초과하고 CPU 사용률이 90% 이상일 때 긴급 스케일아웃 및 스레드풀 조정',
    triggers: [
      'solution.p95_ms >= 2000',
      'server.cpu_pct >= 90',
      'solution.err_pct >= 5'
    ],
    steps: [
      '1. APM(핀포인트/프로메테우스) 스레드 덤프 캡처로 락 경합 및 슬로우 쿼리 발생 확인',
      '2. HPA(수평 자동 확장) 최대 복제본 한도 상향 및 즉시 3 Pods -> 6 Pods 스케일아웃',
      '3. 임시 캐시(Redis) 레이어 우회 쿼리 캐싱 활성화',
      '4. P95 응답시간 500ms 이하 안정화 모니터링'
    ],
    recommendedAction: 'Deployment 레플리카 긴급 수평 확장(3 -> 6) 및 캐시 워밍',
    actionCode: 'scale_out_solution_pods'
  },
  {
    id: 'RB-04',
    title: '배치 잡(Batch Job) 연속 실패 대응 및 데이터 정합성 복구',
    description: '스케줄러 또는 쿠버네티스 CronJob 실행 실패 시 재시도 및 실패 원인 격리',
    triggers: [
      'solution.job_failed >= 1'
    ],
    steps: [
      '1. kubectl logs job/<job-name> 으로 데드락 또는 데이터베이스 커넥션 타임아웃 확인',
      '2. 실패한 배치의 상태 플래그를 PENDING으로 초기화 및 누락 트랜잭션 롤백 점검',
      '3. 배치 큐 재처리 잡(Retry-Worker) 단독 수동 트리거',
      '4. 데이터베이스 인덱스 락 해제 및 재시도 성공 검증'
    ],
    recommendedAction: '배치 실패 트랜잭션 롤백 및 격리 워커 재실행 트리거',
    actionCode: 'retry_failed_batch_job'
  },
  {
    id: 'RB-05',
    title: 'TLS/SSL 보안 인증서 만료 임박(7일 미만) 긴급 갱신 절차',
    description: '솔루션 인그레스/도메인 인증서 잔여일이 7일 미만일 때 cert-manager 갱신 또는 수동 갱신',
    triggers: [
      'solution.cert_days_left < 7'
    ],
    steps: [
      '1. openssl s_client 로 실제 종단 인증서 만료일자 재검증',
      '2. cert-manager ACME 챌린지 상태 확인 (DNS-01 / HTTP-01 오류 유무)',
      '3. 새로운 와일드카드 인증서 Secret 주입 및 인그레스 컨트롤러 리로드',
      '4. 외부 브라우저 접속으로 유효기간 365일 갱신 완료 여부 확인'
    ],
    recommendedAction: '인그레스 TLS Secret 갱신 및 Nginx 인그레스 컨트롤러 리로드',
    actionCode: 'renew_tls_certificate'
  },
  {
    id: 'RB-06',
    title: '3단계 에스컬레이션 기준 및 벤더/파트너 이관 절차',
    description: '원인 불명 장애, 1차 조치 후 15분 내 재발, 솔루션 코어 엔진 버그 의심 시 이관 기준',
    triggers: [
      '1차 런북 조치 실행 후에도 경보 지속',
      '에이전트 원인 후보 확신도 60% 미만',
      '운영팀 권한 밖의 커널/DB 엔진 레벨 크래시'
    ],
    steps: [
      '1. 덤프 파일, 에러 로그 전문, 프로메테우스 4계층 스냅샷을 번들 파일로 내보내기',
      '2. 에스컬레이션 표준 문서 작성 (장애 개요, 발생 시간, 시도한 조치, 로그 발췌)',
      '3. 솔루션 벤더 24x7 긴급 핫라인 티켓 생성 및 담당 엔지니어 배정',
      '4. 임시 우회책(Bypass/Failover) 적용 및 상황 브리핑'
    ],
    recommendedAction: '벤더 기술지원팀 긴급 에스컬레이션 티켓 발행 및 진단 번들 첨부',
    actionCode: 'escalate_vendor_support'
  }
];

export function searchRunbooks(query: string): Runbook[] {
  if (!query || query.trim() === '') {
    return RUNBOOKS.slice(0, 2);
  }
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(t => t.length > 0);

  const scored = RUNBOOKS.map(rb => {
    let score = 0;
    const fullText = `${rb.id} ${rb.title} ${rb.description} ${rb.recommendedAction} ${rb.steps.join(' ')} ${rb.triggers.join(' ')}`.toLowerCase();

    // 전체 질의 매칭 가산점
    if (fullText.includes(q)) {
      score += 20;
    }

    // 토큰별 매칭 점수
    for (const token of tokens) {
      if (rb.id.toLowerCase().includes(token)) score += 15;
      if (rb.title.toLowerCase().includes(token)) score += 8;
      if (rb.recommendedAction.toLowerCase().includes(token)) score += 7;
      if (rb.description.toLowerCase().includes(token)) score += 5;
      if (rb.triggers.some(t => t.toLowerCase().includes(token))) score += 4;
      if (rb.steps.some(s => s.toLowerCase().includes(token))) score += 3;
    }

    return { rb, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter(s => s.score > 0).map(s => s.rb);
  return matched.length > 0 ? matched.slice(0, 2) : RUNBOOKS.slice(0, 2);
}
