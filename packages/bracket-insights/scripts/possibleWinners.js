const _ = require('lodash')
const pickMaster = require('../lib/pickMaster')

module.exports = (o) => {
  const current = o.possibilities.possibilities(pickMaster(o))
  const validator = o.validator

  return _.chain(current)
  .map((master) => {
    const winner = _.orderBy(o.scorer.score('standard', {entry: o.entries, master}), 'score', 'desc')[0]
    return {
      username: winner.user.username,
      validated: validator.validate(master)
    }
  })
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
