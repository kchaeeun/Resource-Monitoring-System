import React from 'react';
import { Header } from '../components/Header';
import { StatusSummary } from '../components/StatusSummary';
import { FourLayerMetrics } from '../components/FourLayerMetrics';
import { TrendChart } from '../components/TrendChart';
import { PodGrid } from '../components/PodGrid';
import { DiskPredictionCard } from '../components/DiskPredictionCard';
import { AgentPanel } from '../components/AgentPanel';
import { Timeline } from '../components/Timeline';
import { ActionApprovalModal } from '../components/ActionApprovalModal';
import { EscalationModal } from '../components/EscalationModal';
import { ObservabilityModal } from '../components/ObservabilityModal';
import { AuditLogView } from '../components/AuditLogView';

export const ConsolePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* F1 상태 요약 */}
        <StatusSummary />

        {/* F2 4계층 모니터링 지표 */}
        <FourLayerMetrics />

        {/* F7 시계열 지표 추이 & 임계치 SVG 차트 */}
        <TrendChart />

        {/* F8 파드 상태 그리드 */}
        <PodGrid />

        {/* 2단 메인 작업 영역: 진단 에이전트 & 감사 로그 vs 디스크 예측 & 타임라인 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* 좌측 (2열): F4 진단 에이전트 패널 & F6 감사 로그 */}
          <div className="lg:col-span-2 space-y-6">
            <AgentPanel />
            <AuditLogView />
          </div>

          {/* 우측 (1열): F10 디스크 예측 & F9 경보 타임라인 */}
          <div className="space-y-6">
            <DiskPredictionCard />
            <Timeline />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            운영 장애 진단 에이전트 콘솔 • 개인 포트폴리오 프로젝트 (가상 시뮬레이션 환경)
          </span>
          <span>
            Human-in-the-Loop • Read-Only Agent • SVG Visualizations
          </span>
        </div>
      </footer>

      {/* 모달 레이어 */}
      <ActionApprovalModal />
      <EscalationModal />
      <ObservabilityModal />
    </div>
  );
};
