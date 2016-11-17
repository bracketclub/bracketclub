var bracketData = require('bracket-data')
var _isString = require('lodash/isString')
var _map = require('lodash/map')
var _random = require('lodash/random')
var _sample = require('lodash/sample')
var _uniq = require('lodash/uniq')
var _toArray = require('lodash/toArray')
var _difference = require('lodash/difference')
var _flatten = require('lodash/flatten')
var _last = require('lodash/last')
var _find = require('lodash/find')
var _defaults = require('lodash/defaults')
var _extend = require('lodash/assign')
var _filter = require('lodash/filter')
var _omit = require('lodash/omit')
var _pick = require('lodash/pick')
var _reduce = require('lodash/reduce')

function Generator (options) {
  this.bracketData = bracketData({
    year: options.year,
    sport: options.sport
  })

  return this.reset(_omit(options, 'sport', 'year'))
}

Generator.prototype.reset = function (options) {
  _defaults(options, {
    winners: '',
    generatedBracket: null,
    winnerCounter: 0,
    regionCounter: 0,
    finishedRegions: null
  })

  _extend(this, _pick(options, 'winnerCounter', 'regionCounter', 'generatedBracket', 'finishedRegions'))
  this.options = _pick(options, 'winners')

  return this
}

Generator.prototype.generateWinner = function (matchup) {
  var self = this

  if (_isString(matchup[0]) && _isString(matchup[1])) {
    matchup = _map(matchup, function (region) {
      return self.winningTeamFromRegion(region)
    })
  }

  var possible = {
    random: _random(matchup.length - 1),
    // Higher means higher seed OR if seeds are the same 2nd team
    higher: function () {
      if (_uniq(matchup, true).length < 2) return 1
      return matchup.indexOf(Math.max.apply(Math, matchup))
    },
    // Lower means lower seed OR if seeds are the same 1st team
    lower: function () {
      if (_uniq(matchup, true).length < 2) return 0
      return matchup.indexOf(Math.min.apply(Math, matchup))
    }
  }

  var pickIndex = this.options.winners.length >= this.bracketData.order.length
    ? this.regionCounter * (this.bracketData.order.length - 1) + (this.winnerCounter + 1) - 1
    : this.winnerCounter

  var pick = this.options.winners.charAt(pickIndex)
  var winner

  if (pick === '1') {
    winner = possible.higher()
  } else if (pick === '0') {
    winner = possible.lower()
  } else if (typeof possible[this.options.winners] === 'function') {
    winner = possible[this.options.winners]()
  } else if (typeof possible[this.options.winners] !== 'undefined') {
    winner = possible[this.options.winners]
  }

  return (winner >= 0 && winner < matchup.length) ? winner : possible.random
}

Generator.prototype.generateRound = function (opts) {
  var seeds = opts.seeds
  var matchup = [seeds[0], seeds[1]]
  var winner = matchup[this.generateWinner(matchup)]
  var winners = (opts.winners || []).concat(winner)
  var remainingSeeds = seeds.splice(2)

  this.winnerCounter++

  if (remainingSeeds.length === 0) {
    return winners
  } else {
    return this.generateRound({seeds: remainingSeeds, winners: winners})
  }
}

Generator.prototype.generateRounds = function (opts) {
  var optRound = _toArray(opts.round)
  var round = this.generateRound({seeds: opts.round})
  var rounds = (opts.rounds || [])

  if (rounds.length === 0) {
    rounds.push(optRound)
  }
  rounds.push(_toArray(round))

  if (round.length === 1) {
    this.regionCounter++
    return rounds
  } else {
    return this.generateRounds({round: round, rounds: rounds})
  }
}

Generator.prototype.generateRegion = function (region) {
  this.winnerCounter = 0
  return {id: region.id, rounds: this.generateRounds({round: this.bracketData.order.slice()})}
}

Generator.prototype.generateRegions = function () {
  this.regionCounter = 0
  var regions = _map(_filter(this.bracketData.bracket.regions, function (r) { return !!r.teams }), this.generateRegion.bind(this))
  this.finishedRegions = regions
  return regions
}

Generator.prototype.generateBracket = function () {
  if (this.generatedBracket === null) {
    this.generatedBracket = this.generateRegions().concat(this.generateFinal())
  }
  return this.generatedBracket
}

Generator.prototype.generateFinalFour = function () {
  var regions = this.bracketData.constants.REGION_IDS
  var firstTeam = regions[0]
  var matchup1 = [firstTeam, this.bracketData.bracket.regions[firstTeam].sameSideAs]
  var matchup2 = _difference(regions, matchup1)
  return _flatten([matchup1, matchup2])
}

Generator.prototype.generateFinal = function () {
  this.winnerCounter = 0
  return {id: this.bracketData.constants.FINAL_ID, name: this.bracketData.constants.FINAL_NAME, rounds: this.generateRounds({round: this.generateFinalFour()})}
}

Generator.prototype.winningTeamFromRegion = function (fromRegion) {
  var hasFinishedRegions = !!(this.finishedRegions.length)
  var regions = (hasFinishedRegions) ? this.finishedRegions : this.generateBracket()
  return _last(_find(regions, function (region) {
    return region.id === fromRegion
  }).rounds)[0]
}

Generator.prototype.addBestOfToRounds = function (rounds) {
  var bestOf = this.bracketData.constants.BEST_OF_RANGE

  if (!bestOf) return rounds

  return _map(rounds, function (round, index) {
    if (index === 0) {
      return round
    } else {
      return _reduce(round, function (acc, pick) {
        acc.push(pick)
        acc.push(_sample(bestOf))
        return acc
      }, [])
    }
  })
}

Generator.prototype.generate = function (winners) {
  var self = this
  winners && this.reset({winners: winners})
  return _map(_flatten(_toArray(this.generateBracket())), function (region) {
    return region.id + _flatten(self.addBestOfToRounds(region.rounds)).join('')
  }).join('')
    .replace(new RegExp(this.bracketData.order.join(''), 'g'), '')
    .replace(new RegExp(this.generateFinalFour().join(''), 'g'), '')
}

module.exports = Generator
