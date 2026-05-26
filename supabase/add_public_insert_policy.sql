-- =============================================
-- 소비자 AS 접수를 위한 Supabase RLS 정책 설정
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
-- =============================================
 
-- 1. as_requests 테이블에 비로그인 사용자(anon) INSERT 허용
CREATE POLICY "소비자 AS 접수 허용"
  ON as_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);
 
-- =============================================
-- 확인용: 현재 정책 목록 조회
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'as_requests';
-- =============================================
 