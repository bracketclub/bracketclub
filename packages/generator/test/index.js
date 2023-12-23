const t = require("tap")
const generate = require("@bracketclub/generator")
const validator = require("@bracketclub/validator")
const data = require("@bracketclub/data")
const ncaam = require("@bracketclub/data/ncaam")

const FIXTURES = {
  DATA: () =>
    data(ncaam, {
      S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i}`) },
      W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i}`) },
      E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i}`) },
      MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i}`) },
    }),
}

t.test("basic", (t) => {
  const bracket = generate(FIXTURES.DATA())
  t.ok(bracket)
  t.ok(validator(bracket, FIXTURES.DATA()))
  t.end()
})
