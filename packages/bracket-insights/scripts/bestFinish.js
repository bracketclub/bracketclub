const _ = require('lodash')

module.exports = (o) => _.chain(o.entries)
  .map((entry) => {
    const best = o.possibilities.finishes({
      entries: o.entries,
      master: o.masters.brackets[58],
      findEntry: _.pick(entry, 'id')
    })[0]

    return {
      username: entry.user.username,
      rank: best.rank
    }
  })
  .sortBy('rank')
  .value()
