'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { StatusBadge, ChannelBadge } from '@/components/Badge'
import Modal from '@/components/Modal'

const STATUS_TABS = ['전체', '입고전', '진행전', '진행중', '진행완료']
const STATUS_OPTIONS = ['입고전', '진행전', '진행중', '진행완료']

function formatDate(str) {
  if (!str) return '-'
  return new Date(str).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

function formatPhone(str) {
  if (!str) return '-'
  return str
}

function formatFee(fee) {
  if (fee == null || fee === '') return '-'
  return Number(fee).toLocaleString('ko-KR') + '원'
}

// 진행사항 인라인 드롭다운 컴포넌트
function StatusDropdown({ record, onStatusChange }) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
    setOpen(v => !v)
  }

  const handleSelect = async (newStatus) => {
    setOpen(false)
    if (newStatus === record.status) return
    const payload = { status: newStatus }
    if (newStatus === '진행완료' && !record.completed_at) {
      payload.completed_at = new Date().toISOString()
    }
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

export default function AsListPage() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('전체')
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [popupDesc, setPopupDesc]   = useState(null) // AS내용 팝업

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('as_requests')
      .select('*')
      .order('is_picked_up', { ascending: true })
      .order('created_at', { ascending: false })
    setRecords(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = records.filter(r => {
    const matchTab = tab === '전체' || r.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.customer_name?.toLowerCase().includes(q)
      || r.customer_nickname?.toLowerCase().includes(q)
      || r.issue_description?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const handleCreate = async (form) => {
    const { error } = await supabase.from('as_requests').insert([form])
    if (error) throw new Error(error.message)
    await fetchData()
  }

  const handleUpdate = async (form) => {
    const payload = { ...form }
    if (form.status === '진행완료' && !form.completed_at) {
      payload.completed_at = new Date().toISOString()
    }
    const { error } = await supabase.from('as_requests').update(payload).eq('id', form.id)
    if (error) throw new Error(error.message)
    await fetchData()
  }

  const handleDelete = async (id) => {
    await supabase.from('as_requests').delete().eq('id', id)
    setDeleteId(null)
    await fetchData()
  }

  const togglePickedUp = async (r) => {
    await supabase.from('as_requests').update({ is_picked_up: !r.is_picked_up }).eq('id', r.id)
    await fetchData()
  }

  return (
    <div className="space-y-4">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">AS 목록</h1>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true) }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + AS 등록
        </button>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {STATUS_TABS.map(t => (
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
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="고객명·닉네임·AS내용 검색"
          className="ml-auto w-56 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">신청경로</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">AS 내용</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">진행사항</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">요금</th>
                <th className="px-4 py-3 text-center font-medium whitespace-nowrap">수령</th>
                <th className="px-4 py-3 text-left font-medium whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">불러오는 중...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">AS 건이 없습니다.</td>
                </tr>
              )}
              {!loading && filtered.map(r => (
                <tr
                  key={r.id}
                  className={`hover:bg-gray-50 transition-colors ${r.is_picked_up ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-800">{r.customer_name}</span>
                    {r.customer_nickname && (
                      <span className="ml-1 text-xs text-gray-400">({r.customer_nickname})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatPhone(r.customer_phone)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ChannelBadge channel={r.request_channel} />
                  </td>

                  {/* ① AS 내용 — 클릭 시 팝업 */}
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {r.issue_description ? (
                      <button
                        onClick={() => setPopupDesc(r.issue_description)}
                        className="truncate block max-w-[320px] text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                        title="클릭하면 전체 내용 보기"
                      >
                        {r.issue_description}
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* ② 진행사항 — 인라인 드롭다운 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusDropdown record={r} onStatusChange={fetchData} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.fee > 0 && !r.is_fee_paid ? (
                      <button
                        onClick={async () => {
                          await supabase
                            .from('as_requests')
                            .update({ is_fee_paid: true })
                            .eq('id', r.id)
                          fetchData()
                        }}
                        title="클릭하면 납부완료 처리"
                        className="text-red-500 font-medium hover:text-red-700 hover:underline transition-colors cursor-pointer"
                      >
                        {formatFee(r.fee)}
                      </button>
                    ) : (
                      <span className="text-gray-700">{formatFee(r.fee)}</span>
                    )}
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
                    <div className="flex items-center gap-2">
                      <Link href={`/as/${r.id}`} className="text-xs text-blue-600 hover:underline">상세</Link>
                      <button
                        onClick={() => { setEditTarget(r); setModalOpen(true) }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 총 건수 */}
      <p className="text-xs text-gray-400 text-right">
        총 {filtered.length}건 (전체 {records.length}건)
      </p>

      {/* 등록/수정 모달 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={editTarget ? handleUpdate : handleCreate}
        initialData={editTarget}
      />

      {/* ① AS 내용 전체 보기 팝업 */}
      {popupDesc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setPopupDesc(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-gray-700 mb-3">AS 내용</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{popupDesc}</p>
            <button
              onClick={() => setPopupDesc(null)}
              className="mt-5 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
            <p className="text-base font-semibold text-gray-800 mb-2">정말 삭제하시겠어요?</p>
            <p className="text-sm text-gray-500 mb-5">삭제된 데이터는 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}