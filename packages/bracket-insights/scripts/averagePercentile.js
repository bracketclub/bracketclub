const _ = require('lodash')

module.exports = (o) => {
  const scored = o.scoreAll()

  return scored.map((entry) => {
    const rank = _.sortedIndexBy(_.map(scored, 'score'), entry.score, (score) => score * -1)
    return [
      entry.user.username,
      rank + 1,
      Math.abs(rank / scored.length - 1) * 100
    ]
  })
}

module.exports.after = (arr) => {
  return {
    title: 'Averages',
    data: _.chain(arr)
      .map('data')
      .flatten()
      .groupBy('0')
      .reject((entries) => entries.length < 2)
      .map((entries) => [
        entries[0][0],
        _.chain(entries).map('2').mean().value()
      ])
      .orderBy('avg', 'desc')
      .value()
  }
}
