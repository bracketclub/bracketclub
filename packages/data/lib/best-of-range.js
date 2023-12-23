module.exports = (bestOf) => {
  if (Array.isArray(bestOf)) {
    return bestOf.map((_, i) => i + 1)
  }

  if (bestOf === 1 || !bestOf) {
    return []
  }

  const r = []
  for (let min = Math.ceil(bestOf / 2); min <= bestOf; min++) {
    r.push(min)
  }
  return r
}
