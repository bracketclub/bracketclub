const _ = require('lodash')
const Validator = require('bracket-validator')
const Scorer = require('bracket-scorer')
const Possibilities = require('bracket-possibilities')

module.exports = (opts) => {
  const sport = opts.sport
  const year = opts.year

  const masters = require(`../.data/masters-${sport}-${year}.json`)
  const entries = require(`../.data/entries-${sport}-${year}.json`)

  return {
    sport,
    year,
    entries,
    masters,
    validator: new Validator({sport, year}),
    scorer: new Scorer({sport, year}),
    possibilities: new Possibilities({sport, year}),
    scoreAll: (master) => _.orderBy(new Scorer({sport, year}).score('standard', {entry: entries, master: master || _.last(masters.brackets)}), 'score', 'desc')
  }
}
