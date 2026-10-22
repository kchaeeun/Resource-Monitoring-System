import React from 'react';
import { useConsoleStore } from '../store/useConsoleStore';
import { SCENARIO_DEFINITIONS } from '../data/scenarios';
import { ScenarioId } from '../types';
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  FileCheck2,
  Moon,
  RefreshCw,
  Sun
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentScenario,
    setScenario,
    isDarkMode,
    toggleDarkMode,
    openObservabilityModal,
    activeAlerts,
    auditLogs
  } = useConsoleStore();

  const isCritical = activeAlerts.some(a => a.severity === 'critical');
  const isWarning = activeAlerts.some(a => a.severity === 'warning');

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      {/* 법적 및 시뮬레이션 고지 바 */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>[시뮬레이션 환경]</strong> 본 콘솔의 모든 지표·로그·런북은 시뮬레이션 데이터이며 실제 고객 운영 환경이 아닙니다. (개인 포트폴리오 프로젝트)
          </span>
        </div>
        <div className="text-[11px] opacity-80 hidden md:block">
          원칙: 읽기 전용 도구 우선 • 사람이 최종 승인(Human-in-the-Loop)
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* 로고 & 시스템 상태 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            AG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                운영 장애 진단 에이전트 콘솔
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                RHEL 9 + K8s
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              엔터프라이즈 솔루션 4계층 상시 감시 및 자율 진단 플랫폼
            </p>
          </div>
        </div>

        {/* 시나리오 주입 셀렉터 & 컨트롤 */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 pl-1.5 hidden sm:inline">
              장애 시뮬레이터:
            </span>
            <select
              aria-label="장애 시뮬레이션 시나리오 선택"
              value={currentScenario}
              onChange={(e) => setScenario(e.target.value as ScenarioId)}
              className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SCENARIO_DEFINITIONS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 에이전트 관측 & 평가표 버튼 */}
          <button
            onClick={openObservabilityModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            title="에이전트 관측 지표 및 시나리오 평가표 (F11, F12)"
          >
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">관측 & 평가표</span>
          </button>

          {/* 다크/라이트 모드 토글 */}
          <button
            onClick={toggleDarkMode}
            aria-label="다크 모드 전환"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
