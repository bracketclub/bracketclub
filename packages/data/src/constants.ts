import type { BracketInputData } from "./index.ts"
import bestOfRange from "./best-of-range.ts"

const finalId = "Z"
const unpickedMatch = "X"

export default (bracketData: BracketInputData) => {
  const { bestOf, regions, order } = bracketData

  const regionIds = new Array(regions)
    .fill(0)
    .map((_, i) => String.fromCharCode(65 + i))

  const allIds = regionIds.concat(finalId)

  return {
    BEST_OF: bestOf,
    BEST_OF_RANGE: bestOfRange(bestOf),
    REGION_COUNT: regions,
    REGION_IDS: regionIds,
    FINAL_ID: finalId,
    ALL_IDS: allIds,
    UNPICKED_MATCH: unpickedMatch,
    TEAMS_PER_REGION: order.length,
    ORDER: order,
    EMPTY:
      allIds.join(unpickedMatch.repeat(order.length - 1)) +
      unpickedMatch.repeat(regions - 1),
  }
}
