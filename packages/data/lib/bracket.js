module.exports = ({ regions, finalRegion }, dataByRegion = {}) => {
  const result = {
    regions: {
      [finalRegion.id]: finalRegion,
    },
  }

  for (const [indexStr, region] of Object.entries(regions)) {
    const index = parseInt(indexStr, 10)
    result.regions[region.id] = {
      ...region,
      sameSideAs: index % 2 ? regions[index - 1].id : regions[index + 1].id,
      ...dataByRegion[region.id],
    }
  }

  return result
}
