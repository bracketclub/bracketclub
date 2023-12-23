const t = require("tap")
const getData = require("@bracketclub/data")
const nba = require("@bracketclub/data/nba")
const ncaam = require("@bracketclub/data/ncaam")
const ncaaw = require("@bracketclub/data/ncaaw")
const nhl = require("@bracketclub/data/nhl")
const wcm = require("@bracketclub/data/wcm")

t.test("basic", (t) => {
  t.matchSnapshot(getData(nba), "nba")
  t.matchSnapshot(getData(ncaam), "ncaam")
  t.matchSnapshot(getData(ncaaw), "ncaaw")
  t.matchSnapshot(getData(nhl), "nhl")
  t.matchSnapshot(getData(wcm), "wcm")
  t.end()
})

t.test("with teams", (t) => {
  t.matchSnapshot(
    getData(ncaam, {
      S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i}`) },
      W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i}`) },
      E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i}`) },
      MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i}`) },
    }),
    "ncaam"
  )
})
