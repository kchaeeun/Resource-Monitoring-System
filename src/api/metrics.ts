import { Metrics, LayerType } from '../types';

/**
 * 지표 조회 어댑터
 * 기본은 시뮬레이터 데이터를 반환하며, 향후 Prometheus 연동 시 이 모듈만 교체 가능합니다.
 */
export async function fetchMetricsByLayer(
  layer: LayerType,
  currentMetrics: Metrics
): Promise<Record<string, number>> {
  // 인위적 지연을 주어 실제 네트워크/프로메테우스 조회 느낌 부여
  await new Promise(resolve => setTimeout(resolve, 300));

  switch (layer) {
    case 'server':
      return currentMetrics.server;
    case 'k8s':
      return currentMetrics.k8s;
    case 'solution':
      return currentMetrics.solution;
    case 'storage':
      return currentMetrics.storage;
    default:
      throw new Error(`알 수 없는 계층: ${layer}`);
  }
}
