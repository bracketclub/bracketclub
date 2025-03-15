import type { BestOf } from "./index.js"

export default (bestOf: BestOf) => {
  if (Array.isArray(bestOf)) {
    return bestOf.map((_, i) => i + 1)
  }

  if (bestOf === 1 || !bestOf) {
    return []
  }

  const r: number[] = []
  for (let min = Math.ceil(bestOf / 2); min <= bestOf; min++) {
    r.push(min)
  }
  return r
}
