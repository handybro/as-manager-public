'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function formatKoreanDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`
}

const EMPTY_FORM = {
  customer_name: '',
  customer_nickname: '',
  customer_phone: '',
  received_method: '',
  issue_description: '',
  pickup_method: '',
  customer_address: '',
  visit_date: '',
  visit_time: '',
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    padding: '48px 20px 80px',
  },
  container: {
    maxWidth: 520,
    margin: '0 auto',
  },
  backRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 8,
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  },
  subheading: {
    fontSize: 13,
    color: '#9ca3af',
    margin: '4px 0 0',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    padding: '28px 28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: 8,
    marginBottom: -4,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#4b5563',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
    marginLeft: 2,
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#1f2937',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#1f2937',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'auto',
  },
  textarea: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#1f2937',
    background: '#fff',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: 1.6,
  },
  dateTrigger: {
    position: 'relative',
    cursor: 'pointer',
  },
  dateDisplay: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '10px 40px 10px 14px',
    fontSize: 14,
    background: '#fff',
    boxSizing: 'border-box',
    cursor: 'pointer',
    userSelect: 'none',
  },
  calIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  hiddenDate: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    fontFamily: 'inherit',
  },
  submitBtnDisabled: {
    background: '#93c5fd',
    cursor: 'not-allowed',
  },
  errorMsg: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: '#ef4444',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
  },
}

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const dateInputRef = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handlePhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 7) formatted = `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
    else if (digits.length > 3) formatted = `${digits.slice(0,3)}-${digits.slice(3)}`
    set('customer_phone', formatted)
  }

  const handleSubmit = async () => {
    if (!form.customer_name.trim()) { setError('성함은 필수 입력 항목입니다.'); return }
    if (!form.customer_phone.trim()) { setError('연락처는 필수 입력 항목입니다.'); return }
    if (!form.received_method) { setError('AS 물건 전달주실 경로를 선택해주세요.'); return }
    if (!form.issue_description.trim()) { setError('AS 내용은 필수 입력 항목입니다.'); return }
    if (!form.pickup_method) { setError('수령 방법을 선택해주세요.'); return }
    if (!form.customer_address) { setError('주소는 필수 입력 항목입니다.'); return }
    if (form.pickup_method === '직접픽업') {
      if (!form.visit_date) { setError('방문 예정 날짜를 선택해주세요.'); return }
      if (!form.visit_time) { setError('방문 예정 시간을 선택해주세요.'); return }
    }
    setSubmitting(true)
    setError('')

    let notes = null
    if (form.pickup_method === '직접픽업' && form.visit_date && form.visit_time) {
      notes = `방문 예정일시: ${formatKoreanDate(form.visit_date)} ${form.visit_time}`
    }

    try {
      const { error: dbError } = await supabase.from('as_requests').insert({
        customer_name: form.customer_name.trim(),
        customer_nickname: form.customer_nickname.trim() || null,
        customer_phone: form.customer_phone.trim() || null,
        received_method: form.received_method || null,
        issue_description: form.issue_description.trim() || null,
        pickup_method: form.pickup_method || null,
        customer_address: form.customer_address.trim() || null,
        notes,
        status: '입고전',
        request_channel: '고객직접접수',
      })
      if (dbError) throw dbError
      setDone(true)
    } catch (e) {
      setError(e.message ?? '접수 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: '48px 36px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>AS 접수가 완료되었습니다</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 32px', lineHeight: 1.6 }}>담당자 확인 후 입력하신 연락처로 안내드리겠습니다.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => { setForm(EMPTY_FORM); setDone(false) }}
              style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              추가 접수하기
            </button>
            <Link href="/request/status" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '12px', background: '#fff', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                진행사항 확인하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
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
            <p style={S.heading}>AS 등록</p>
            <p style={S.subheading}>아래 양식을 작성해주세요</p>
          </div>
        </div>

        {/* 폼 카드 */}
        <div style={S.card}>

          {/* 고객 정보 */}
          <p style={S.sectionLabel}>고객 정보</p>

          <div>
            <label style={S.fieldLabel}>성함 <span style={S.required}>*</span></label>
            <input style={S.input} value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="홍길동" />
          </div>

          <div>
            <label style={S.fieldLabel}>카페 닉네임</label>
            <input style={S.input} value={form.customer_nickname} onChange={e => set('customer_nickname', e.target.value)} placeholder="닉네임 (선택)" />
          </div>

          <div>
            <label style={S.fieldLabel}>연락처 <span style={S.required}>*</span></label>
            <input style={S.input} value={form.customer_phone} onChange={e => handlePhone(e.target.value)} placeholder="010-0000-0000" />
          </div>

          {/* 접수 정보 */}
          <p style={S.sectionLabel}>접수 정보</p>

          <div>
            <label style={S.fieldLabel}>AS 물건 전달주실 경로 <span style={S.required}>*</span></label>
            <select style={S.select} value={form.received_method} onChange={e => set('received_method', e.target.value)}>
              <option value="">선택해주세요</option>
              <option value="택배">택배</option>
              <option value="직접전달">직접 전달</option>
            </select>
          </div>

          <div>
            <label style={S.fieldLabel}>AS 내용 <span style={S.required}>*</span></label>
            <textarea style={S.textarea} rows={4} value={form.issue_description}
              onChange={e => set('issue_description', e.target.value)}
              placeholder="증상 및 요청사항을 자세히 입력해주세요" />
          </div>

          {/* 수령 방법 */}
          <p style={S.sectionLabel}>수령 방법</p>

          <div>
            <label style={S.fieldLabel}>수령 방법 <span style={S.required}>*</span></label>
            <select style={S.select} value={form.pickup_method} onChange={e => set('pickup_method', e.target.value)}>
              <option value="">선택해주세요</option>
              <option value="택배">택배</option>
              <option value="직접픽업">직접 방문</option>
            </select>
          </div>

          {/* 택배 → 주소 */}
          {form.pickup_method === '택배' && (
            <div>
              <label style={S.fieldLabel}>배송 주소 <span style={S.required}>*</span></label>
              <input style={S.input} value={form.customer_address}
                onChange={e => set('customer_address', e.target.value)}
                placeholder="수령하실 주소를 입력해주세요" />
            </div>
          )}

          {/* 직접 방문 → 날짜 + 시간 */}
          {form.pickup_method === '직접픽업' && (
            <>
              <div>
                <label style={S.fieldLabel}>방문 예정 날짜 <span style={S.required}>*</span></label>
                <div style={S.dateTrigger} onClick={() => dateInputRef.current?.showPicker()}>
                  <div style={{ ...S.dateDisplay, color: form.visit_date ? '#1f2937' : '#9ca3af' }}>
                    {form.visit_date ? formatKoreanDate(form.visit_date) : '날짜를 선택해주세요'}
                  </div>
                  <span style={S.calIcon}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input ref={dateInputRef} type="date" value={form.visit_date}
                    onChange={e => set('visit_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={S.hiddenDate} />
                </div>
              </div>

              <div>
                <label style={S.fieldLabel}>방문 예정 시간 <span style={S.required}>*</span></label>
                <select style={S.select} value={form.visit_time} onChange={e => set('visit_time', e.target.value)}>
                  <option value="">시간을 선택해주세요</option>
                  {['13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}

        </div>

        {/* 에러 */}
        {error && <p style={S.errorMsg}>{error}</p>}

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ ...S.submitBtn, ...(submitting ? S.submitBtnDisabled : {}) }}
        >
          {submitting ? '접수 중...' : 'AS 접수하기'}
        </button>

        <p style={S.hint}>접수 후 연락처로 안내 연락을 드립니다.</p>

      </div>
    </div>
  )
}