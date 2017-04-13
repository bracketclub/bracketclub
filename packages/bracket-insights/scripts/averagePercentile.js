const _ = require('lodash')

module.exports = (o) => {
  const scored = o.scoreAll()
  const unpicked = _.last(o.masters.brackets).match(new RegExp(o.data.constants.UNPICKED_MATCH, 'g'))

  if (o.finished && unpicked) {
    return new Error(`Event has ${unpicked.length} unplayed matches`)
  }

  return scored.map((entry) => {
    const rank = _.sortedIndexBy(_.map(scored, 'score'), entry.score, (score) => score * -1)
    return [
      entry.user.username,
      rank + 1,
      _.round(Math.abs((rank / scored.length) - 1) * 100, 2)
    ]
  })
}

module.exports.after = (arr) => {
  return {
    title: 'Averages',
    data: _.chain(arr)
      .map('data')
      .reject((data) => data instanceof Error)
      // Reject any contests with less than 3 entries
      .reject((totalEntries) => totalEntries.length < 3)
      .flatten()
      .groupBy('0')
      // Reject any people that have entered less than 2 contests
      .reject((entries) => entries.length < 2)
      .map((entries) => [
        entries[0][0],
        _.chain(entries).map('2').mean().round(2).value()
      ])
      .orderBy('1', 'desc')
      .value()
  }
}
