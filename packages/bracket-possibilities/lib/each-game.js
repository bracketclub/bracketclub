"use strict"

Object.defineProperty(exports, "__esModule", {
  value: true,
})
exports.nextGame = exports.eachGame = undefined

var _lodash = require("lodash")

var eachGame = (exports.eachGame = function eachGame(bracket, iterator) {
  var returnOnMatch =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false

  var match = void 0

  ;(0, _lodash.each)(bracket, function (region) {
    ;(0, _lodash.each)(region.rounds, function (round, roundIndex) {
      ;(0, _lodash.each)(round, function (game, gameIndex) {
        if (roundIndex === 0) return false
        match = iterator({
          game: game,
          gameIndex: gameIndex,
          region: region,
          roundIndex: roundIndex,
          prevRound: region.rounds[roundIndex - 1],
        })
        return returnOnMatch ? !match : true
      })
      return returnOnMatch ? !match : true
    })
    return returnOnMatch ? !match : true
  })

  return returnOnMatch ? match : null
})

var nextGame = (exports.nextGame = function nextGame() {
  for (
    var _len = arguments.length, args = Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    args[_key] = arguments[_key]
  }

  return eachGame.apply(undefined, args.concat([true]))
})
