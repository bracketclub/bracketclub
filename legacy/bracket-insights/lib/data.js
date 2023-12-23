const _ = require("lodash")
const Validator = require("bracket-validator")
const Scorer = require("bracket-scorer")
const Data = require("bracket-data")
const Possibilities = require("bracket-possibilities")
const pickMaster = require("./pickMaster")

const conflictingKeys = (...objs) =>
  _.intersection(...objs.map((obj) => Object.keys(obj)))

module.exports = (opts) => {
  let masters, entries
  const { dataDir, sport, year } = opts

  try {
    masters = require(`../${dataDir}/masters-${sport}-${year}.json`)
    entries = require(`../${dataDir}/entries-${sport}-${year}.json`)
  } catch (e) {
    return null
  }

  const pickedMaster = pickMaster(_.assign({}, opts, { masters }))

  const bracketData = {
    entries,
    masters,
    data: Data({ sport, year }),
    validator: new Validator({ sport, year }),
    scorer: new Scorer({ sport, year }),
    possibilities: new Possibilities({ sport, year }),
    scoreAll: (master) =>
      _.orderBy(
        new Scorer({ sport, year }).score(opts.scoring, {
          entry: entries,
          master: master || pickedMaster,
        }),
        "score",
        "desc"
      ),
  }

  const badKeys = conflictingKeys(bracketData, opts)
  if (badKeys.length) {
    throw new Error(`Cannot override computed options: ${badKeys.join(", ")}`)
  }

  return _.assign({}, opts, bracketData)
}
