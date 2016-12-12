var bracketData = require('bracket-data')
var BracketValidator = require('bracket-validator')
var _extend = require('lodash/assign')
var _defaults = require('lodash/defaults')
var _pick = require('lodash/pick')
var _find = require('lodash/find')
var _each = require('lodash/forEach')
var _map = require('lodash/map')
var _isNumber = require('lodash/isNumber')
var _isArray = require('lodash/isArray')
var _values = require('lodash/values')
var _compact = require('lodash/compact')
var _intersection = require('lodash/intersection')
var _shuffle = require('lodash/shuffle')

var _constant = function (item) {
  return item
}

var allIndices = function (arr, val) {
  var indices = []
  var i = -1
  while ((i = arr.indexOf(val, i + 1)) !== -1) {
    indices.push(i)
  }
  return indices
}

var teamNameMatches = function (team1, team2) {
  var team1Name = team1 && team1.name
  var team1Names = team1 && team1.names
  var team2Name = team2 && team2.name
  var team2Names = team2 && team2.names

  if (!_isArray(team1Name)) {
    team1Name = [team1Name]
  }

  if (team1Names) {
    team1Name = team1Name.concat(team1Names)
  }

  team1Name = _compact(team1Name.map(function (name) {
    return typeof name === 'string' ? name.toLowerCase() : null
  }))

  if (!_isArray(team2Name)) {
    team2Name = [team2Name]
  }

  if (team2Names) {
    team2Name = team1Name.concat(team2Names)
  }

  team2Name = _compact(team2Name.map(function (name) {
    return typeof name === 'string' ? name.toLowerCase() : null
  }))

  if (team1Name.length && team2Name.length) {
    return _intersection(team1Name, team2Name).length > 0
  }

  return false
}

var seedMatches = function (team1, team2) {
  return team1 && team2 && parseInt(team1.seed) === parseInt(team2.seed)
}

function Updater (options) {
  this.bracketData = bracketData({
    sport: options.sport,
    year: options.year
  })

  this.validator = new BracketValidator({
    sport: options.sport,
    year: options.year
  })

  return this.reset(options)
}

Updater.prototype.reset = function (options) {
  _defaults(options || {}, {
    winner: {},
    loser: {},
    fromRegion: ''
  })

  if (typeof options.winner === 'number' || !isNaN(options.winner)) options.winner = {seed: parseInt(options.winner, 10)}
  if (typeof options.loser === 'number' || !isNaN(options.loser)) options.loser = {seed: parseInt(options.loser, 10)}
  if (typeof options.winner === 'string' && isNaN(options.winner)) options.winner = {name: options.winner}
  if (typeof options.loser === 'string' && isNaN(options.loser)) options.loser = {name: options.loser}

  // If we got passed in null or something, set the properties we need to not break
  if (!options.winner) options.winner = {}
  if (!options.loser) options.loser = {}
  if (!options.winner.name) options.winner.name = ''
  if (!options.loser.name) options.loser.name = ''

  _extend(this, _pick(options, 'winner', 'loser', 'fromRegion', 'currentMaster'))

  return this
}

Updater.prototype.hasWinner = function () {
  return !!(this.winner && (this.winner.name || this.winner.seed))
}

Updater.prototype.hasLoser = function () {
  return !!(this.loser && (this.loser.name || this.loser.seed))
}

Updater.prototype.isFinal = function () {
  var finalName = this.bracketData.constants.FINAL_NAME.toLowerCase()
  var finalId = this.bracketData.constants.FINAL_ID.toLowerCase()
  var region = this.fromRegion.toLowerCase()

  return region === finalName || region === finalId
}

Updater.prototype.isChampionship = function () {
  return (/((National )?Championship( Game)?|NCG)/i).test(this.fromRegion)
}

Updater.prototype.teamMatches = function (team1, team2) {
  if (this.isFinal()) {
    return teamNameMatches(team1, team2)
  } else {
    return seedMatches(team1, team2)
  }
}

Updater.prototype.gameMatches = function (winner, loser) {
  return this.teamMatches(winner, this.winner) && this.teamMatches(loser, this.loser)
}

Updater.prototype.getSeed = function (winner) {
  if (this.isFinal()) {
    var finalTeams = this.validated[this.bracketData.constants.FINAL_ID].rounds[0]
    var finalTeam = _find(finalTeams, function (team) {
      return teamNameMatches(team, winner)
    })
    return {fromRegion: finalTeam.fromRegion}
  } else {
    return {seed: winner.seed}
  }
}

Updater.prototype.flatten = function (bracket) {
  var self = this
  var flattenedBracket = ''
  _each(bracket, function (bracketRegion) {
    var regionString = _map(bracketRegion.rounds, function (round, roundIndex) {
      if (roundIndex === 0) return ''
      return _map(round, function (roundGame) {
        var roundValue
        var pc = roundGame && (roundGame.winsIn || roundGame.playedCompetitions)
        if (roundGame === null) {
          return self.bracketData.constants.UNPICKED_MATCH
        } else if (_isNumber(roundGame) || !isNaN(roundGame)) {
          roundValue = roundGame
        } else if (bracketRegion.id === self.bracketData.constants.FINAL_ID) {
          roundValue = roundGame.fromRegion
        } else {
          roundValue = roundGame.seed
        }
        return roundValue.toString() + (!pc || (pc === 1 || pc === '1') ? '' : pc.toString())
      }).join('')
    }).join('')
        .replace(new RegExp(self.bracketData.order.join(''), 'g'), '')
        .replace(new RegExp(_values(self.bracketData.constants.REGION_IDS).join(''), 'g'), '')
    flattenedBracket += bracketRegion.id + regionString
  })
  return flattenedBracket
}

