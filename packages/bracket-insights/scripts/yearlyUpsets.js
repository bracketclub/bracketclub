const _ = require('lodash')

module.exports = (o) => {
  const v = o.validator.validate(_.last(o.masters.brackets))
  const regions = _.omit(v, 'FF')

  const round1s = _.map(regions, (region) => region.rounds[1])
  const upsets = _.map(round1s, (round1) => _.countBy(round1, (team) => team.seed >= 9 ? 'upset' : 'chalk'))
  const firstRoundUpsets = _.sum(_.map(upsets, 'upset'))

  const finalFourSeeds = _.map(v.FF.rounds[0], 'seed').sort()
  const avgFinalFourSeed = _.mean(finalFourSeeds)

  return {
    firstRoundUpsets,
    finalFourSeeds,
    avgFinalFourSeed
  }
}

module.exports.after = (arr) => ({
  title: 'Averages',
  data: {
    firstRoundUpsets: _.chain(arr).map('data.firstRoundUpsets').mean(),
    avgFinalFourSeed: _.chain(arr).map('data.avgFinalFourSeed').mean()
  }
})
