# 🔧 AS 관리 시스템

소규모 사업자를 위한 AS(애프터서비스) 접수 및 관리 웹앱입니다.  
직원용 관리 페이지와 소비자용 공개 접수 페이지를 함께 제공합니다.

---

## 주요 기능

- **소비자** — 로그인 없이 AS 접수 등록 및 진행 상태 조회
- **직원** — 로그인 후 전체 AS 목록 관리, 진행 상태 변경, 수령 관리
- **대시보드** — 접수 현황 통계 한눈에 확인
- **AS 수령 관리** — 택배/직접픽업 별 수령 현황 및 송장번호 관리

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 스토리지 | Supabase Storage |
| 배포 | Vercel |
| 스타일 | Tailwind CSS |

---

## 시작하기

### 1단계 — 저장소 클론

```bash
git clone https://github.com/handybro/as-manager-public.git
cd as-manager-public
npm install
```

### 2단계 — Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 후 무료 계정 생성
2. **New Project** 클릭 → 프로젝트 이름, 비밀번호 입력 후 생성
3. 생성 완료 후 **Settings → API** 메뉴에서 아래 두 값 복사
   - `Project URL`
   - `anon public` 키

### 3단계 — 데이터베이스 스키마 적용

1. Supabase 대시보드 → **SQL Editor**
2. `schema.sql` 파일 전체 내용 붙여넣기 후 **Run** 클릭

### 4단계 — 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 새로 만들고 아래 내용 입력:

```
NEXT_PUBLIC_SUPABASE_URL=복사한_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한_anon_키
```

> `.env.example` 파일을 복사해서 사용해도 됩니다.

### 5단계 — 로컬 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## Vercel에 배포하기

### 원클릭 배포 (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/handybro/as-manager-public&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20프로젝트%20URL과%20anon%20키를%20입력하세요)

버튼 클릭 → GitHub 연동 → 환경변수 입력 → Deploy

### 수동 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 연동
2. 이 저장소 선택
3. Environment Variables에 `.env.local` 내용 입력
4. **Deploy** 클릭

코드 수정 후 `git push` 하면 자동으로 재배포됩니다.

---

## 접속 주소

| 대상 | 주소 |
|---|---|
| 소비자 AS 접수 | `https://배포주소/request` |
| 직원 로그인 | `https://배포주소/login` |
| 직원 대시보드 | `https://배포주소/dashboard` |

---

## 운영 비용

| 서비스 | 무료 한도 | 비고 |
|---|---|---|
| Vercel | 월 100GB 대역폭 | 소규모 운영 시 무료로 충분 |
| Supabase | DB 500MB, 월 2GB 전송 | 수만 건 이상 쌓여도 무료 유지 가능 |
| 도메인 | — | 연 1~3만원 (선택사항) |

> 소규모 운영 기준 **완전 무료**로 운영 가능합니다.

---

## 라이선스

이 프로젝트는 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.ko) 라이선스를 따릅니다.

- ✅ 개인적인 사용 및 수정 허용
- ✅ 사용 시 출처(원작자) 표시 필수
- ❌ 수정한 결과물의 재배포 금지
- ❌ 상업적 이용 금지

© 2026 [handybro](https://github.com/handybro). All rights reserved.