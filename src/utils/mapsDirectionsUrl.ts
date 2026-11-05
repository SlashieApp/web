/** A Google Maps link that opens at a point (the "Open in Maps" action). */
export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}
