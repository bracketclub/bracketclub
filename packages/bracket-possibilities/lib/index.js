"use strict"

Object.defineProperty(exports, "__esModule", {
  value: true,
})

var _extends =
  Object.assign ||
  function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ("value" in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
})()

var _bracketScorer = require("bracket-scorer")

var _bracketScorer2 = _interopRequireDefault(_bracketScorer)

var _bracketUpdater = require("bracket-updater")

var _bracketUpdater2 = _interopRequireDefault(_bracketUpdater)

var _bracketData = require("bracket-data")

var _bracketData2 = _interopRequireDefault(_bracketData)

var _bracketValidator = require("bracket-validator")

var _bracketValidator2 = _interopRequireDefault(_bracketValidator)

var _lodash = require("lodash")

var _eachGame = require("./each-game")

var _binaryCombinations = require("./binary-combinations")

var _binaryCombinations2 = _interopRequireDefault(_binaryCombinations)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function")
  }
}

var Possibilities = (function () {
  function Possibilities(_ref) {
    var sport = _ref.sport,
      year = _ref.year

    _classCallCheck(this, Possibilities)

    this._scorer = new _bracketScorer2.default({ sport: sport, year: year })
    this._updater = new _bracketUpdater2.default({ sport: sport, year: year })
    this._validator = new _bracketValidator2.default({
      sport: sport,
      year: year,
    })
    this._unpicked = new RegExp(
      new _bracketData2.default({
        sport: sport,
        year: year,
      }).constants.UNPICKED_MATCH,
      "g"
    )
  }

  _createClass(Possibilities, [
    {
      key: "best",
      value: function best(_ref2) {
        var _this = this

        var entry = _ref2.entry,
          master = _ref2.master

        var current = master
        var diff = this._scorer.diff({ entry: entry, master: master })

        ;(0, _eachGame.eachGame)(diff, function (_ref3) {
          var game = _ref3.game,
            region = _ref3.region

          if (typeof game.correct === "undefined" && game.eliminated !== true) {
            current = _this._updater.update({
              currentMaster: current,
              fromRegion: region.id,
              winner: (0, _lodash.pick)(game, "seed", "name"),
              playedCompetitions: game.winsIn,
            })
          }
        })

        return current
      },
    },
    {
      key: "bestScore",
      value: function bestScore(_ref4) {
        var entry = _ref4.entry,
          master = _ref4.master,
          _ref4$scoreType = _ref4.scoreType,
          scoreType =
            _ref4$scoreType === undefined ? "standard" : _ref4$scoreType

        var best = this.best({ entry: entry, master: master })
        return this._scorer.score(scoreType, { entry: entry, master: best })
      },
    },
    {
      key: "possibilities",
      value: function possibilities(options) {
        var _this2 = this

        var bracket = typeof options === "string" ? options : this.best(options)
        var unpicked = bracket.match(this._unpicked) || []

        return (0, _binaryCombinations2.default)(unpicked.length).map(function (
          combo
        ) {
          return combo.reduce(function (memo, c) {
            return _this2._updater.update(
              _extends(
                {
                  currentMaster: memo,
                },
                (0, _eachGame.nextGame)(
                  _this2._validator.validate(memo),
                  function (_ref5) {
                    var prevRound = _ref5.prevRound,
                      game = _ref5.game,
                      region = _ref5.region,
                      roundIndex = _ref5.roundIndex,
                      gameIndex = _ref5.gameIndex

                    if (game === null) {
                      return {
                        fromRegion: region.id,
                        winner: (0, _lodash.pick)(
                          prevRound[gameIndex * 2 + c],
                          "seed",
                          "name"
                        ),
                        playedCompetitions: prevRound[gameIndex * 2 + c].winsIn,
                      }
                    }
                  }
                )
              )
            )
          }, bracket)
        })
      },
    },
    {
      key: "finishes",
      value: function finishes(_ref6) {
        var _this3 = this

        var findEntry = _ref6.findEntry,
          entries = _ref6.entries,
          master = _ref6.master,
          type = _ref6.type,
          rank = _ref6.rank,
          _ref6$scoreType = _ref6.scoreType,
          scoreType =
            _ref6$scoreType === undefined ? "standard" : _ref6$scoreType

        var entry = (0, _lodash.find)(entries, findEntry)
        var entryBracket = entry.bracket || entry
        var finishes = []
        var bestFinish = null

        // If only looking for the first winning entry, then return null if the entry's
        // best score isn't higher than the current leader
        if (type === "find") {
          var bestScore = this.bestScore({
            entry: entryBracket,
            master: master,
            scoreType: scoreType,
          })
          var currentLeader = (0, _lodash.orderBy)(
            this._scorer.score(scoreType, { entry: entries, master: master }),
            "score",
            "desc"
          )[0].score

          if (currentLeader > bestScore) {
            return bestFinish
          }
        }

        var possibilities =
          type === "all" ? master : { entry: entryBracket, master: master }

        ;(0, _lodash.each)(
          this.possibilities(possibilities),
          function (bracket) {
            var scores = (0, _lodash.sortBy)(
              _this3._scorer.score(scoreType, {
                entry: entries,
                master: bracket,
              }),
              "score"
            )
            var scoredEntry = (0, _lodash.find)(scores, findEntry)
            var entryRank =
              scores.length -
              (0, _lodash.sortedLastIndexOf)(
                scores.map(function (s) {
                  return s.score
                }),
                scoredEntry.score
              )
            var winner = scores[scores.length - 1]
            var behind = winner.score - scoredEntry.score

            var finish = {
              rank: entryRank,
              behind: behind,
              bracket: bracket,
            }

            if (type === "find" && entryRank <= (rank || 1)) {
              bestFinish = finish
              return false
            }

            finishes.push(finish)
          }
        )

        if (type === "find") {
          return bestFinish
        }

        var sortedFinishes = (0, _lodash.orderBy)(
          finishes,
          ["rank", "behind"],
          ["asc", "asc"]
        )

        return rank
          ? (0, _lodash.filter)(sortedFinishes, function (_ref7) {
              var entryRank = _ref7.rank
              return entryRank <= rank
            })
          : sortedFinishes
      },
    },
    {
      key: "canWin",
      value: function canWin(options) {
        // Will return the first occurrence of a winner entry
        return this.finishes(_extends({}, options, { type: "find", rank: 1 }))
      },
    },
    {
      key: "winners",
      value: function winners(options) {
        // Will return some winning possible finishes
        return this.finishes(_extends({}, options, { rank: 1 }))
      },
    },
    {
      key: "allWinners",
      value: function allWinners(options) {
        // Will return all winning brackets
        return this.finishes(_extends({}, options, { type: "all", rank: 1 }))
      },
    },
  ])

  return Possibilities
})()

exports.default = Possibilities
module.exports = exports["default"]
