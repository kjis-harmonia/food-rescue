export function formatYen(amount: number) {
  return `¥${amount.toLocaleString('ja-JP')}`
}

export function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

/** True once the current time of day has passed `pickupEnd` ("HH:MM"). */
export function isPickupWindowExpired(pickupEnd: string) {
  const [hours, minutes] = pickupEnd.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false
  const now = new Date()
  const deadline = new Date()
  deadline.setHours(hours, minutes, 0, 0)
  return now.getTime() > deadline.getTime()
}

/** Minutes remaining until `timeStr` ("HH:MM") today, wrapping to tomorrow if already passed. */
export function minutesUntilTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const end = new Date()
  end.setHours(hours, minutes, 0, 0)
  const now = new Date()
  let diff = Math.round((end.getTime() - now.getTime()) / 60000)
  if (diff < 0) diff += 24 * 60
  return diff
}

export function formatCountdown(minutesLeft: number) {
  if (minutesLeft <= 0) return 'まもなく終了'
  if (minutesLeft < 60) return `あと${minutesLeft}分`
  return `あと${Math.round(minutesLeft / 60)}時間`
}
