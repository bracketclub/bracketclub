var bracketData = require('bracket-data')
var _all = require('lodash/every')
var _include = require('lodash/includes')
var _map = require('lodash/map')
var _toArray = require('lodash/toArray')
var _range = require('lodash/range')
var _keys = require('lodash/keys')
var _defaults = require('lodash/defaults')
var _omit = require('lodash/omit')
var _difference = require('lodash/difference')
var _isArray = require('lodash/isArray')
var _some = require('lodash/some')
var _filter = require('lodash/filter')
var _find = require('lodash/find')
var _each = require('lodash/forEach')
var _extend = require('lodash/assign')
var _last = require('lodash/last')
var _without = require('lodash/without')
var _compact = require('lodash/compact')
var _uniqBy = require('lodash/uniqBy')
var _indexOf = require('lodash/indexOf')

var _subset = function (small, big) {
  if (small.length === 0) return true
  return _all(small, function (n) {
    return _include(big, n)
  })
}

var hasError = function (result) {
  return _isArray(result) ? _some(result, function (r) { return r instanceof Error }) : result instanceof Error
}

var getErrors = function (result) {
  return _isArray(result) ? _filter(result, function (r) { return r instanceof Error })[0] : result
}

var findResult = function (result) {
  return _isArray(result) ? _map(result, 'result') : result.result
}

var wrapError = function () {
  return {
    error: true,
    result: new Error(_map(_toArray(arguments), function (arg) {
      return (typeof arg.message === 'string') ? arg.message : arg.toString()
    }).join(', '))
  }
}

var wrapSuccess = function (result) {
  return {
    error: null,
    result: result
  }
}

var winningTeamFromRegion = function (bracket, regionName) {
  return _last(_find(bracket, function (b) { return b.id === regionName }).rounds)[0]
}

function Validator (options) {
  _defaults(options, {
    testOnly: false,
    allowEmpty: true,
    flatBracket: ''
  })

  this.options = _omit(options, 'flatBracket')

  this.bracketData = bracketData({
    year: options.year,
    sport: options.sport
  })

  return this.reset(options.flatBracket)
}

Validator.prototype.reset = function (flatBracket) {
  if (typeof flatBracket !== 'string') flatBracket = ''
  this.flatBracket = flatBracket.toUpperCase()
  return this
}

Validator.prototype.validate = function (flatBracket) {
  flatBracket && this.reset(flatBracket)
  var result = this.flatBracket
  var self = this

  // Test expansion from flat to JSON
  result = findResult(this.expandFlatBracket(result, this.options.allowEmpty))
  if (hasError(result)) return getErrors(result)

  // Test if JSON has all the keys
  result = findResult(this.hasNecessaryKeys(result))
  if (hasError(result)) return getErrors(result)

  // Picks to arrays
  result = findResult(_map(result, this.picksToArray.bind(this)))
  if (hasError(result)) return getErrors(result)

  // Array to nested array
  result = findResult(_map(result, this.getRounds.bind(this)))
  if (hasError(result)) return getErrors(result)

  // All regions have valid picks
  result = findResult(_map(result, this.validatePicks.bind(this)))
  if (hasError(result)) return getErrors(result)

  // Final region has valid picks
  result = findResult(this.validateFinal(_find(result, function (item) { return item.id === self.bracketData.constants.FINAL_ID }), result))
  if (hasError(result)) return getErrors(result)

  // Testing only return flat bracktet
  if (this.options.testOnly) return this.flatBracket

  // Decorate with data
  result = findResult(this.decorateValidated(result))
  if (hasError(result)) return getErrors(result)

  return result
}

Validator.prototype.expandFlatBracket = function (flat, allowEmpty) {
  if (!allowEmpty && flat.indexOf(this.bracketData.constants.UNPICKED_MATCH) > -1) {
    return wrapError('Bracket has unpicked matches')
  }

  var length = this.bracketData.regex.source.split('(').length
  var range = _range(1, length)
  var replacer = _map(range, function (i) {
    var prepend = (i === 1) ? '{"$' : ''
    var append = (i % 2) ? '":"$' : ((i < length - 1) ? '","$' : '"}')
    return prepend + i + append
  }).join('')

  try {
    return wrapSuccess(JSON.parse(flat.replace(this.bracketData.regex, replacer)))
  } catch (e) {
    return wrapError('Bracket does not look like a bracket')
  }
}

