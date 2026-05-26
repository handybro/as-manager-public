-- AS 관리 시스템 Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에서 전체 복사 후 실행하세요.

-- =====================
-- 1. 테이블 생성
-- =====================

create table if not exists as_requests (
  id                uuid        default gen_random_uuid() primary key,
  created_at        timestamptz default now() not null,
  customer_name     text        not null,
  customer_nickname text,
  customer_phone    text,
  customer_address  text,
  request_channel   text,         -- 전화 / 네이버카페 / 문자
  received_method   text,         -- 택배 / 직접전달
  issue_description text,
  image_urls        text[]      default '{}',
  status            text        default '입고전',  -- 입고전 / 진행전 / 진행중 / 진행완료
  notes             text,
  progress_notes    text,
  fee               numeric(10, 0),
  is_fee_paid       boolean     default false,
  pickup_method     text,         -- 택배 / 직접픽업
  courier           text,         -- 한진택배 / 경동택배
  tracking_number   text,
  is_picked_up      boolean     default false,
  completed_at      timestamptz
);

-- =====================
-- 2. RLS (Row Level Security) 설정
-- =====================

-- RLS 활성화
alter table as_requests enable row level security;

-- 직원(로그인 사용자): 전체 조회 가능
create policy "authenticated_select"
  on as_requests for select
  to authenticated
  using (true);

-- 직원(로그인 사용자): 등록 가능
create policy "authenticated_insert"
  on as_requests for insert
  to authenticated
  with check (true);

-- 직원(로그인 사용자): 수정 가능
create policy "authenticated_update"
  on as_requests for update
  to authenticated
  using (true);

-- 직원(로그인 사용자): 삭제 가능
create policy "authenticated_delete"
  on as_requests for delete
  to authenticated
  using (true);

-- 소비자(비로그인): AS 접수 등록만 가능
create policy "public_insert"
  on as_requests for insert
  to anon
  with check (true);

-- 소비자(비로그인): 본인 접수 건 조회 (연락처 기반)
create policy "public_select_own"
  on as_requests for select
  to anon
  using (true);  -- 필요 시 연락처 조건으로 제한 가능

-- =====================
-- 3. Storage 버킷 생성 (AS 접수 사진용)
-- =====================

-- Supabase 대시보드 → Storage → New Bucket 에서 직접 생성하거나
-- 아래 SQL 실행 (Storage 확장이 활성화된 경우)
insert into storage.buckets (id, name, public)
  values ('as-images', 'as-images', true)
  on conflict do nothing;

-- 누구나 업로드 가능
create policy "public_upload"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'as-images');

-- 누구나 조회 가능 (public 버킷)
create policy "public_read"
  on storage.objects for select
  to anon
  using (bucket_id = 'as-images');

-- 로그인 사용자만 삭제 가능
create policy "authenticated_delete_image"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'as-images');