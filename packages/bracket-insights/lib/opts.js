const fs = require("fs")
const path = require("path")

const getAllYears = (sport) => {
  const years = fs.readdirSync(
    path.resolve(__dirname, `../node_modules/bracket-data/data/${sport}/`)
  )
  return years
    .map((p) => path.basename(p, ".json"))
    .filter((p) => p !== "defaults")
}

const argv = require("yargs")
  .string("year")
  .string("sport")
  .default("year", new Date().getFullYear().toString())
  .default("sport", "ncaam")
  .array("years")
  .array("sports")
  .array("events").argv

const has = (val) => Array.isArray(val) && val.length

const combine = (sports, years) =>
  sports.reduce((acc, sport) => {
    acc.push(...years.map((year) => ({ sport, year })))
    return acc
  }, [])

module.exports = () => {
  let { events, sports, years, sport, year } = argv

  if (has(events)) {
    return events.map((event) => ({
      sport: event.split("-")[0],
      year: event.split("-")[1],
    }))
  }

  if (year === "all") {
    return combine([sport], getAllYears(sport))
  }

  if (has(sports) && has(years)) return combine(sports, years)
  if (has(sports)) return combine(sports, [year])
  if (has(years)) return combine([sport], years)
  return combine([sport], [year])
}
