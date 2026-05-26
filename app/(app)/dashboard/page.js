import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { StatusBadge } from '@/components/Badge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function formatDate(str) {
  if (!str) return '-'
  return new Date(str).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

export default async function DashboardPage() {
  const { data: all } = await supabase.from('as_requests').select('status, is_picked_up')
  const { data: recent } = await supabase
    .from('as_requests')
    .select('id, created_at, customer_name, customer_nickname, product_name, issue_description, status')
    .order('created_at', { ascending: false })
    .limit(10)

  const total    = all?.length ?? 0
  const pending  = all?.filter(r => ['입고전','진행전'].includes(r.status)).length ?? 0
  const inProgress = all?.filter(r => r.status === '진행중').length ?? 0
  const done     = all?.filter(r => r.status === '진행완료').length ?? 0

  const CARDS = [
    { label: '전체',   value: total,      color: 'bg-white',           text: 'text-gray-800' },
    { label: '대기',   value: pending,    color: 'bg-red-50',          text: 'text-red-700'  },
    { label: '진행중', value: inProgress, color: 'bg-yellow-50',       text: 'text-yellow-700' },
    { label: '완료',   value: done,       color: 'bg-green-50',        text: 'text-green-700' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {CARDS.map(({ label, value, color, text }) => (
          <div key={label} className={`${color} rounded-xl shadow-sm p-5`}>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* 최근 10건 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">최근 접수 10건</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                {['접수일','고객명','AS내용','상태',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(recent ?? []).map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {r.customer_name}
                    {r.customer_nickname && <span className="ml-1 text-xs text-gray-400">({r.customer_nickname})</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.issue_description ?? '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/as/${r.id}`} className="text-blue-600 hover:underline text-xs">상세</Link>
                  </td>
                </tr>
              ))}
              {(!recent || recent.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">접수된 AS 건이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
