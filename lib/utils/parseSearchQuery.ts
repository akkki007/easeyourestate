export function parseSearchQuery(query: string) {
  const result: any = {}

  const q = query.toLowerCase()

  // BHK detection
  const bhkMatch = q.match(/(\d+)\s*bhk/)
  if (bhkMatch) {
    result.bhk = parseInt(bhkMatch[1])
  }

  // property type
  if (q.includes("flat")) result.propertyType = "flat"
  if (q.includes("villa")) result.propertyType = "villa"
  if (q.includes("house")) result.propertyType = "house"
  if (q.includes("plot")) result.propertyType = "plot"

  // price detection
  const priceMatch = q.match(/under\s*(\d+)/)
  if (priceMatch) {
    result.maxPrice = parseInt(priceMatch[1]) * 100000
  }

  // parking
  if (q.includes("parking")) result.parking = true

  // locality detection
  const localityMatch = q.match(/in\s+([a-zA-Z\s]+)/)

  if (localityMatch) {
    result.locality = localityMatch[1].trim()
  }

  return result
}