import { Metrics, AlertItem, AlertSeverity } from '../types';

export interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  layer: 'server' | 'k8s' | 'solution' | 'storage';
  warningThreshold?: number;
  criticalThreshold: number;
  condition: '>=' | '<';
  description: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  // Server
  'server.cpu_pct': {
    key: 'server.cpu_pct',
    label: 'CPU 사용률',
    unit: '%',
    layer: 'server',
    warningThreshold: 75,
    criticalThreshold: 90,
    condition: '>=',
    description: 'RHEL 호스트 서버 CPU 사용률'
  },
  'server.mem_pct': {
    key: 'server.mem_pct',
    label: '메모리 사용률',
    unit: '%',
    layer: 'server',
    warningThreshold: 80,
    criticalThreshold: 90,
    condition: '>=',
    description: 'RHEL 호스트 물리 메모리 사용률'
  },
  'server.disk_pct': {
    key: 'server.disk_pct',
    label: '루트 디스크 사용률',
    unit: '%',
    layer: 'server',
    warningThreshold: 80,
    criticalThreshold: 90,
    condition: '>=',
    description: '루트(/) 볼륨 디스크 점유율'
  },

  // Kubernetes
  'k8s.restarts': {
    key: 'k8s.restarts',
    label: '파드 재시작 횟수',
    unit: '회',
    layer: 'k8s',
    warningThreshold: 2,
    criticalThreshold: 5,
    condition: '>=',
    description: '최근 1시간 내 파드 비정상 재시작'
  },
  'k8s.oomkilled': {
    key: 'k8s.oomkilled',
    label: 'OOMKilled 컨테이너',
    unit: '개',
    layer: 'k8s',
    criticalThreshold: 1,
    condition: '>=',
    description: '메모리 한도 초과로 강제 종료된 컨테이너'
  },
  'k8s.pending_pods': {
    key: 'k8s.pending_pods',
    label: 'Pending 파드',
    unit: '개',
    layer: 'k8s',
    criticalThreshold: 1,
    condition: '>=',
    description: '노드 자원 부족 등으로 스케줄링 대기 파드'
  },

  // Solution
  'solution.p95_ms': {
    key: 'solution.p95_ms',
    label: 'P95 응답시간',
    unit: 'ms',
    layer: 'solution',
    warningThreshold: 1000,
    criticalThreshold: 2000,
    condition: '>=',
    description: '솔루션 API 95 백분위 응답 지연'
  },
  'solution.err_pct': {
    key: 'solution.err_pct',
    label: '에러율 (5xx)',
    unit: '%',
    layer: 'solution',
    warningThreshold: 2,
    criticalThreshold: 5,
    condition: '>=',
    description: '솔루션 서비스 5xx HTTP 에러 비율'
  },
  'solution.job_failed': {
    key: 'solution.job_failed',
    label: '배치 잡 실패 수',
    unit: '건',
    layer: 'solution',
    criticalThreshold: 1,
    condition: '>=',
    description: '일일/주기적 배치 작업 실행 실패'
  },
  'solution.cert_days_left': {
    key: 'solution.cert_days_left',
    label: '인증서 만료 잔여일',
    unit: '일',
    layer: 'solution',
    warningThreshold: 14,
    criticalThreshold: 7,
    condition: '<',
    description: 'TLS/SSL 도메인 보안 인증서 만료까지 남은 일수'
  },

  // Storage
  'storage.used_pct': {
    key: 'storage.used_pct',
    label: '스토리지 사용률',
    unit: '%',
    layer: 'storage',
    warningThreshold: 80,
    criticalThreshold: 90,
    condition: '>=',
    description: '솔루션 공유 영구 볼륨(PV) 점유율'
  },
  'storage.growth_pct_day': {
    key: 'storage.growth_pct_day',
    label: '일일 용량 증가율',
    unit: '%/day',
    layer: 'storage',
    warningThreshold: 1.5,
    criticalThreshold: 3,
    condition: '>=',
    description: '일일 스토리지 사용량 증가 속도'
  }
};

export function evaluateMetricAlert(
  key: string,
  value: number
): { severity: AlertSeverity; message?: string } {
  const def = METRIC_DEFINITIONS[key];
  if (!def) return { severity: 'normal' };

  if (def.condition === '>=') {
    if (value >= def.criticalThreshold) {
      return {
        severity: 'critical',
        message: `${def.label}이(가) ${value}${def.unit}으로 임계치(${def.criticalThreshold}${def.unit})를 초과하여 심각(Critical) 상태입니다.`
      };
    }
    if (def.warningThreshold !== undefined && value >= def.warningThreshold) {
      return {
        severity: 'warning',
        message: `${def.label}이(가) ${value}${def.unit}으로 주의(${def.warningThreshold}${def.unit}) 수준에 도달했습니다.`
      };
    }
  } else if (def.condition === '<') {
    if (value < def.criticalThreshold) {
      return {
        severity: 'critical',
        message: `${def.label}이(가) ${value}${def.unit}으로 임계치(${def.criticalThreshold}${def.unit} 미만) 위험 상태입니다.`
      };
    }
    if (def.warningThreshold !== undefined && value < def.warningThreshold) {
      return {
        severity: 'warning',
        message: `${def.label}이(가) ${value}${def.unit}으로 주의 만료 임박 상태입니다.`
      };
    }
  }

  return { severity: 'normal' };
}

export function detectAllAlerts(metrics: Metrics): AlertItem[] {
  const alerts: AlertItem[] = [];

  const checks: Array<{ key: string; val: number }> = [
    { key: 'server.cpu_pct', val: metrics.server.cpu_pct },
    { key: 'server.mem_pct', val: metrics.server.mem_pct },
    { key: 'server.disk_pct', val: metrics.server.disk_pct },
    { key: 'k8s.restarts', val: metrics.k8s.restarts },
    { key: 'k8s.oomkilled', val: metrics.k8s.oomkilled },
    { key: 'k8s.pending_pods', val: metrics.k8s.pending_pods },
    { key: 'solution.p95_ms', val: metrics.solution.p95_ms },
    { key: 'solution.err_pct', val: metrics.solution.err_pct },
    { key: 'solution.job_failed', val: metrics.solution.job_failed },
    { key: 'solution.cert_days_left', val: metrics.solution.cert_days_left },
    { key: 'storage.used_pct', val: metrics.storage.used_pct },
    { key: 'storage.growth_pct_day', val: metrics.storage.growth_pct_day }
  ];

  for (const check of checks) {
    const res = evaluateMetricAlert(check.key, check.val);
    if (res.severity !== 'normal') {
      const def = METRIC_DEFINITIONS[check.key];
      alerts.push({
        id: `alert-${check.key}-${Date.now()}`,
        metricKey: check.key,
        label: def.label,
        layer: def.layer,
        currentValue: check.val,
        threshold: def.criticalThreshold,
        condition: def.condition,
        severity: res.severity,
        message: res.message || '',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
      });
    }
  }

  return alerts;
}