Validator.prototype.hasNecessaryKeys = function (obj) {
  var hasKeys = _keys(obj)
  var hasAllKeys = !!(this.bracketData.constants.ALL_IDS.length === hasKeys.length && _difference(this.bracketData.constants.ALL_IDS, hasKeys).length === 0)

  if (hasAllKeys) {
    return wrapSuccess(obj)
  }
  return wrapError('Bracket does not have the corret keys. Missing:', _difference(this.bracketData.constants.ALL_IDS, hasKeys).join(','))
}

Validator.prototype.decorateValidated = function (bracket) {
  var decorated = {}
  var self = this

  _each(bracket, function (region) {
    decorated[region.id] = _extend({}, region, self.bracketData.bracket.regions[region.id] || self.bracketData.bracket[self.bracketData.constants.FINAL_ID])
    decorated[region.id].rounds = _map(region.rounds, function (round) {
      var returnRound = []
      _each(round, function (seed, index) {
        if (seed === self.bracketData.constants.UNPICKED_MATCH) {
          returnRound[index] = null
        } else if (region.id === self.bracketData.constants.FINAL_ID) {
          var winningTeam = winningTeamFromRegion(bracket, seed)

          if (winningTeam === self.bracketData.constants.UNPICKED_MATCH) {
            returnRound[index] = null
          } else {
            returnRound[index] = {
              fromRegion: seed,
              seed: winningTeam,
              name: self.teamNameFromRegion(seed, winningTeam)
            }
          }
        } else {
          returnRound[index] = {
            fromRegion: region.id,
            seed: seed,
            name: self.teamNameFromRegion(region.id, seed)
          }
        }
      })
      return returnRound
    })
  })

  return wrapSuccess(decorated)
}

Validator.prototype.teamNameFromRegion = function (regionName, seed) {
  return this.bracketData.bracket.regions[regionName].teams[seed - 1]
}

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
Validator.prototype.validatePicks = function (options) {
  options = options || {}

  var self = this

  var rounds = options.rounds || []
  var regionName = options.id
  var length = rounds.length
  var regionPicks = {}
  var errors = []

  _each(rounds, function (round, i) {
    var requiredLength = (Math.pow(2, length - 1) / Math.pow(2, i))
    var nextRound = rounds[i + 1]
    var correctLength = (round.length === requiredLength)
    var lastItem = (i === length - 1)
    var thisRoundPickedGames = _without(round, self.bracketData.constants.UNPICKED_MATCH)
    var nextRoundPickedGames = (nextRound) ? _without(nextRound, self.bracketData.constants.UNPICKED_MATCH) : []
    var nextRoundIsSubset = (!lastItem && _subset(nextRoundPickedGames, thisRoundPickedGames))

    if (correctLength && (lastItem || nextRoundIsSubset)) {
      regionPicks.id = options.id
      regionPicks.rounds = rounds
    } else if (!correctLength) {
      errors.push('Incorrect number of pick in:', regionName, i + 1)
    } else if (!nextRoundIsSubset) {
      errors.push('Round is not a subset of previous:', regionName, i + 2)
    }
  })

  return (!errors.length) ? wrapSuccess(regionPicks) : wrapError(errors)
}

    // Takes an array of values and removes all invalids
    // return an array or arrays where each subarray is one round
