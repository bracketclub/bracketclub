const _ = require('lodash')
const filterByUser = require('../lib/filterByUser')
const pickMaster = require('../lib/pickMaster')

module.exports = (o) => _.chain(o.entries)
  .filter(filterByUser(o))
  .map((entry) => {
    const winners = o.possibilities.winners({
      entries: o.entries,
      master: pickMaster(o),
      findEntry: _.pick(entry, 'id'),
      type: o.all ? 'all' : null
    })

    return {
      username: entry.user.username,
      brackets: _.map(winners, ({bracket}) => ({
        bracket,
        url: `http://localhost:3000/${o.sport}-${o.year}/entry/${bracket}`
      }))
    }
  })
  .value()
