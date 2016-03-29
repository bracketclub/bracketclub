const _ = require('lodash')

module.exports = (o) => {
  const beforeFF = o.possibilities.possibilities(o.masters.brackets[60])
  const validator = o.validator

  return _.chain(beforeFF)
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
