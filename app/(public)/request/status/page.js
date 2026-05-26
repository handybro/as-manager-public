'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const STATUS_STYLE = {
  '입고전':  { background: '#f3f4f6', color: '#4b5563' },
  '진행전':  { background: '#fee2e2', color: '#b91c1c' },
  '진행중':  { background: '#fef9c3', color: '#a16207' },
  '진행완료':{ background: '#dcfce7', color: '#15803d' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { background: '#f3f4f6', color: '#4b5563' }
  return (
    <span style={{ ...s, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  )
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

function formatFee(fee) {
  if (!fee) return null
  return Number(fee).toLocaleString('ko-KR') + '원'
}

const S = {
  page: { minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 80px' },
  container: { maxWidth: 520, width: '100%' },
  backRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8, color: '#9ca3af', display: 'flex', alignItems: 'center' },
  heading: { fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 },
  subheading: { fontSize: 13, color: '#9ca3af', margin: '4px 0 0' },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 16 },
  fieldLabel: { display: 'block', fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 6 },
  input: { width: '100%', border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#1f2937', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  searchBtn: { width: '100%', padding: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  searchBtnDisabled: { background: '#86efac', cursor: 'not-allowed' },
  errorMsg: { fontSize: 13, color: '#ef4444', margin: 0 },
  resultsMeta: { fontSize: 12, color: '#9ca3af', margin: '20px 0 8px' },
  resultCard: { background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', marginBottom: 10 },
  resultHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  resultDate: { fontSize: 12, color: '#9ca3af' },
  resultContent: { fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  divider: { borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  metaRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  metaKey: { fontSize: 12, color: '#9ca3af', flexShrink: 0 },
  metaVal: { fontSize: 12, color: '#374151', textAlign: 'right' },
  pickupBanner: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  emptyCard: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '48px 24px', textAlign: 'center', marginTop: 20 },
}

export default function StatusPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const handlePhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 7) formatted = `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
    else if (digits.length > 3) formatted = `${digits.slice(0,3)}-${digits.slice(3)}`
    setPhone(formatted)
  }

  const handleSearch = async () => {
    if (!name.trim() || !phone.trim()) { setError('성함과 연락처를 모두 입력해주세요.'); return }
    setLoading(true)
    setError('')
    setSearched(false)
    try {
      const { data, error: dbError } = await supabase
        .from('as_requests')
        .select('id, created_at, status, issue_description, pickup_method, completed_at, notes, fee, is_fee_paid, tracking_number, is_picked_up')
        .eq('customer_name', name.trim())
        .eq('customer_phone', phone.trim())
        .order('created_at', { ascending: false })
      if (dbError) throw dbError
      setResults(data ?? [])
      setSearched(true)
    } catch (e) {
      setError('조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* 헤더 */}
        <div style={S.backRow}>
          <Link href="/request">
            <button style={S.backBtn}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <div>
            <p style={S.heading}>AS 진행사항 확인</p>
            <p style={S.subheading}>접수 시 입력하신 정보로 조회해주세요</p>
          </div>
        </div>

        {/* 검색 카드 */}
        <div style={S.card}>
          <div>
            <label style={S.fieldLabel}>성함</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)}
              placeholder="홍길동" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <div>
            <label style={S.fieldLabel}>연락처</label>
            <input style={S.input} value={phone} onChange={e => handlePhone(e.target.value)}
              placeholder="010-0000-0000" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          {error && <p style={S.errorMsg}>{error}</p>}
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ ...S.searchBtn, ...(loading ? S.searchBtnDisabled : {}) }}
          >
            {loading ? '조회 중...' : '진행사항 확인하기'}
          </button>
        </div>

        {/* 결과 없음 */}
        {searched && results.length === 0 && (
          <div style={S.emptyCard}>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px' }}>접수 내역이 없습니다.</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>성함과 연락처를 다시 확인해주세요.</p>
          </div>
        )}

        {/* 결과 목록 */}
        {searched && results.length > 0 && (
          <>
            <p style={S.resultsMeta}>총 {results.length}건의 접수 내역</p>
            {results.map(item => {
              const hasFee = item.fee && Number(item.fee) > 0
              const isPaid = item.is_fee_paid

              return (
                <div key={item.id} style={S.resultCard}>
                  {/* 상단: 날짜 + 상태 */}
                  <div style={S.resultHeader}>
                    <span style={S.resultDate}>{formatDate(item.created_at)} 접수</span>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* AS 내용 */}
                  {item.issue_description && (
                    <p style={S.resultContent}>{item.issue_description}</p>
                  )}

                  {/* 수령 완료 배너 */}
                  {item.is_picked_up && (
                    <div style={S.pickupBanner}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>제품 수령이 완료되었습니다</span>
                    </div>
                  )}

                  {/* 상세 정보 */}
                  <div style={S.divider}>

                    {/* 수령 방법 */}
                    {item.pickup_method && (
                      <div style={S.metaRow}>
                        <span style={S.metaKey}>수령 방법</span>
                        <span style={S.metaVal}>{item.pickup_method === '직접픽업' ? '직접 방문' : item.pickup_method}</span>
                      </div>
                    )}

                    {/* 방문 예정일시 */}
                    {item.notes?.startsWith('방문 예정일시') && (
                      <div style={S.metaRow}>
                        <span style={S.metaKey}>방문 예정</span>
                        <span style={S.metaVal}>{item.notes.replace('방문 예정일시: ', '')}</span>
                      </div>
                    )}

                    {/* 송장번호 */}
                    {item.tracking_number && (
                      <div style={S.metaRow}>
                        <span style={S.metaKey}>송장번호</span>
                        <span style={{ ...S.metaVal, fontWeight: 600, color: '#2563eb' }}>{item.tracking_number}</span>
                      </div>
                    )}

                    {/* 완료일 */}
                    {item.status === '진행완료' && item.completed_at && (
                      <div style={S.metaRow}>
                        <span style={S.metaKey}>완료일</span>
                        <span style={S.metaVal}>{formatDate(item.completed_at)}</span>
                      </div>
                    )}

                    {/* 요금 */}
                    <div style={S.metaRow}>
                      <span style={S.metaKey}>AS 요금</span>
                      {!hasFee ? (
                        <span style={{ ...S.metaVal, color: '#9ca3af' }}>-</span>
                      ) : isPaid ? (
                        <span style={{ ...S.metaVal, color: '#9ca3af', textDecoration: 'line-through' }}>
                          {formatFee(item.fee)} (납부완료)
                        </span>
                      ) : (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ ...S.metaVal, color: '#dc2626', fontWeight: 700 }}>{formatFee(item.fee)}</span>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                            우리은행 405-08-000756
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )
            })}
          </>
        )}

      </div>
    </div>
  )
}