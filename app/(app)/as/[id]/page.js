'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { StatusBadge, ChannelBadge, ReceivedBadge } from '@/components/Badge'
import Modal from '@/components/Modal'

function formatDate(str) {
  if (!str) return '-'
  return new Date(str).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatFee(fee) {
  if (fee == null || fee === '') return '-'
  return Number(fee).toLocaleString('ko-KR') + '원'
}

function InfoRow({ label, value, children }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 flex-1">{children ?? value ?? '-'}</span>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function AsDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const [record, setRecord]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchRecord = async () => {
    const { data } = await supabase.from('as_requests').select('*').eq('id', id).single()
    setRecord(data)
    setLoading(false)
  }

  useEffect(() => { fetchRecord() }, [id])

  const handleUpdate = async (form) => {
    const payload = { ...form }
    if (form.status === '진행완료' && !record.completed_at) {
      payload.completed_at = new Date().toISOString()
    }
    const { error } = await supabase.from('as_requests').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
    await fetchRecord()
  }

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('as_requests').delete().eq('id', id)
    router.push('/as')
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">불러오는 중...</div>
  }

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">AS 건을 찾을 수 없습니다.</p>
        <Link href="/as" className="text-blue-600 hover:underline text-sm">목록으로</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/as" className="text-gray-400 hover:text-gray-600 text-sm">← 목록</Link>
          <h1 className="text-xl font-bold text-gray-800">{record.customer_name}</h1>
          {record.customer_nickname && (
            <span className="text-sm text-gray-400">({record.customer_nickname})</span>
          )}
          <StatusBadge status={record.status} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 고객 정보 */}
        <Card title="고객 정보">
          <InfoRow label="성함">{record.customer_name}</InfoRow>
          <InfoRow label="닉네임">{record.customer_nickname || '-'}</InfoRow>
          <InfoRow label="연락처">{record.customer_phone || '-'}</InfoRow>
          <InfoRow label="주소">{record.customer_address || '-'}</InfoRow>
        </Card>

        {/* 접수 정보 */}
        <Card title="접수 정보">
          <InfoRow label="신청경로">
            <ChannelBadge channel={record.request_channel} /> {!record.request_channel && '-'}
          </InfoRow>
          <InfoRow label="전달경로">
            <ReceivedBadge method={record.received_method} /> {!record.received_method && '-'}
          </InfoRow>
          <InfoRow label="접수일">{formatDate(record.created_at)}</InfoRow>
          <InfoRow label="완료일">{formatDate(record.completed_at)}</InfoRow>
        </Card>

        {/* AS 내용 */}
        <div className="col-span-2">
          <Card title="AS 내용">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {record.issue_description || '내용 없음'}
            </p>
          </Card>
        </div>

        {/* 진행 현황 */}
        <Card title="진행 현황">
          <InfoRow label="진행사항"><StatusBadge status={record.status} /></InfoRow>
          <InfoRow label="요금">{formatFee(record.fee)}</InfoRow>
          <InfoRow label="비고">{record.notes || '-'}</InfoRow>
          <InfoRow label="진행 비고">{record.progress_notes || '-'}</InfoRow>
        </Card>

        {/* 발송/수령 */}
        <Card title="발송 / 수령">
          <InfoRow label="수령방법">{record.pickup_method || '-'}</InfoRow>
          <InfoRow label="택배사">{record.courier || '-'}</InfoRow>
          <InfoRow label="송장번호">{record.tracking_number || '-'}</InfoRow>
          <InfoRow label="수령 완료">
            {record.is_picked_up
              ? <span className="text-green-600 font-medium text-sm">✓ 수령 완료</span>
              : <span className="text-gray-400 text-sm">미수령</span>
            }
          </InfoRow>
        </Card>
      </div>

      {/* 수정 모달 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleUpdate}
        initialData={record}
      />

      {/* 삭제 확인 */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
            <p className="text-base font-semibold text-gray-800 mb-2">정말 삭제하시겠어요?</p>
            <p className="text-sm text-gray-500 mb-5">삭제된 데이터는 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:bg-red-300"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