Updater.prototype.next = function (options, random) {
  options && this.reset(options)
  var bd = this.bracketData
  var validated = this.validator.validate(this.currentMaster)
  var randomOrder = typeof random === 'boolean' ? random : (random && random.order)
  var randomWinner = typeof random === 'boolean' ? random : (random && random.winner)
  var nextGame

  var regionKeys = (randomOrder ? _shuffle : _constant)(bd.constants.REGION_IDS).concat(bd.constants.FINAL_ID)

  _each(regionKeys, function (regionKey) {
    var region = validated[regionKey]
    var rounds = region.rounds

    _each(rounds, function (round, roundIndex) {
      var indices = allIndices(round, null)
      var game = indices.length ? (randomOrder ? _shuffle : _constant)(indices)[0] : null
      if (game !== null) {
        nextGame = {
          region: regionKey,
          regionId: region.id,
          round: roundIndex,
          game: game
        }
        return false
      }
      return true
    })

    return !nextGame
  })

  if (nextGame) {
    var prevRound = validated[nextGame.region].rounds[nextGame.round - 1]
    return (randomWinner ? _shuffle : _constant)([
      _extend({}, prevRound[nextGame.game * 2], {fromRegion: nextGame.regionId}),
      _extend({}, prevRound[nextGame.game * 2 + 1], {fromRegion: nextGame.regionId})
    ])
  }

  return null
}

Updater.prototype.nextRandom = function (options) {
  return this.next(options, true)
}

Updater.prototype.update = function (options) {
  options && this.reset(options)

  var self = this

  var validated = this.validator.validate(this.currentMaster)
  if (validated instanceof Error) return validated
  this.validated = validated

  if (this.isChampionship()) {
    this.fromRegion = this.bracketData.constants.FINAL_ID
  }

  var region = validated[this.fromRegion] || _find(validated, function (item) {
    return item.name.toLowerCase() === self.fromRegion.toLowerCase()
  })

  if (!region) return new Error('No region')
  if (!this.hasWinner()) return new Error('Supply at least winning team')

  var regionRoundIndex = null
  var nextRoundGameIndex = null
  var i, ii, m, mm, round, roundGame, otherTeam

  roundLoop: // eslint-disable-line no-labels
    for (i = region.rounds.length; i-- > 0;) {
      round = region.rounds[i]
      for (ii = round.length; ii-- > 0;) {
        roundGame = round[ii]
        otherTeam = round[(ii % 2 === 0) ? ii + 1 : ii - 1]

        if (roundGame !== null) {
          if (this.hasWinner() && this.hasLoser() && this.gameMatches(roundGame, otherTeam)) {
            // If we have a winner and a loser look for the game that matches both
            // Place winner into the next round
            regionRoundIndex = i + 1
            nextRoundGameIndex = Math.floor(ii / 2)
            break roundLoop // eslint-disable-line no-labels
          } else {
            // If there is no other team, it means we want to use the winner of the latest game they appear
            // So if a user is picking a bracket, a winner can be picked without an opponent
            if (this.teamMatches(roundGame, this.winner) && !this.hasLoser()) {
              regionRoundIndex = i + 1
              nextRoundGameIndex = Math.floor(ii / 2)
              otherTeam && (this.loser = otherTeam)
              break roundLoop // eslint-disable-line no-labels
            }
          }
        }
      }
    }

  if (regionRoundIndex !== null && nextRoundGameIndex !== null) {
    var hasRound = !!region.rounds[regionRoundIndex]
    if (hasRound) {
      region.rounds[regionRoundIndex][nextRoundGameIndex] = _extend(this.getSeed(this.winner), _pick(options, 'playedCompetitions'))
      for (i = regionRoundIndex, m = region.rounds.length; i < m; i++) {
        round = region.rounds[i]
        for (ii = 0, mm = round.length; ii < mm; ii++) {
          roundGame = round[ii]
          otherTeam = round[(ii % 2 === 0) ? ii + 1 : ii - 1]
          // The losing team might have already advanced in the bracket
          // Such as when someone is picking a bracket and changed their mind
          // We need to remove all of the losing team from the rest of the rounds
          if (this.hasLoser() && roundGame !== null && this.teamMatches(roundGame, this.loser)) {
            round[ii] = null
          }
        }
      }
    }
  }

  // Clear losing teams from final four also
  var isFinalRegion = this.fromRegion === this.bracketData.constants.FINAL_ID
  if (this.hasLoser() && (!isFinalRegion || (isFinalRegion && regionRoundIndex === 1))) {
    var fin = validated[this.bracketData.constants.FINAL_ID]
    _each(fin.rounds, function (round, i) {
      if (i > 0) {
        _each(round, function (game, ii) {
          if (game && teamNameMatches(game, self.loser)) {
            validated[self.bracketData.constants.FINAL_ID].rounds[i][ii] = null
          }
        })
      }
    })
  }

  this.currentMaster = this.flatten(validated)
  return this.currentMaster
}

module.exports = Updater
