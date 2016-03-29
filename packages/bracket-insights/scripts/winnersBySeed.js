const _ = require('lodash')

module.exports = (o) => {
  return o.entries.map((entry) => {
    return o.validator.validate(entry.bracket).FF.rounds[2][0].seed
  })
}

module.exports.after = (arr) => ({
  title: 'Total',
  data: _.chain(arr).map('data').flatten().countBy()
})

