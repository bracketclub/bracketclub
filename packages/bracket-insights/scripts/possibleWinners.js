const _ = require('lodash')
const pickMaster = require('../lib/pickMaster')

module.exports = (o) => {
  const current = o.possibilities.possibilities(pickMaster(o))
  const validator = o.validator

  return _.chain(current)
  .reduce((acc, master) => {
    const scored = _.orderBy(o.scorer.score(o.scoring, {entry: o.entries, master}), 'score', 'desc')
    const winningScore = scored[0].score
    const winners = _.filter(scored, { score: winningScore }).map((winner) => {
      return {
        username: winner.user.username,
        validated: validator.validate(master)
      }
    })
    acc.push(...winners)
    return acc
  }, [])
  .groupBy('username')
  .map((value, username) => {
    return {
      username,
      results: _.map(value, (m) => {
        const winner = m.validated.FF.rounds[2][0]
        const final = _.reject(m.validated.FF.rounds[1], winner)[0]
        return `${winner.name} over ${final.name}`
      })
    }
  })
  .value()
}

module.exports.after = (arr) => ({
  title: 'Non-eliminated Entries',
  data: _.map(arr, (a) => `${a.sport} ${a.year} ${a.data.length}`)
})
