export function calculateDistance(userLat, userLng, venueLat, venueLng) {
  const lat1 = Number(userLat)
  const lng1 = Number(userLng)
  const lat2 = Number(venueLat)
  const lng2 = Number(venueLng)

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null

  const earthRadiusKm = 6371
  const toRadians = degrees => degrees * (Math.PI / 180)
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(earthRadiusKm * c * 10) / 10
}
