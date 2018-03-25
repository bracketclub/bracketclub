const _ = require('lodash')
const filterByUser = require('../lib/filterByUser')
const pickMaster = require('../lib/pickMaster')

const previousMaster = (o, master) => o.masters.brackets[o.masters.brackets.indexOf(master) - 1]

const unpicked = (o, m) => (
  m.match(new RegExp(o.data.constants.UNPICKED_MATCH, 'g')) || []
).length

const canWin = (o, entry, master) => !!o.possibilities.canWin({
  master,
  entries: o.entries,
  findEntry: _.pick(entry, 'id')
})

const canWinCount = (o, master) => o.entries
  .filter((entry) => canWin(o, entry, master))
  .length

const findRank = (o) => {
  const entry = _.find(o.entries, filterByUser(o))
  const scored = o.scoreAll()
  const scoredEntry = _.find(scored, (s) => entry.user.username === s.user.username)
  const rank = _.sortedIndexBy(_.map(scored, 'score'), scoredEntry.score, (score) => score * -1)
  return rank + 1
}

module.exports = (o) => {
  const entry = _.find(o.entries, filterByUser(o))

  if (!entry) {
    return new Error('entry is required')
  }

  const result = {
    username: entry.user.username,
    rank: findRank(o)
  }

  let master = pickMaster(o)

  while (unpicked(o, master) <= 15) {
    if (canWin(o, entry, master)) {
      return {
        ...result,
        eliminated: canWinCount(o, master)
      }
    }
    master = previousMaster(o, master)
  }

  return {
    ...result,
    eliminated: null
  }
}
