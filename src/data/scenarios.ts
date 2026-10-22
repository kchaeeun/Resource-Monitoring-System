import { Metrics, PodInfo, ScenarioDefinition, ScenarioId } from '../types';

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'normal',
    name: '정상 상태 (Healthy Baseline)',
    description: '모든 서버, 쿠버네티스 파드, 솔루션 서비스, 스토리지가 임계치 내에서 정상 동작 중인 기본 상태입니다.',
    expectedRunbook: 'N/A',
    targetMetricChanges: '모든 지표 정상'
  },
  {
    id: 'pod_crash',
    name: '시나리오 1: 파드 반복 종료 (CrashLoopBackOff / OOM)',
    description: '솔루션 워커 컨테이너의 힙 메모리 급증으로 OOMKilled가 발생하고 파드가 지속적으로 재시작됩니다.',
    expectedRunbook: 'RB-01',
    targetMetricChanges: 'mem_pct (94%), restarts (8회), oomkilled (2건)'
  },
  {
    id: 'disk_full',
    name: '시나리오 2: 디스크 가득 참 (Disk Full & High Growth)',
    description: '애플리케이션 디버그 로그 누적 및 스토리지 폭증으로 영구 볼륨 사용률이 93%에 도달하고 가득 찰 위기입니다.',
    expectedRunbook: 'RB-02',
    targetMetricChanges: 'disk_pct (92%), used_pct (93%), growth_pct_day (4.8%/day)'
  },
  {
    id: 'latency_spike',
    name: '시나리오 3: 응답 지연 급증 (Latency Spike & CPU Throttle)',
    description: '특정 API 엔드포인트의 쿼리 병목으로 서버 CPU 92% 도달 및 P95 지연시간이 3,450ms로 급증합니다.',
    expectedRunbook: 'RB-03',
    targetMetricChanges: 'cpu_pct (92%), p95_ms (3,450ms), err_pct (7.4%)'
  },
  {
    id: 'batch_fail',
    name: '시나리오 4: 배치 잡 실패 (Batch Job Failure)',
    description: '야간 데이터 정산 및 동기화 CronJob에서 데드락이 발생하여 3연속 실패 경보가 울립니다.',
    expectedRunbook: 'RB-04',
    targetMetricChanges: 'job_failed (3건), err_pct (3.8%)'
  },
  {
    id: 'cert_expire',
    name: '시나리오 5: 인증서 만료 임박 (TLS Certificate Expiring)',
    description: '외부 고객 유입용 도메인 TLS/SSL 와일드카드 인증서 유효기간이 3일밖에 남지 않았습니다.',
    expectedRunbook: 'RB-05',
    targetMetricChanges: 'cert_days_left (3일)'
  }
];

export const BASELINE_METRICS: Metrics = {
  server: { cpu_pct: 38, mem_pct: 62, disk_pct: 54 },
  k8s: { restarts: 0, oomkilled: 0, pending_pods: 0 },
  solution: { p95_ms: 240, err_pct: 0.2, job_failed: 0, cert_days_left: 45 },
  storage: { used_pct: 58, growth_pct_day: 0.4 }
};

export const SCENARIO_METRICS: Record<ScenarioId, Metrics> = {
  normal: { ...BASELINE_METRICS },
  pod_crash: {
    server: { cpu_pct: 52, mem_pct: 94, disk_pct: 55 },
    k8s: { restarts: 8, oomkilled: 2, pending_pods: 1 },
    solution: { p95_ms: 680, err_pct: 4.1, job_failed: 0, cert_days_left: 45 },
    storage: { used_pct: 59, growth_pct_day: 0.5 }
  },
  disk_full: {
    server: { cpu_pct: 44, mem_pct: 66, disk_pct: 92 },
    k8s: { restarts: 1, oomkilled: 0, pending_pods: 0 },
    solution: { p95_ms: 420, err_pct: 1.2, job_failed: 0, cert_days_left: 45 },
    storage: { used_pct: 93, growth_pct_day: 4.8 }
  },
  latency_spike: {
    server: { cpu_pct: 92, mem_pct: 78, disk_pct: 54 },
    k8s: { restarts: 0, oomkilled: 0, pending_pods: 0 },
    solution: { p95_ms: 3450, err_pct: 7.4, job_failed: 0, cert_days_left: 45 },
    storage: { used_pct: 60, growth_pct_day: 0.6 }
  },
  batch_fail: {
    server: { cpu_pct: 48, mem_pct: 65, disk_pct: 55 },
    k8s: { restarts: 2, oomkilled: 0, pending_pods: 0 },
    solution: { p95_ms: 310, err_pct: 5.6, job_failed: 3, cert_days_left: 45 },
    storage: { used_pct: 61, growth_pct_day: 0.4 }
  },
  cert_expire: {
    server: { cpu_pct: 35, mem_pct: 60, disk_pct: 54 },
    k8s: { restarts: 0, oomkilled: 0, pending_pods: 0 },
    solution: { p95_ms: 220, err_pct: 0.3, job_failed: 0, cert_days_left: 3 },
    storage: { used_pct: 58, growth_pct_day: 0.3 }
  }
};

