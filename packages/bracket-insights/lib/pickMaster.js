const _ = require('lodash')

module.exports = (o) => {
  const {master, masters: {brackets}} = o

  if (typeof master === 'number') {
    // -1 means one from end
    if (master < 0) return brackets[brackets.length - 1 + master]
    // 12 means 12th index
    if (master < brackets.length) return brackets[master]
  }

  // By default return last (or passed in fn)
  return _.last(brackets)
}
