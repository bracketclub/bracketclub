const t = require("tap")
const score = require("@bracketclub/scorer")
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
  generate: (a) => generate(a, DATA),
}

t.test("basic", (t) => {
  const higher = generate("higher")
  const result = score(
    higher,
    higher,
    [10, 20, 40, 80, 160, 320],
    FIXTURES.DATA()
  )
  t.ok(result)
  console.log(result)
  t.end()
})
