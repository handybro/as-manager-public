'use client'

import Link from 'next/link'

export default function RequestLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>AS 서비스</p>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>원하시는 항목을 선택해주세요</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Link href="/request/register" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px 24px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, background: '#eff6ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>AS 등록</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>새로운 AS를 접수합니다</p>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/request/status" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px 24px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, background: '#f0fdf4', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>AS 진행사항 확인</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>접수하신 AS 진행 현황을 확인합니다</p>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

        </div>
        {/* 하단 로고 */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <img
            src="/더두칸_로고-black.png"
            alt="더두칸 로고"
            style={{ height: 60, opacity: 0.4, objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        </div>
      </div>
    </div>
  )
}