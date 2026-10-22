# 🛡️ Resource Monitoring System (운영 장애 진단 에이전트 콘솔)

> **RHEL 9 + Kubernetes 기반 엔터프라이즈 솔루션 4계층 상시 감시 및 AI 자율 진단 플랫폼**  
> 장애 감지부터 읽기 전용 도구를 통한 원인 규명, 그리고 사람이 승인한 조치만 실행하는 **Human-in-the-Loop** 운영 사이클을 완벽하게 재현합니다.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://github.com/pmndrs/zustand)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 고지 사항 (Disclaimer)
본 콘솔에 포함된 모든 지표·로그·런북은 시뮬레이션 데이터이며 실제 고객 운영 환경이 아닙니다. 개인 연구 및 포트폴리오 프로젝트이며 특정 기업의 공식 서비스가 아닙니다.

---

## 🧭 핵심 운영 원칙

1. **읽기 전용 도구 우선 (Read-Only First)**: 에이전트는 조회 도구 3종(`get_metrics`, `get_logs`, `search_runbook`)만 사용하며 시스템 변경 권한을 갖지 않습니다.
2. **사람이 승인한다 (Human-in-the-Loop)**: 조치 실행은 운영자의 명시적 **2단계 승인**(영향도 확인 + 서명/사유 기재) 후에만 수행됩니다.
3. **근거 기반 답변**: 도구로 확인한 사실과 로그만 말하고, 확인하지 않은 수치는 절대 생성하지 않습니다.
4. **작동하는 것이 먼저**: 5대 핵심 장애 시나리오의 완주(감지 → 진단 → 문서 작성 → 승인 후 조치)를 충족합니다.
5. **배포까지 완성**: Vercel Serverless Function 및 빌드 최적화(`npm run build` -> `dist`)를 지원합니다.

---

## ✨ 주요 기능 (F1 ~ F12)

```
[React 프론트엔드]
  ├─ 4계층 모니터링 대시보드 (서버/K8s/솔루션/스토리지)
  ├─ 자체 SVG 시계열 추이 차트 & 임계치 감시
  ├─ 디스크 고갈 예측 & 쿠버네티스 파드 상태 그리드
  └─ AI 진단 에이전트 패널
        │  POST /api/agent (Serverless)
        ▼
[Vercel Serverless: api/agent.ts]
  ├─ 입력 마스킹 (이메일·IP 자동 비식별화)
  ├─ 가드레일 & Anthropic Claude API 프록시 (키 보호)
  └─ 읽기 전용 도구 3종 실행 (get_metrics, get_logs, search_runbook)
        ▼
[Human-in-the-Loop 승인]
  2단계 검증 후 시뮬레이션 조치 실행 & 감사 로그(Audit Log) 영구 기록
```

| ID | 기능명 | 설명 |
|---|---|---|
| **F1** | **상태 요약** | 전체 상태(정상·경고·위험), 활성 경보 수, 정상 지표 수 카드 표시 |
| **F2** | **4계층 모니터링** | 서버(RHEL), 쿠버네티스, 솔루션, 스토리지 지표와 실시간 임계치 자동 판정 |
| **F3** | **장애 시뮬레이터** | 5대 장애 시나리오(파드 종료, 디스크 고갈, 지연시간 급증, 배치 실패, 인증서 만료) 주입 |
| **F4** | **진단 에이전트** | 3종 도구 파이프라인으로 증상, 근거, 원인 후보 & 확신도, 조치 제안, 에스컬레이션 여부 보고 |
| **F5** | **에스컬레이션 문서** | 벤더/파트너 이관용 표준 Markdown 보고서 자동 생성, 원클릭 복사 및 `.md` 다운로드 지원 |
| **F6** | **승인 후 조치** | 영향도 확인 및 서명의 2단계 승인 후 조치 실행, 감사 기록(Audit Log) 영구 보관 |
| **F7** | **시계열 추이** | 외부 라이브러리 없이 순수 **SVG**로 구현한 CPU·메모리·P95 선 그래프 및 위험 임계치 점선 |
| **F8** | **파드 상태 그리드** | Running, Pending, CrashLoopBackOff, Error 파드를 색상·아이콘·텍스트로 명확히 구분 |
| **F9** | **경보 타임라인** | 발생 → 진단 시작 → 도구 호출 → 리포트 완료 → 승인 및 조치 실행 순차 타임라인 |
| **F10** | **디스크 용량 예측** | 스토리지 일일 증가율을 분석하여 100% 가득 찰 때까지 남은 시간 및 고갈 시점 예측 |
| **F11** | **에이전트 관측** | 누적 진단 횟수, 도구별 호출 횟수, 실제 측정된 진단 소요 시간 메트릭 집계 |
| **F12** | **품질 평가표** | 도구 3종 호출 여부, 기대 런북 ID 일치율, 소요 시간, 사람의 원인 검증 체크표 제공 |