export const BASELINE_PODS: PodInfo[] = [
  { name: 'solution-gateway-7b9f84-xk92m', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '140m', memUsage: '420Mi' },
  { name: 'solution-gateway-7b9f84-pl09a', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '135m', memUsage: '415Mi' },
  { name: 'solution-worker-5c689d-47hba', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '310m', memUsage: '890Mi' },
  { name: 'solution-worker-5c689d-9q2zz', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '295m', memUsage: '860Mi' },
  { name: 'solution-auth-89a1c0-vv71m', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '65m', memUsage: '210Mi' },
  { name: 'solution-batch-daily-289410', namespace: 'prod-solution', status: 'Completed', restarts: 0, cpuUsage: '0m', memUsage: '0Mi' },
  { name: 'storage-syncer-daemon-98x1a', namespace: 'kube-system', status: 'Running', restarts: 0, cpuUsage: '40m', memUsage: '180Mi' },
  { name: 'ingress-nginx-controller-01', namespace: 'ingress-nginx', status: 'Running', restarts: 0, cpuUsage: '110m', memUsage: '340Mi' }
];

export const SCENARIO_PODS: Record<ScenarioId, PodInfo[]> = {
  normal: BASELINE_PODS,
  pod_crash: [
    { name: 'solution-gateway-7b9f84-xk92m', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '140m', memUsage: '420Mi' },
    { name: 'solution-gateway-7b9f84-pl09a', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '135m', memUsage: '415Mi' },
    { name: 'solution-worker-5c689d-47hba', namespace: 'prod-solution', status: 'CrashLoopBackOff', restarts: 6, cpuUsage: '0m (Killed)', memUsage: '2048Mi (Max)' },
    { name: 'solution-worker-5c689d-9q2zz', namespace: 'prod-solution', status: 'CrashLoopBackOff', restarts: 2, cpuUsage: '12m', memUsage: '1980Mi (OOM)' },
    { name: 'solution-worker-5c689d-pending', namespace: 'prod-solution', status: 'Pending', restarts: 0, cpuUsage: '0m', memUsage: '0Mi' },
    { name: 'solution-auth-89a1c0-vv71m', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '70m', memUsage: '215Mi' },
    { name: 'solution-batch-daily-289410', namespace: 'prod-solution', status: 'Completed', restarts: 0, cpuUsage: '0m', memUsage: '0Mi' },
    { name: 'ingress-nginx-controller-01', namespace: 'ingress-nginx', status: 'Running', restarts: 0, cpuUsage: '120m', memUsage: '350Mi' }
  ],
  disk_full: [
    ...BASELINE_PODS.slice(0, 6),
    { name: 'storage-syncer-daemon-98x1a', namespace: 'kube-system', status: 'Error', restarts: 1, cpuUsage: '20m', memUsage: '210Mi (Disk full err)' },
    { name: 'ingress-nginx-controller-01', namespace: 'ingress-nginx', status: 'Running', restarts: 0, cpuUsage: '110m', memUsage: '340Mi' }
  ],
  latency_spike: [
    { name: 'solution-gateway-7b9f84-xk92m', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '920m (Throttled)', memUsage: '580Mi' },
    { name: 'solution-gateway-7b9f84-pl09a', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '890m (Throttled)', memUsage: '560Mi' },
    { name: 'solution-worker-5c689d-47hba', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '980m (100% Core)', memUsage: '940Mi' },
    { name: 'solution-worker-5c689d-9q2zz', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '960m (100% Core)', memUsage: '930Mi' },
    { name: 'solution-auth-89a1c0-vv71m', namespace: 'prod-solution', status: 'Running', restarts: 0, cpuUsage: '180m', memUsage: '240Mi' },
    { name: 'solution-batch-daily-289410', namespace: 'prod-solution', status: 'Completed', restarts: 0, cpuUsage: '0m', memUsage: '0Mi' },
    { name: 'storage-syncer-daemon-98x1a', namespace: 'kube-system', status: 'Running', restarts: 0, cpuUsage: '40m', memUsage: '180Mi' },
    { name: 'ingress-nginx-controller-01', namespace: 'ingress-nginx', status: 'Running', restarts: 0, cpuUsage: '310m', memUsage: '420Mi' }
  ],
  batch_fail: [
    ...BASELINE_PODS.slice(0, 5),
    { name: 'solution-batch-daily-289410', namespace: 'prod-solution', status: 'Error', restarts: 3, cpuUsage: '0m', memUsage: '120Mi' },
    BASELINE_PODS[6],
    BASELINE_PODS[7]
  ],
  cert_expire: BASELINE_PODS
};

