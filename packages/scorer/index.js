var { diff } = require("@bracketclub/diff")
var _each = require("lodash/forEach")
var _map = require("lodash/map")
var _uniq = require("lodash/uniq")
var _some = require("lodash/some")
var _contains = require("lodash/includes")
var _isArray = require("lodash/isArray")
var _findIndex = require("lodash/findIndex")
var _pick = require("lodash/pick")

var getResult = {
  totalScore: function (scoringSystem, result) {
    if (result.status !== "correct") return 0

    if (typeof scoringSystem === "undefined")
      throw new Error("There is no scoring system: " + result.type)

    if (
      _isArray(scoringSystem) &&
      typeof scoringSystem[0] === "number" &&
      scoringSystem.length === initialValues.rounds(bd).length
    ) {
      // The scoring system is an array of numbers that is equal to the number of rounds
      // So we return the value for the current round
      return scoringSystem[result.roundIndex] * 10
    } else if (
      _isArray(scoringSystem) &&
      scoringSystem.length === initialValues.rounds(bd).length &&
      _isArray(scoringSystem[0]) &&
      scoringSystem[0].length === 2
    ) {
      // The scoring system is an array of arrays that is equal to the number of rounds
      // Each array has a number of points per correct pick and a number of points for the correct number of games
      return (
        scoringSystem[result.roundIndex][0] * 10 +
        (result.bonusStatus === "correct"
          ? scoringSystem[result.roundIndex][1] * 10
          : 0)
      )
    } else if (
      _isArray(scoringSystem) &&
      _isArray(scoringSystem[0]) &&
      scoringSystem.length === initialValues.rounds(bd).length &&
      scoringSystem[0].length === bd.constants.TEAMS_PER_REGION
    ) {
      // The scoring system is an array of arrays. There is one array for each round
      // and each sub-array has one value for each seed. So we return the value for the current round+seed
      return scoringSystem[result.roundIndex][result.seed - 1] * 10
    } else if (typeof scoringSystem === "number") {
      return scoringSystem * 10
    }

    throw new Error("Cant do anything with scoring system: " + result.type)
  },
  rounds: function (options) {
    options.rounds[options.roundIndex].total +=
      options.status === "correct" ? 1 : 0
  },
  bonus: function (options) {
    options.bonus[options.roundIndex].bonus +=
      options.bonusStatus === "correct" ? 1 : 0
  },
}

var getRoundCount = function (teams) {
  var count = 0
  while (teams > 1) {
    count++
    teams = teams / 2
  }
  return count
}

const score = (entry, master, scoring, bracketData) => {
  const diffEntry = diff(entry, master, bracketData)
  const roundCount = getRoundCount(
    bracketData.constants.TEAMS_PER_REGION * bracketData.constants.REGION_COUNT
  )
  const results = {
    total: 0,
    bonus: 0,
    ppr: 0,
    rounds: new Array(roundCount)
      .fill(null)
      .map(() => ({ total: 0, bonus: 0, ppr: 0 })),
  }

  var regionRounds = roundCount(bracketData.constants.TEAMS_PER_REGION)

  _each(diffEntry, function (region, regionId) {
    var isFinal = regionId === bracketData.constants.FINAL_ID
    _each(region.rounds, function (round, roundIndex) {
      var trueRoundIndex =
        (isFinal ? regionRounds + roundIndex : roundIndex) - 1
      if (roundIndex > 0 || isFinal) {
        _each(round, function (game, gameIndex) {
          var findOpponent = function (rounds, g) {
            var previousRound =
              rounds[isFinal && roundIndex === 0 ? roundIndex : roundIndex - 1]
            var gameIndex = _findIndex(
              previousRound,
              _pick(g, "fromRegion", "seed", "name")
            )
            return previousRound[
              gameIndex % 2 === 0 ? gameIndex + 1 : gameIndex - 1
            ]
          }

          var masterRounds = self.validatedMaster[regionId].rounds
          var masterGame = masterRounds[roundIndex][gameIndex]
          var masterOpponent = findOpponent(masterRounds, masterGame)
          var opponent = findOpponent(region.rounds, game)

          getResult.rounds({
            rounds: results.rounds,
            roundIndex: trueRoundIndex,
            status: status,
          })

          getResult.bonus({
            bonus: results.bonus,
            roundIndex: trueRoundIndex,
            bonusStatus: bonusStatus,
          })

          getResult.totalScore(self.bracketData, {
            roundIndex: trueRoundIndex,
            status: status,
            seed: game.seed,
            bonusStatus: bonusStatus,
            type: method,
          })
        })
      }
    })
  })

  // Any total score is a number and we multipled by 10 originally to support tenth place decimals
  _each(results, function (val, key, list) {
    if (typeof val === "number") {
      list[key] = val / 10
    }
  })

  return results
}

module.exports = score
