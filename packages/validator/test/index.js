const t = require("tap")
const validator = require("..")
const data = require("@bracketclub/data")
const ncaam = require("@bracketclub/data/ncaam")

const generateNCAAMData = () =>
  data(ncaam, {
    S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i}`) },
    W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i}`) },
    E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i}`) },
    MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i}`) },
  })

t.test("basic", (t) => {
  const validated = validator(
    "MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX",
    generateNCAAMData()
  )
  t.matchSnapshot(validated)
})