export const SCENARIO_LOGS: Record<ScenarioId, string[]> = {
  normal: [
    '[INFO] [System] 2026-10-22 11:00:00 RHEL kernel 5.14.0 healthy, uptime 42 days',
    '[INFO] [K8s] 2026-10-22 11:02:14 All 8 daemonsets and deployments healthy in prod-solution',
    '[INFO] [Solution] 2026-10-22 11:05:30 Health probe /actuator/health status=UP, response=12ms',
    '[INFO] [Storage] 2026-10-22 11:08:00 PV volume nfs-prod-pv usage steady at 58%'
  ],
  pod_crash: [
    '[WARN] [K8s] 2026-10-22 11:14:02 Pod prod-solution/solution-worker-5c689d-47hba exceeded memory limit (2048Mi)',
    '[CRIT] [K8s] 2026-10-22 11:14:05 Container worker-main in pod solution-worker-5c689d-47hba terminated with ExitCode 137 (OOMKilled)',
    '[ERROR] [K8s] 2026-10-22 11:14:08 Back-off restarting failed container worker-main in pod solution-worker-5c689d-47hba',
    '[WARN] [K8s] 2026-10-22 11:15:10 Pod prod-solution/solution-worker-5c689d-9q2zz memory usage reached 1980Mi (96.6% of limit)',
    '[ERROR] [Solution] 2026-10-22 11:15:15 java.lang.OutOfMemoryError: Java heap space during heavy PDF report rendering job',
    '[WARN] [RHEL] 2026-10-22 11:15:20 Node worker-node-02 kernel invoked oom-killer: gfp_mask=0x1100cca'
  ],
  disk_full: [
    '[WARN] [RHEL] 2026-10-22 11:10:00 /dev/mapper/rhel-root mounted on / is at 92% capacity (Threshold: 90%)',
    '[CRIT] [Storage] 2026-10-22 11:12:30 NFS PV /mnt/solution-shared-pvc used 93% (Growth rate: +4.8% per day)',
    '[ERROR] [Solution] 2026-10-22 11:13:00 IOException: No space left on device while flushing transaction logs into /var/log/solution/audit_raw.log',
    '[WARN] [K8s] 2026-10-22 11:13:40 Kubelet evict threshold reached on /var/lib/docker/containers (Free disk < 10%)',
    '[ERROR] [Storage] 2026-10-22 11:14:10 storage-syncer daemon unable to create snapshot: ENOSPC'
  ],
  latency_spike: [
    '[WARN] [RHEL] 2026-10-22 11:11:00 Total system CPU load average reached 14.8 on 16-core RHEL host (CPU usage: 92%)',
    '[CRIT] [Solution] 2026-10-22 11:12:45 P95 latency degraded to 3450ms for /api/v2/orders/search',
    '[ERROR] [Solution] 2026-10-22 11:13:20 HikariPool-1 - Connection is not available, request timed out after 3000ms',
    '[WARN] [K8s] 2026-10-22 11:13:50 solution-gateway pods CPU throttling percentage reached 68%',
    '[ERROR] [Ingress] 2026-10-22 11:14:15 Upstream timed out (110: Connection timed out) while reading response header from upstream'
  ],
  batch_fail: [
    '[INFO] [K8s] 2026-10-22 03:00:00 Job batch-daily-reconcile-289410 started by CronJob scheduler',
    '[ERROR] [Solution] 2026-10-22 03:04:12 Batch execution failed in Step [settlementProcessor]: Deadlock found when trying to get lock',
    '[CRIT] [Solution] 2026-10-22 03:04:15 JobExecutionException: Transaction marked as rollback-only. Reconciled items: 0/14520',
    '[ERROR] [K8s] 2026-10-22 03:10:00 Job batch-daily-reconcile-289410 failed: Pod solution-batch-daily-289410 backoffLimit reached (3 failures)',
    '[WARN] [AlertManager] 2026-10-22 03:10:05 Alert: BatchJobFailedCount >= 1 triggered for service prod-solution'
  ],
  cert_expire: [
    '[WARN] [CertManager] 2026-10-22 09:00:00 Certificate prod-wildcard-tls expires in 3 days (Expiry date: 2026-10-25 00:00:00 UTC)',
    '[CRIT] [Solution] 2026-10-22 09:15:00 Ingress TLS certificate prod-wildcard-tls below critical threshold (7 days)',
    '[WARN] [Ingress] 2026-10-22 09:20:00 External browser clients warning regarding short certificate lifetime',
    '[INFO] [CertManager] 2026-10-22 09:30:00 Automatic renewal via ACME DNS-01 webhook timed out due to token rotation'
  ]
};
