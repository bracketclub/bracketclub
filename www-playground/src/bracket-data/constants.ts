import type { BracketInputData } from "./index.ts"
import bestOfRange from "./best-of-range.ts"

const finalId = "Z"
const possibleRegions = ["A", "B", "C", "D", "E", "F", "G", "H"]
const unpickedMatch = "_"

export default (bracketData: BracketInputData) => {
  const { bestOf, regions, order } = bracketData

  const regionIds = possibleRegions.slice(0, regions)

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
