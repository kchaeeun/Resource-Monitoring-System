import type { VercelRequest, VercelResponse } from '@vercel/node';

// 이메일 및 IP 마스킹 함수
function maskSensitive(text: string): string {
  if (!text) return '';
  const ipRegex = /\b(\d{1,3}\.\d{1,3}\.)\d{1,3}\.\d{1,3}\b/g;
  let masked = text.replace(ipRegex, '$1***.***');
  const emailRegex = /\b([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\b/g;
  masked = masked.replace(emailRegex, (_match, user, domain) => {
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  });
  return masked;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 및 메서드 확인
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, scenarioId, metrics, logs, runbooks } = req.body || {};
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022';

    const safePrompt = maskSensitive(prompt || '');

    // API Key가 없거나 테스트 환경일 경우, 고품질 시뮬레이션 진단 응답 반환
    if (!apiKey) {
      return res.status(200).json({
        isSimulated: true,
        message: 'Anthropic API 키가 설정되지 않아 지능형 진단 시뮬레이터로 응답합니다.',
        toolCallsExecuted: ['get_metrics', 'get_logs', 'search_runbook'],
        scenarioId
      });
    }

    // Anthropic API 호출 로직 (키가 설정된 경우)
    const systemPrompt = `당신은 RHEL + 쿠버네티스 엔터프라이즈 솔루션 운영 환경의 전문 장애 진단 AI 에이전트입니다.
운영 원칙:
1. 읽기 전용 도구(get_metrics, get_logs, search_runbook)로 확인한 사실만 말합니다.
2. 조치는 제안만 하며 사용자의 명시적 승인(Human-in-the-Loop)이 필요함을 강조합니다.
3. 확인하지 않은 수치는 절대 만들어내지 않습니다.
4. 반드시 다음 5개 항목 순서로 답변하십시오:
  1) 증상
  2) 근거 (지표·로그, 확인한 도구 명시)
  3) 원인 후보와 확신도 (백분율)
  4) 조치 제안 (추천 런북 ID, 사람의 승인 필요 명시)
  5) 에스컬레이션 필요 여부`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `[시스템 메트릭 정보]: ${JSON.stringify(metrics)}
[최근 시스템 로그]: ${JSON.stringify(logs)}
[등록된 런북 목록]: ${JSON.stringify(runbooks)}
[사용자 요청]: ${safePrompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