---

## 📋 5대 장애 시나리오 & 런북 매핑

| 시나리오 | 주요 지표 변화 | 기대 런북 ID | 권장 조치 |
|---|---|---|---|
| **1. 파드 반복 종료** | `mem_pct` (94%), `restarts` (8회), `oomkilled` (2건) | **RB-01** | 파드 메모리 리밋 증설(1GiB -> 2GiB) 및 롤링 재시작 |
| **2. 디스크 가득 참** | `disk_pct` (92%), `used_pct` (93%), `growth_pct_day` (4.8%) | **RB-02** | 임시 로그 긴급 정전(Logrotate) 및 PVC 50GiB 증설 |
| **3. 응답 지연 급증** | `cpu_pct` (92%), `p95_ms` (3,450ms), `err_pct` (7.4%) | **RB-03** | 게이트웨이 파드 수평 확장(3 -> 6) 및 캐시 워밍 |
| **4. 배치 잡 실패** | `job_failed` (3건), `err_pct` (5.6%) | **RB-04** | 배치 트랜잭션 롤백 및 격리 워커 재실행 트리거 |
| **5. 인증서 만료 임박** | `cert_days_left` (3일) | **RB-05** | 인그레스 TLS Secret 갱신 및 컨트롤러 리로드 |
| **에스컬레이션 기준** | 1차 조치 후 미해결 / 원인 불명 / 코어 버그 의심 시 | **RB-06** | 벤더 기술지원팀 긴급 이관 (진단 번들 첨부) |

---

## 💻 로컬 개발 및 실행

```bash
# 1. 저장소 복제
git clone https://github.com/kchaeeun/Resource-Monitoring-System.git
cd Resource-Monitoring-System

# 2. 의존성 패키지 설치
npm install

# 3. 개발 서버 구동 (기본 포트: 5173)
npm run dev

# 4. 프로덕션 빌드 (출력: dist/)
npm run build
```

---

## 🌐 Vercel 배포 가이드

1. GitHub 저장소를 Vercel에 연결(Import)합니다.
2. 빌드 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. 환경 변수 (`.env.local`):
   - `ANTHROPIC_API_KEY`: Anthropic Claude API 키 (선택 사항: 미등록 시 내장된 지능형 시뮬레이션 모드로 작동)
   - `LLM_MODEL`: `claude-3-5-sonnet-20241022`
4. **Deploy** 버튼 클릭 후 즉시 공개 URL 생성 완료.

---

## 📁 프로젝트 디렉토리 구조

```
├── api/
│   └── agent.ts             # Vercel Serverless Function (Claude API 프록시 & 민감정보 마스킹)
├── src/
│   ├── api/                 # 클라이언트 메트릭/에이전트 어댑터
│   ├── components/          # React 컴포넌트 (StatusSummary, FourLayerMetrics, TrendChart 등)
│   ├── data/                # 5대 장애 시나리오 및 런북(RB-01~RB-06) 정의
│   ├── pages/               # ConsolePage 메인 콘솔 페이지
│   ├── store/               # Zustand 전역 상태 스토어
│   ├── types/               # TypeScript 인터페이스 명세
│   └── utils/               # 민감정보(IP/이메일) 마스킹, 임계치 판정, 디스크 예측 유틸
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```
