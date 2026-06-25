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
