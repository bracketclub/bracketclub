const _ = require('lodash')

module.exports = (o) => _.chain(o.entries)
  .map((entry) => {
    const scored = o.scorer.diff({entry: entry.bracket, master: _.last(o.masters.brackets)})

    const correctByRegion = _.chain(scored).map((value) =>
      _(value.rounds).drop().flatten().filter('correct', true).value().length
    ).sortBy().reverse().value()

    return {
      username: entry.user.username,
      correctByRegion,
      total: _.reduce(correctByRegion, (memo, num) => memo + num, 0)
    }
  })
  .value()

module.exports.after = (arr) => ({
  title: 'Best Ever',
  data: {
    total: _.chain(arr).map('data').flatten().maxBy('total'),
    correctByRegion: _.chain(arr).map('data').flatten().maxBy((d) => d.correctByRegion[0])
  }
})
