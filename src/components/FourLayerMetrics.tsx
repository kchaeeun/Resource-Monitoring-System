import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { METRIC_DEFINITIONS, evaluateMetricAlert } from '../utils/thresholds';
import { Server, Cpu, Layers, HardDrive, AlertCircle, Check } from 'lucide-react';
import { LayerType } from '../types';

interface MetricItemProps {
  metricKey: string;
  value: number;
}

const MetricItem: React.FC<MetricItemProps> = ({ metricKey, value }) => {
  const def = METRIC_DEFINITIONS[metricKey];
  if (!def) return null;

  const alertState = evaluateMetricAlert(metricKey, value);
  const isCritical = alertState.severity === 'critical';
  const isWarning = alertState.severity === 'warning';

  let statusBadge = (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
      <Check className="w-3 h-3" /> 정상
    </span>
  );

  if (isCritical) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded animate-pulse">
        <AlertCircle className="w-3 h-3" /> 위험 (임계초과)
      </span>
    );
  } else if (isWarning) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
        <AlertCircle className="w-3 h-3" /> 주의
      </span>
    );
  }

  return (
    <div className={`p-2.5 rounded-lg border transition ${
      isCritical
        ? 'border-rose-400/50 bg-rose-500/5 dark:bg-rose-500/10'
        : isWarning
        ? 'border-amber-400/50 bg-amber-500/5 dark:bg-amber-500/10'
        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40'
    }`}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {def.label}
        </span>
        {statusBadge}
      </div>
      <div className="flex items-baseline justify-between mt-1.5">
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
          {value}
          <span className="text-xs font-normal text-slate-500 ml-0.5">{def.unit}</span>
        </span>
        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          임계: {def.condition} {def.criticalThreshold}{def.unit}
        </span>
      </div>
    </div>
  );
};

export const FourLayerMetrics: React.FC = () => {
  const { metrics } = useConsoleStore();

  const layers: Array<{
    id: LayerType;
    title: string;
    sub: string;
    icon: React.ReactNode;
    keys: string[];
    values: number[];
  }> = [
    {
      id: 'server',
      title: '1. 서버 계층 (RHEL 9.2)',
      sub: '호스트 물리 노드 하드웨어 지표',
      icon: <Server className="w-4 h-4 text-sky-500" />,
      keys: ['server.cpu_pct', 'server.mem_pct', 'server.disk_pct'],
      values: [metrics.server.cpu_pct, metrics.server.mem_pct, metrics.server.disk_pct]
    },
    {
      id: 'k8s',
      title: '2. 쿠버네티스 계층 (K8s)',
      sub: '컨테이너 오케스트레이션 상태',
      icon: <Cpu className="w-4 h-4 text-indigo-500" />,
      keys: ['k8s.restarts', 'k8s.oomkilled', 'k8s.pending_pods'],
      values: [metrics.k8s.restarts, metrics.k8s.oomkilled, metrics.k8s.pending_pods]
    },
    {
      id: 'solution',
      title: '3. 솔루션 계층 (Solution)',
      sub: '엔터프라이즈 서비스 & API 상태',
      icon: <Layers className="w-4 h-4 text-emerald-500" />,
      keys: ['solution.p95_ms', 'solution.err_pct', 'solution.job_failed', 'solution.cert_days_left'],
      values: [metrics.solution.p95_ms, metrics.solution.err_pct, metrics.solution.job_failed, metrics.solution.cert_days_left]
    },
    {
      id: 'storage',
      title: '4. 스토리지 계층 (Storage)',
      sub: '영구 볼륨(PV) 및 일일 증가 추이',
      icon: <HardDrive className="w-4 h-4 text-amber-500" />,
      keys: ['storage.used_pct', 'storage.growth_pct_day'],
      values: [metrics.storage.used_pct, metrics.storage.growth_pct_day]
    }
  ];

  return (
    <section aria-label="4계층 모니터링 상세" className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>4계층 인프라 & 서비스 지표 모니터링 (F2)</span>
        </h2>
        <span className="text-xs text-slate-500">실시간 임계치 자동 판정</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                {layer.icon}
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {layer.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                {layer.sub}
              </p>

              <div className="space-y-2">
                {layer.keys.map((k, idx) => (
                  <MetricItem key={k} metricKey={k} value={layer.values[idx]} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
