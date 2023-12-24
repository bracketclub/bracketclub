const longestStr = (arr) => Math.max(...arr.map((a) => a.length))

const possiblePickLength = (i, max) => {
  const index = i - 1
  return index + "," + index * max
}

export default (
  { bestOf },
  {
    REGION_IDS,
    TEAMS_PER_REGION,
    BEST_OF_RANGE,
    UNPICKED_MATCH,
    FINAL_ID,
    REGION_COUNT,
  }
) => {
  const regionAlphas = REGION_IDS.join("")
  const biggestAlphaLength = longestStr(REGION_IDS)
  const biggestSeedLength = TEAMS_PER_REGION.toString().length

  const bestOfLength =
    bestOf === 1 ? 0 : Array.isArray(bestOf) ? 1 : bestOf.toString().length
  const maxRegionPickLength = biggestSeedLength + bestOfLength
  const maxFinalPickLength = biggestAlphaLength + bestOfLength
  const bestOfRangeStr = (BEST_OF_RANGE ?? []).join("")

  const possiblePicksPerRegion = possiblePickLength(
    TEAMS_PER_REGION,
    maxRegionPickLength
  )
  const possiblePicksForFinal = possiblePickLength(
    REGION_COUNT,
    maxFinalPickLength
  )

  const regionRegEx = `([${regionAlphas}]{1,${biggestAlphaLength}})([\\d${UNPICKED_MATCH}]{${possiblePicksPerRegion}})`
  const finalRegEx = `(${FINAL_ID})([${regionAlphas}${UNPICKED_MATCH}${bestOfRangeStr}]{${possiblePicksForFinal}})`

  return new RegExp(new Array(REGION_COUNT + 1).join(regionRegEx) + finalRegEx)
}
