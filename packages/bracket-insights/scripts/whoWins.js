const _ = require("lodash")
const pickMaster = require("../lib/pickMaster")

module.exports = (o) => {
  return o.possibilities
    .possibilities(pickMaster(o))
    .map((m) => {
      const scored = o.scoreAll(m)
      const winners = _.filter(scored, { score: scored[0].score })
      return winners.map((w) => ({
        bracket: w.bracket,
        user: w.user.username,
        score: w.score,
      }))
    })
    .sort((a, b) => a[0].score - b[0].score)
}
