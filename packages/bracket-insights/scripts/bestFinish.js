const _ = require('lodash')
const filterByUser = require('../lib/filterByUser')
const pickMaster = require('../lib/pickMaster')

module.exports = (o) => _.chain(o.entries)
  .filter(filterByUser(o))
  .map((entry) => {
    const best = o.possibilities.finishes({
      entries: o.entries,
      master: pickMaster(o),
      findEntry: _.pick(entry, 'id')
    })[0]

    return {
      username: entry.user.username,
      rank: best.rank
    }
  })
  .sortBy('rank')
  .value()
