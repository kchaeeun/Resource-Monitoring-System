/**
 * 스토리지 용량 예측 (F10)
 * 현재 사용률과 일일 증가율을 바탕으로 100% 도달까지 남은 시간(일/시간) 계산
 */
export interface DiskPredictionResult {
  currentPct: number;
  growthPctDay: number;
  remainingPct: number;
  daysRemaining: number;
  hoursRemaining: number;
  estimatedFullDateText: string;
  isCritical: boolean;
  isWarning: boolean;
}

export function calculateDiskExhaustion(
  currentPct: number,
  growthPctDay: number
): DiskPredictionResult {
  const remainingPct = Math.max(0, 100 - currentPct);

  // 증가율이 0 이하이거나 가득 찬 경우
  if (remainingPct <= 0) {
    return {
      currentPct,
      growthPctDay,
      remainingPct: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      estimatedFullDateText: '이미 가득 참 (0시간)',
      isCritical: true,
      isWarning: true
    };
  }

  if (growthPctDay <= 0.05) {
    return {
      currentPct,
      growthPctDay,
      remainingPct,
      daysRemaining: 999,
      hoursRemaining: 999 * 24,
      estimatedFullDateText: '안정적 (증가율 미미, 3년 이상)',
      isCritical: false,
      isWarning: false
    };
  }

  const daysRemaining = remainingPct / growthPctDay;
  const hoursRemaining = Math.round(daysRemaining * 24);

  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + hoursRemaining);

  const isCritical = daysRemaining <= 3; // 3일 이내 소진 시 심각
  const isWarning = daysRemaining <= 7;  // 7일 이내 소진 시 경고

  let estimatedFullDateText = '';
  if (daysRemaining < 1) {
    estimatedFullDateText = `약 ${hoursRemaining}시간 후 고갈 예상`;
  } else {
    estimatedFullDateText = `약 ${daysRemaining.toFixed(1)}일 후 (${targetDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 예상)`;
  }

  return {
    currentPct,
    growthPctDay,
    remainingPct,
    daysRemaining,
    hoursRemaining,
    estimatedFullDateText,
    isCritical,
    isWarning
  };
}
