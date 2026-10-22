import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';

export const TrendChart: React.FC = () => {
  const { metricHistory } = useConsoleStore();

  const width = 500;
  const height = 150;
  const padding = { top: 20, right: 25, bottom: 25, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const dataCount = metricHistory.length;

  // X 좌표 계산
  const getX = (index: number) => {
    if (dataCount <= 1) return padding.left;
    return padding.left + (index / (dataCount - 1)) * graphWidth;
  };

  // Y 좌표 계산 (0~100%)
  const getYPct = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return padding.top + graphHeight - (clamped / 100) * graphHeight;
  };

  // Y 좌표 계산 (P95 ms, 0~4000ms 기준)
  const maxP95 = 4000;
  const getYP95 = (val: number) => {
    const clamped = Math.max(0, Math.min(maxP95, val));
    return padding.top + graphHeight - (clamped / maxP95) * graphHeight;
  };

  // 경로 생성 함수
  const makePath = (getYFunc: (val: number) => number, key: 'cpu' | 'mem' | 'p95') => {
    return metricHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYFunc(d[key]).toFixed(1)}`)
      .join(' ');
  };

  const cpuPath = makePath(getYPct, 'cpu');
  const memPath = makePath(getYPct, 'mem');
  const p95Path = makePath(getYP95, 'p95');

  const latest = metricHistory[metricHistory.length - 1] || { cpu: 0, mem: 0, p95: 0, time: '' };

  return (
    <section aria-label="시스템 지표 시계열 추이 차트 (F7)" className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>시계열 지표 추이 & 임계치 감시 (F7)</span>
        </h2>
        <span className="text-xs text-slate-500">순수 SVG 렌더링 (외부 라이브러리 없음)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 차트 1: CPU 및 메모리 점유율 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                호스트 CPU & 메모리 추이 (%)
              </h3>
              <p className="text-[11px] text-slate-500">위험 임계치 90% 점선 감시</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <span className="w-2.5 h-0.5 bg-sky-500 inline-block"></span> CPU ({latest.cpu.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <span className="w-2.5 h-0.5 bg-violet-500 inline-block"></span> 메모리 ({latest.mem.toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-36"
              aria-label="CPU 및 메모리 사용률 시계열 선 차트"
              role="img"
            >
              {/* Y축 그리드 & 라벨 */}
              {[0, 50, 90, 100].map((tick) => {
                const y = getYPct(tick);
                const isThreshold = tick === 90;
                return (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={isThreshold ? '#f43f5e' : '#64748b'}
                      strokeWidth={isThreshold ? 1.5 : 0.5}
                      strokeDasharray={isThreshold ? '4 3' : '2 2'}
                      strokeOpacity={isThreshold ? 0.9 : 0.25}
                    />
                    <text
                      x={padding.left - 5}
                      y={y + 3}
                      fill={isThreshold ? '#f43f5e' : '#64748b'}
                      fontSize="9"
                      fontWeight={isThreshold ? 'bold' : 'normal'}
                      textAnchor="end"
                    >
                      {tick}%{isThreshold ? ' (임계)' : ''}
                    </text>
                  </g>
                );
              })}

              {/* 선 그래프 (CPU) */}
              <path
                d={cpuPath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 선 그래프 (메모리) */}
              <path
                d={memPath}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 데이터 포인트 점 */}
              {metricHistory.map((d, i) => (
                <circle
                  key={`cpu-dot-${i}`}
                  cx={getX(i)}
                  cy={getYPct(d.cpu)}
                  r="3"
                  className="fill-sky-500 stroke-white dark:stroke-slate-900"
                  strokeWidth="1.5"
                />
              ))}

              {/* X축 시간 라벨 */}
              {metricHistory.length > 0 && (
                <>
                  <text
                    x={padding.left}
                    y={height - 5}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="start"
                  >
                    {metricHistory[0].time}
                  </text>
                  <text
                    x={width - padding.right}
                    y={height - 5}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {metricHistory[metricHistory.length - 1].time} (현재)
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* 차트 2: P95 응답 지연 (ms) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                솔루션 P95 응답 지연 (ms)
              </h3>
              <p className="text-[11px] text-slate-500">위험 임계치 2000ms 점선 감시</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span> P95: {latest.p95.toFixed(0)}ms
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-36"
              aria-label="P95 응답시간 시계열 선 차트"
              role="img"
            >
              {/* Y축 그리드 & 라벨 */}
              {[0, 1000, 2000, 3500].map((tick) => {
                const y = getYP95(tick);
                const isThreshold = tick === 2000;
                return (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={isThreshold ? '#f43f5e' : '#64748b'}
                      strokeWidth={isThreshold ? 1.5 : 0.5}
                      strokeDasharray={isThreshold ? '4 3' : '2 2'}
                      strokeOpacity={isThreshold ? 0.9 : 0.25}
                    />
                    <text
                      x={padding.left - 5}
                      y={y + 3}
                      fill={isThreshold ? '#f43f5e' : '#64748b'}
                      fontSize="9"
                      fontWeight={isThreshold ? 'bold' : 'normal'}
                      textAnchor="end"
                    >
                      {tick}ms{isThreshold ? ' (임계)' : ''}
                    </text>
                  </g>
                );
              })}

              {/* 선 그래프 (P95) */}
              <path
                d={p95Path}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 데이터 포인트 점 */}
              {metricHistory.map((d, i) => (
                <circle
                  key={`p95-dot-${i}`}
                  cx={getX(i)}
                  cy={getYP95(d.p95)}
                  r="3"
                  className="fill-emerald-500 stroke-white dark:stroke-slate-900"
                  strokeWidth="1.5"
                />
              ))}

              {/* X축 시간 라벨 */}
              {metricHistory.length > 0 && (
                <>
                  <text
                    x={padding.left}
                    y={height - 5}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="start"
                  >
                    {metricHistory[0].time}
                  </text>
                  <text
                    x={width - padding.right}
                    y={height - 5}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {metricHistory[metricHistory.length - 1].time} (현재)
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
