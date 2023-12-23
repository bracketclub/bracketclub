const t = require("tap")
const { diff } = require("@bracketclub/diff")
const generate = require("@bracketclub/generator")
const data = require("@bracketclub/data")
const ncaam = require("@bracketclub/data/ncaam")

const DATA = () =>
  data(ncaam, {
    S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i}`) },
    W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i}`) },
    E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i}`) },
    MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i}`) },
  })

const FIXTURES = {
  DATA,
  GENERATE: (a) => generate(a, DATA()),
}

t.test("basic", (t) => {
  const higher = FIXTURES.GENERATE("higher")
  const lower = FIXTURES.GENERATE("lower")
  const result = diff(higher, lower, FIXTURES.DATA())
  t.matchSnapshot(result)
  t.end()
})

t.test("perfect", (t) => {
  const lower = FIXTURES.GENERATE("lower")
  const result = diff(lower, lower, FIXTURES.DATA())
  t.matchSnapshot(result)
  t.end()
})

t.test("eliminated", (t) => {
  const higher = FIXTURES.GENERATE("higher")
  const partial =
    "S1XXXXXXXXXXXXXXW1XXXXXXXXXXXXXXE1XXXXXXXXXXXXXXMW1XXXXXXXXXXXXXXFFXXX"
  const result = diff(higher, partial, FIXTURES.DATA())
  t.matchSnapshot(result)
  t.end()
})
