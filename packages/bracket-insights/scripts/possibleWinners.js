const _ = require('lodash')
const pickMaster = require('../lib/pickMaster')

module.exports = (o) => {
  const master = pickMaster(o)
  const current = o.possibilities.possibilities(master)
  const validator = o.validator
  const unpicked = (master.match(new RegExp(o.data.constants.UNPICKED_MATCH, 'g')) || []).length

  if (unpicked > 7) {
    throw new Error('This script cant handle creating text descriptions for brackets with more than 7 games remaining')
  }

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
      count: value.length,
      percent: `${(value.length / current.length * 100).toFixed(2)}%`,
      results: _.map(value, (m) => {
        const result = []

        const getWinner = (round, pick) => {
          const w = m.validated.FF.rounds[round][pick]
          const prev = m.validated.FF.rounds[round - 1]
          const o = _.reject([prev[pick * 2], prev[pick * 2 + 1]], w)[0]
          result.push(`${w.name} over ${o.name}`)
        }

        if (unpicked > 3) {
          getWinner(1, 0)
          getWinner(1, 1)
        }

        getWinner(2, 0)

        return result.join(' | ')
      })
    }
  })
  .value()
}

module.exports.after = (arr) => ({
  title: 'Non-eliminated Entries',
  data: _.map(arr, (a) => `${a.sport} ${a.year} ${a.data.length}`)
})
