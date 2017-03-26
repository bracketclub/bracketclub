const _ = require('lodash')
const Validator = require('bracket-validator')
const Scorer = require('bracket-scorer')
const Possibilities = require('bracket-possibilities')
const pickMaster = require('./pickMaster')

module.exports = (opts) => {
  const {sport, year, user, master, dataDir, scoring, all} = opts

  const masters = require(`../${dataDir}/masters-${sport}-${year}.json`)
  const entries = require(`../${dataDir}/entries-${sport}-${year}.json`)

  return {
    all,
    sport,
    year,
    user,
    master,
    entries,
    masters,
    scoring,
    validator: new Validator({sport, year}),
    scorer: new Scorer({sport, year}),
    possibilities: new Possibilities({sport, year}),
    scoreAll: (master) => _.orderBy(new Scorer({sport, year}).score(scoring, {entry: entries, master: master || pickMaster({masters, master})}), 'score', 'desc')
  }
}