Validator.prototype.getRounds = function (options) {
  var self = this

  options = options || {}

  var rounds = options.picks || []
  var regionName = options.id || ''
  var length = rounds.length + 1
  var retRounds = [(regionName === this.bracketData.constants.FINAL_ID) ? this.bracketData.constants.REGION_IDS : this.bracketData.order]
  var verify = function (arr, keep) {
    // Compacts the array and remove all duplicates that are not "X"
    return _compact(_uniqBy(arr, function (n) { return (_indexOf(keep, n) > -1) ? n + Math.random() : n }))
  }
  var checkVal = function (val) {
    var num = parseInt(val, 10)
    if (num >= 1 && num <= self.bracketData.constants.TEAMS_PER_REGION) {
      return num
    } else if (val === self.bracketData.constants.UNPICKED_MATCH) {
      return val
    } else if (_include(self.bracketData.constants.REGION_IDS, val)) {
      return val
    } else {
      return 0
    }
  }

  while (length > 1) {
    length = length / 2
    var roundGames = verify(_map(rounds.splice(0, Math.floor(length)), checkVal), [this.bracketData.constants.UNPICKED_MATCH])
    retRounds.push(roundGames)
  }

  return retRounds.length ? wrapSuccess({rounds: retRounds, id: regionName}) : wrapError('Could not get rounds from:', regionName)
}

// Takes a string of the picks for a region and validates them
// Return an array of picks if valid or false if invalid
Validator.prototype.picksToArray = function (picks, regionName) {
  var self = this
  var rTestRegionPicks = null
  var regExpStr = ''
  var firstRoundLength = (regionName === this.bracketData.constants.FINAL_ID) ? this.bracketData.constants.REGION_COUNT : this.bracketData.constants.TEAMS_PER_REGION
  var replacement = '$' + _range(1, firstRoundLength).join(',$')
  var seeds = (regionName === this.bracketData.constants.FINAL_ID) ? this.bracketData.constants.REGION_IDS : this.bracketData.order
  var regExpJoiner = function (arr, reverse) {
    var newArr = (reverse) ? arr.reverse() : arr
    return '(' + newArr.join('|') + '|' + self.bracketData.constants.UNPICKED_MATCH + ')'
  }
  var backref = function (i) {
    return regExpJoiner(_map(_range(i, i + 2), function (n) { return '\\' + n }), true)
  }

  var i

  if (regionName === this.bracketData.constants.FINAL_ID) {
    // Allow order independent final picks, we'll validate against matchups later
    for (i = 0; i < this.bracketData.constants.REGION_COUNT - 1; i++) {
      regExpStr += regExpJoiner(seeds.slice(0, this.bracketData.constants.REGION_COUNT))
      if (i > 0 && i === this.bracketData.constants.REGION_COUNT - 1) {
        regExpStr += backref(1)
      }
    }
  } else {
    // Create capture groups for the first round of the region
    for (i = 0; i < firstRoundLength; i += 2) {
      regExpStr += regExpJoiner(seeds.slice(i, i + 2))
    }
    // Create capture groups using backreferences for the capture groups above
    for (i = 1; i < firstRoundLength - 2; i += 2) {
      regExpStr += backref(i)
    }
  }

  rTestRegionPicks = new RegExp(regExpStr)

  if (rTestRegionPicks.test(picks)) {
    return wrapSuccess({picks: picks.replace(rTestRegionPicks, replacement).split(','), id: regionName})
  } else {
    return wrapError('Unable to parse picks in region:', regionName)
  }
}

Validator.prototype.validateFinal = function (finalPicks, validatedRounds) {
  var semifinal = finalPicks.rounds[1]

  if (_include(semifinal, this.bracketData.constants.UNPICKED_MATCH)) {
    return wrapSuccess(validatedRounds)
  }

  for (var i = 0, m = validatedRounds.length; i < m; i++) {
    var regionId = validatedRounds[i].id
    var regionWinner = _last(validatedRounds[i].rounds)[0]
    if (regionId !== this.bracketData.constants.FINAL_ID && regionWinner === this.bracketData.constants.UNPICKED_MATCH && _include(semifinal, regionId)) {
      return wrapError('Final teams are selected without all regions finished')
    }
  }

  var playingItself = (semifinal[0] === semifinal[1])
  var playingWrongSide = (this.bracketData.bracket.regions[semifinal[0]].sameSideAs === semifinal[1])

  if (!_subset(semifinal, this.bracketData.constants.REGION_IDS)) {
    return wrapError('The championship game participants are invalid.')
  } else if (playingItself || playingWrongSide) {
    return wrapError('The championship game participants are from the same side of the bracket.')
  } else {
    return wrapSuccess(validatedRounds)
  }
}

module.exports = Validator
