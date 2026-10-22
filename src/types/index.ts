export type LayerType = 'server' | 'k8s' | 'solution' | 'storage';

export interface Metrics {
  server: { cpu_pct: number; mem_pct: number; disk_pct: number };
  k8s: { restarts: number; oomkilled: number; pending_pods: number };
  solution: { p95_ms: number; err_pct: number; job_failed: number; cert_days_left: number };
  storage: { used_pct: number; growth_pct_day: number };
}

export type AlertSeverity = 'normal' | 'warning' | 'critical';

export interface AlertItem {
  id: string;
  metricKey: string;
  label: string;
  layer: LayerType;
  currentValue: number;
  threshold: number;
  condition: '>=' | '<';
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}

export type ScenarioId = 'normal' | 'pod_crash' | 'disk_full' | 'latency_spike' | 'batch_fail' | 'cert_expire';

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  expectedRunbook: string;
  targetMetricChanges: string;
}

export interface Runbook {
  id: string;
  title: string;
  description: string;
  triggers: string[];
  steps: string[];
  recommendedAction: string;
  actionCode: string;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'CrashLoopBackOff' | 'Completed' | 'Error';
  restarts: number;
  cpuUsage: string;
  memUsage: string;
}

export interface TimelineEvent {
  id: string;
  type: 'alert' | 'diagnosis_start' | 'tool_call' | 'diagnosis_complete' | 'escalation' | 'approval_req' | 'action_applied' | 'system';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
}

export interface ToolCallRecord {
  tool: 'get_metrics' | 'get_logs' | 'search_runbook';
  args?: Record<string, any>;
  resultSummary: string;
  timestamp: string;
}

export interface DiagnosisReport {
  id: string;
  scenarioId: ScenarioId;
  symptom: string;
  evidence: {
    metricsConfirmed: string[];
    logsConfirmed: string[];
    toolsUsed: string[];
  };
  candidateCauses: Array<{ cause: string; confidence: number; reason: string }>;
  suggestedAction: {
    runbookId: string;
    actionTitle: string;
    description: string;
    requiresHumanApproval: boolean;
  };
  escalationNeeded: boolean;
  escalationReason?: string;
  createdAt: string;
  rawResponse?: string;
}

export interface AuditLog {
  id: string;
  scenarioId: ScenarioId;
  actionTitle: string;
  approvedBy: string;
  approvalNotes: string;
  step1Confirmed: boolean;
  step2Confirmed: boolean;
  executedAt: string;
  status: 'success' | 'failed';
  resultDescription: string;
}

export interface AgentMetrics {
  totalDiagnoses: number;
  toolCallCounts: {
    get_metrics: number;
    get_logs: number;
    search_runbook: number;
  };
  lastDiagnosisDurationMs: number;
  averageDiagnosisDurationMs: number;
}

export interface ScenarioEvaluation {
  scenarioId: ScenarioId;
  scenarioName: string;
  toolsCalled: {
    get_metrics: boolean;
    get_logs: boolean;
    search_runbook: boolean;
  };
  expectedRunbook: string;
  mentionedExpectedRunbook: boolean;
  durationMs: number;
  humanVerifiedCause: boolean | null;
  completedAt?: string;
}
