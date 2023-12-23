const getBestOfRange = require("./best-of-range")

module.exports = ({ bestOf, finalRegion, regions, order }) => {
  const regionIds = regions.map((r) => r.id)

  const finalId = finalRegion.id
  const finalName = finalRegion.name
  const finalFullname = finalRegion.fullname
  const championshipName = finalRegion.championshipName
  const allIds = regionIds.concat(finalId)
  const teamsPerRegion = order.length
  const unpickedMatch = "X"

  const constants = {
    BEST_OF: bestOf,
    REGION_COUNT: regionIds.length,
    REGION_IDS: regionIds,
    FINAL_ID: finalId,
    ALL_IDS: allIds,
    EMPTY:
      allIds.join(new Array(teamsPerRegion).join(unpickedMatch)) +
      new Array(regionIds.length).join(unpickedMatch),
    FINAL_NAME: finalName,
    FINAL_FULLNAME: finalFullname || finalName,
    FINAL_CHAMPIONSHIP_NAME: championshipName,
    UNPICKED_MATCH: unpickedMatch,
    TEAMS_PER_REGION: teamsPerRegion,
    ORDER: order,
  }

  const bestOfRange = getBestOfRange(bestOf)
  if (bestOfRange.length) {
    constants.BEST_OF_RANGE = bestOfRange
  }

  return constants
}
