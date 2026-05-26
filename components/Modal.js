'use client'

import { useState, useEffect } from 'react'

const EMPTY_FORM = {
  customer_name:    '',
  customer_nickname:'',
  customer_phone:   '',
  customer_address: '',
  request_channel:  '',
  received_method:  '',
  issue_description:'',
  status:           '입고전',
  notes:            '',
  progress_notes:   '',
  fee:              '',
  is_fee_paid:      false,   // ← 추가
  pickup_method:    '',
  courier:          '',
  tracking_number:  '',
  is_picked_up:     false,
}

function SectionTitle({ children }) {
  return (
    <div className="col-span-2 border-b border-gray-100 pb-1 mt-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{children}</p>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
const selectCls = inputCls
const textareaCls = `${inputCls} resize-none`

export default function Modal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initialData?.id

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        ...EMPTY_FORM,
        ...initialData,
        fee: initialData.fee ?? '',
      } : EMPTY_FORM)
      setError('')
    }
  }, [open, initialData])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handlePhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 7) formatted = `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
    else if (digits.length > 3) formatted = `${digits.slice(0,3)}-${digits.slice(3)}`
    set('customer_phone', formatted)
  }

  const handleSave = async () => {
    if (!form.customer_name.trim()) { setError('고객성함은 필수입니다.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({
        ...form,
        fee: form.fee === '' ? null : Number(form.fee),
      })
      onClose()
    } catch (e) {
      setError(e.message ?? '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">{isEdit ? 'AS 수정' : 'AS 등록'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* 바디 */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* ── 고객 정보 ── */}
            <SectionTitle>고객 정보</SectionTitle>

            <Field label="고객성함" required>
              <input className={inputCls} value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)} placeholder="홍길동" />
            </Field>

            <Field label="고객닉네임">
              <input className={inputCls} value={form.customer_nickname}
                onChange={e => set('customer_nickname', e.target.value)} placeholder="닉네임" />
            </Field>

            <Field label="연락처">
              <input className={inputCls} value={form.customer_phone}
                onChange={e => handlePhone(e.target.value)} placeholder="010-0000-0000" />
            </Field>

            {/* ── 접수 정보 ── */}
            <SectionTitle>접수 정보</SectionTitle>

            <Field label="AS 신청경로">
              <select className={selectCls} value={form.request_channel}
                onChange={e => set('request_channel', e.target.value)}>
                <option value="">선택</option>
                <option>전화</option>
                <option>네이버카페</option>
                <option>문자</option>
              </select>
            </Field>

            <Field label="전달받은 경로">
              <select className={selectCls} value={form.received_method}
                onChange={e => set('received_method', e.target.value)}>
                <option value="">선택</option>
                <option>택배</option>
                <option>직접전달</option>
              </select>
            </Field>

            <div className="col-span-2">
              <Field label="AS 내용">
                <textarea className={textareaCls} rows={3} value={form.issue_description}
                  onChange={e => set('issue_description', e.target.value)}
                  placeholder="증상 및 요청사항을 입력하세요" />
              </Field>
            </div>

            {/* ── 진행 현황 ── */}
            <SectionTitle>진행 현황</SectionTitle>

            <Field label="진행사항">
              <select className={selectCls} value={form.status}
                onChange={e => set('status', e.target.value)}>
                <option>입고전</option>
                <option>진행전</option>
                <option>진행중</option>
                <option>진행완료</option>
              </select>
            </Field>

            {/* 요금 + 납부 여부를 하나의 칸에 */}
            <Field label="요금 (원)">
              <div className="flex items-center gap-3">
                <input
                  className={inputCls}
                  type="number"
                  value={form.fee}
                  onChange={e => set('fee', e.target.value)}
                  placeholder="0"
                />
                <label className="flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_fee_paid}
                    onChange={e => set('is_fee_paid', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${form.is_fee_paid ? 'text-blue-600' : 'text-gray-400'}`}>
                    납부완료
                  </span>
                </label>
              </div>
            </Field>

            <div className="col-span-2">
              <Field label="비고">
                <textarea className={textareaCls} rows={2} value={form.notes}
                  onChange={e => set('notes', e.target.value)} placeholder="일반 비고" />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="진행 비고">
                <textarea className={textareaCls} rows={2} value={form.progress_notes}
                  onChange={e => set('progress_notes', e.target.value)} placeholder="진행 관련 메모" />
              </Field>
            </div>

            {/* ── 발송 / 수령 ── */}
            <SectionTitle>발송 / 수령</SectionTitle>

            <Field label="수령방법">
              <select className={selectCls} value={form.pickup_method}
                onChange={e => set('pickup_method', e.target.value)}>
                <option value="">선택</option>
                <option>택배</option>
                <option>직접픽업</option>
              </select>
            </Field>

            <Field label="택배사">
              <select className={selectCls} value={form.courier}
                onChange={e => set('courier', e.target.value)}>
                <option value="">선택</option>
                <option>한진택배</option>
                <option>경동택배</option>
              </select>
            </Field>

            <div className="col-span-2">
              <Field label="주소">
                <input className={inputCls} value={form.customer_address}
                  onChange={e => set('customer_address', e.target.value)} placeholder="배송 주소" />
              </Field>
            </div>

            <Field label="송장번호">
              <input className={inputCls} value={form.tracking_number}
                onChange={e => set('tracking_number', e.target.value)} placeholder="1234567890" />
            </Field>

            <Field label="받아갔는지">
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="is_picked_up"
                  type="checkbox"
                  checked={form.is_picked_up}
                  onChange={e => set('is_picked_up', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_picked_up" className="text-sm text-gray-600">수령 완료</label>
              </div>
            </Field>

          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50 rounded-b-2xl">
          {error ? <p className="text-sm text-red-500">{error}</p> : <div />}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg bg-white transition-colors">
              취소
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors">
              {saving ? '저장 중...' : (isEdit ? '수정 완료' : '등록')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}