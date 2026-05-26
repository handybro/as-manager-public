-- AS 관리 앱 스키마
-- as_requests 테이블 생성

create table if not exists as_requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),

  -- 고객 정보
  customer_name    text not null,
  customer_nickname text,
  customer_phone   text,
  customer_address text,

  -- 접수 정보
  request_channel  text,          -- 전화 | 네이버카페 | 문자
  received_method  text,          -- 택배 | 직접전달

  -- AS 내용
  issue_description text,

  -- 진행 상태
  status           text not null default '입고전',  -- 입고전 | 진행전 | 진행중 | 진행완료
  notes            text,          -- 비고
  progress_notes   text,          -- 진행 비고
  fee              numeric(10, 0),

  -- 수령/배송
  pickup_method    text,          -- 택배 | 직접픽업
  courier          text,          -- 택배사
  tracking_number  text,
  is_picked_up     boolean not null default false,

  -- 완료 처리
  completed_at     timestamptz
);

-- RLS 활성화
alter table as_requests enable row level security;

-- 개발용 전체 허용 정책 (운영 시 인증 기반으로 변경)
create policy "allow all" on as_requests for all using (true);

-- 인덱스
create index if not exists idx_as_requests_status      on as_requests (status);
create index if not exists idx_as_requests_is_picked_up on as_requests (is_picked_up);
create index if not exists idx_as_requests_created_at  on as_requests (created_at desc);
