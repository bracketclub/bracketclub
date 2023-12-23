const t = require("tap")
const { update, next, nextRandom } = require("@bracketclub/updater")
const data = require("@bracketclub/data")
const ncaam = require("@bracketclub/data/ncaam")

const FIXTURES = {
  DATA: () => data(ncaam),
  EMPTY: data(ncaam).constants.EMPTY,
}

t.test("basic", (t) => {
  const updated = update(
    FIXTURES.EMPTY,
    { winner: 1, loser: 16, fromRegion: "S" },
    FIXTURES.DATA()
  )
  t.equal(updated.slice(0, 3), "S1X")
  t.end()
})

t.test("next", (t) => {
  const nextGame = next(FIXTURES.EMPTY, FIXTURES.DATA())
  t.strictSame(nextGame, [
    { fromRegion: "S", seed: 1 },
    { fromRegion: "S", seed: 16 },
  ])
  t.end()
})

t.test("next random", (t) => {
  const nextGame = nextRandom(FIXTURES.EMPTY, FIXTURES.DATA())
  t.match(nextGame, [
    { fromRegion: String, seed: Number },
    { fromRegion: String, seed: Number },
  ])
  t.end()
})
