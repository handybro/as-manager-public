'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal'

const STATUS_OPTIONS = ['입고전', '진행전', '진행중', '진행완료']
const RECEIPT_TABS   = ['전체', '미수령', '수령완료']
const METHOD_FILTERS = ['전체', '택배', '직접픽업']

function formatDate(str) {
  if (!str) return '-'
  return new Date(str).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

/* ── 진행사항 인라인 드롭다운 (as/page.js 와 동일 로직) ── */
function StatusDropdown({ record, onStatusChange }) {
  const [open, setOpen]       = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const btnRef  = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX })
    }
    setOpen(v => !v)
  }

  const handleSelect = async (newStatus) => {
    setOpen(false)
    if (newStatus === record.status) return
    const payload = { status: newStatus }
    if (newStatus === '진행완료' && !record.completed_at)
      payload.completed_at = new Date().toISOString()
    await supabase.from('as_requests').update(payload).eq('id', record.id)
    onStatusChange()
  }

  const statusColors = {
    '입고전':  'bg-gray-100 text-gray-600',
    '진행전':  'bg-red-100 text-red-700',
    '진행중':  'bg-yellow-100 text-yellow-700',
    '진행완료': 'bg-green-100 text-green-700',
  }
  const itemColors = {
    '입고전':  'text-gray-600 hover:bg-gray-50',
    '진행전':  'text-red-700 hover:bg-red-50',
    '진행중':  'text-yellow-700 hover:bg-yellow-50',
    '진행완료': 'text-green-700 hover:bg-green-50',
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${statusColors[record.status] ?? 'bg-gray-100 text-gray-600'}`}
      >
        {record.status ?? '-'} ▾
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[96px]"
        >
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${itemColors[s]} ${s === record.status ? 'font-bold' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

/* ── 송장번호 인라인 수정 셀 ── */
function TrackingCell({ record, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue]     = useState(record.tracking_number ?? '')
  const inputRef = useRef(null)

  // record가 바뀌면(fetch 후) 값 동기화
  useEffect(() => { setValue(record.tracking_number ?? '') }, [record.tracking_number])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const save = async () => {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed === (record.tracking_number ?? '')) return
    await supabase
      .from('as_requests')
      .update({ tracking_number: trimmed || null })
      .eq('id', record.id)
    onUpdate()
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={e => {
          if (e.key === 'Enter')  save()
          if (e.key === 'Escape') { setValue(record.tracking_number ?? ''); setEditing(false) }
        }}
        className="border border-blue-300 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="클릭하여 수정"
      className="text-left text-xs text-gray-600 hover:text-blue-600 hover:underline min-w-[80px]"
    >
      {record.tracking_number || <span className="text-gray-300">-</span>}
    </button>
  )
}

/* ── 수령방법 뱃지 ── */
function PickupBadge({ method }) {
  if (!method) return <span className="text-gray-300">-</span>
  const cls = method === '택배'
    ? 'bg-blue-50 text-blue-700'
    : 'bg-purple-50 text-purple-700'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {method}
    </span>
  )
}

/* ── 메인 페이지 ── */
export default function AsReceiptPage() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('미수령')   // 기본: 미수령
  const [methodFilter, setMethodFilter] = useState('전체')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('as_requests')
      .select('*')
      .order('is_picked_up', { ascending: true })
      .order('created_at',   { ascending: false })
    setRecords(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = records.filter(r => {
    const matchTab =
      tab === '전체'    ? true :
      tab === '미수령'  ? !r.is_picked_up :
      r.is_picked_up

    const matchMethod =
      methodFilter === '전체' || r.pickup_method === methodFilter

    return matchTab && matchMethod
  })

  const togglePickedUp = async (r) => {
    await supabase
      .from('as_requests')
      .update({ is_picked_up: !r.is_picked_up })
      .eq('id', r.id)
    await fetchData()
  }

  // 수정 저장 — as/page.js 의 handleUpdate 와 동일
  const handleUpdate = async (form) => {
    const payload = { ...form }
    if (form.status === '진행완료' && !form.completed_at)
      payload.completed_at = new Date().toISOString()
    const { error } = await supabase
      .from('as_requests')
      .update(payload)
      .eq('id', form.id)
    if (error) throw new Error(error.message)
    await fetchData()
  }

  return (
    <div className="space-y-4">

      {/* 상단 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">AS 수령관리</h1>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-6 flex-wrap">

        {/* 수령 여부 탭 */}
        <div className="flex gap-1">
          {RECEIPT_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 수령방법 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">수령방법</span>
          <div className="flex gap-1">
            {METHOD_FILTERS.map(m => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  methodFilter === m
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <span className="ml-auto text-xs text-gray-400">{filtered.length}건</span>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">접수일</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">고객명</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">연락처</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">진행사항</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">수령방법</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">택배사</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">주소</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                  송장번호
                  <span className="ml-1 text-gray-300 font-normal">(클릭수정)</span>
                </th>
                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">받아갔는지</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-400">
                    해당하는 건이 없습니다.
                  </td>
                </tr>
              )}
              {!loading && filtered.map(r => (
                <tr
                  key={r.id}
                  style={{ opacity: r.is_picked_up ? 0.4 : 1, transition: 'opacity 0.3s' }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-800">{r.customer_name}</span>
                    {r.customer_nickname && (
                      <span className="ml-1 text-xs text-gray-400">({r.customer_nickname})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {r.customer_phone || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusDropdown record={r} onStatusChange={fetchData} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PickupBadge method={r.pickup_method} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {r.courier || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                    <span className="truncate block" title={r.customer_address}>
                      {r.customer_address || <span className="text-gray-300">-</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TrackingCell record={r} onUpdate={fetchData} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.is_picked_up}
                      onChange={() => togglePickedUp(r)}
                      title="수령 완료 처리"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => { setEditTarget(r); setModalOpen(true) }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수정 모달 — 기존 Modal 그대로 재사용 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleUpdate}
        initialData={editTarget}
      />
    </div>
  )
}