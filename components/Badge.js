const STATUS_STYLES = {
  입고전:   'bg-gray-100 text-gray-600',
  진행전:   'bg-red-100 text-red-700',
  진행중:   'bg-yellow-100 text-yellow-700',
  진행완료: 'bg-green-100 text-green-700',
}

const CHANNEL_STYLES = {
  전화:       'bg-blue-50 text-blue-600',
  네이버카페: 'bg-green-50 text-green-700',
  문자:       'bg-purple-50 text-purple-600',
}

const RECEIVED_STYLES = {
  택배:     'bg-orange-50 text-orange-600',
  직접전달: 'bg-teal-50 text-teal-600',
}

export function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export function ChannelBadge({ channel }) {
  if (!channel) return null
  const cls = CHANNEL_STYLES[channel] ?? 'bg-gray-50 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {channel}
    </span>
  )
}

export function ReceivedBadge({ method }) {
  if (!method) return null
  const cls = RECEIVED_STYLES[method] ?? 'bg-gray-50 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {method}
    </span>
  )
}
