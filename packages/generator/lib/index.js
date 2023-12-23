const _isString = require("lodash/isString")
const _map = require("lodash/map")
const _random = require("lodash/random")
const _sample = require("lodash/sample")
const _uniq = require("lodash/uniq")
const _toArray = require("lodash/toArray")
const _difference = require("lodash/difference")
const _flatten = require("lodash/flatten")
const _last = require("lodash/last")
const _find = require("lodash/find")
const _filter = require("lodash/filter")
const _reduce = require("lodash/reduce")

const generate = (winners, bracketData) => {
  if (bracketData === undefined && typeof winners === "object") {
    bracketData = winners
    winners = "random"
  }
  const options = {
    winners,
    bracketData,
    counters: {
      winnerCounter: 0,
      regionCounter: 0,
      finishedRegions: [],
      generatedBracket: null,
    },
  }
  return _map(
    _flatten(_toArray(generateBracket(options))),
    (region) =>
      region.id + _flatten(addBestOfToRounds(region.rounds, options)).join("")
  )
    .join("")
    .replace(new RegExp(bracketData.constants.ORDER.join(""), "g"), "")
    .replace(new RegExp(generateFinalFour(options).join(""), "g"), "")
}

const generateBracket = (opts) => {
  if (opts.counters.generatedBracket === null) {
    opts.counters.generatedBracket = generateRegions(opts).concat(
      generateFinal(opts)
    )
  }
  return opts.counters.generatedBracket
}

const generateRegions = (o) => {
  o.counters.regionCounter = 0
  const regions = _map(
    _filter(o.bracketData.bracket.regions, (r) => !!r.teams),
    (region) => generateRegion(region, o)
  )
  o.counters.finishedRegions = regions
  return regions
}

const generateRegion = (region, o) => {
  o.counters.winnerCounter = 0
  return {
    id: region.id,
    rounds: generateRounds({ round: o.bracketData.constants.ORDER.slice() }, o),
  }
}

const generateFinal = (o) => {
  o.counters.winnerCounter = 0
  return {
    id: o.bracketData.constants.FINAL_ID,
    name: o.bracketData.constants.FINAL_NAME,
    rounds: generateRounds({ round: generateFinalFour(o) }, o),
  }
}

const generateRounds = (opts, o) => {
  var optRound = _toArray(opts.round)
  var round = generateRound({ seeds: opts.round }, o)
  var rounds = opts.rounds || []

  if (rounds.length === 0) {
    rounds.push(optRound)
  }
  rounds.push(_toArray(round))

  if (round.length === 1) {
    o.counters.regionCounter++
    return rounds
  } else {
    return generateRounds({ round: round, rounds: rounds }, o)
  }
}

const generateRound = ({ seeds, winners: optWinners }, o) => {
  const matchup = [seeds[0], seeds[1]]
  const winner = matchup[generateWinner(matchup, o)]
  const winners = (optWinners || []).concat(winner)
  const remainingSeeds = seeds.splice(2)

  o.counters.winnerCounter++

  if (remainingSeeds.length === 0) {
    return winners
  } else {
    return generateRound({ seeds: remainingSeeds, winners: winners }, o)
  }
}

const generateFinalFour = (o) => {
  const regions = o.bracketData.constants.REGION_IDS
  const firstTeam = regions[0]
  const matchup1 = [
    firstTeam,
    o.bracketData.bracket.regions[firstTeam].sameSideAs,
  ]
  const matchup2 = _difference(regions, matchup1)
  return _flatten([matchup1, matchup2])
}

const addBestOfToRounds = (rounds, o) => {
  const bestOf = o.bracketData.constants.BEST_OF_RANGE

  if (!bestOf) return rounds

  return _map(rounds, (round, index) => {
    if (index === 0) {
      return round
    } else {
      return _reduce(
        round,
        (acc, pick) => {
          acc.push(pick)
          acc.push(_sample(bestOf))
          return acc
        },
        []
      )
    }
  })
}

const winningTeamFromRegion = (fromRegion, o) => {
  const hasFinishedRegions = !!o.counters.finishedRegions.length
  const regions = hasFinishedRegions
    ? o.counters.finishedRegions
    : generateBracket(o)

  return _last(
    _find(regions, function (region) {
      return region.id === fromRegion
    }).rounds
  )[0]
}

const generateWinner = (matchup, o) => {
  if (_isString(matchup[0]) && _isString(matchup[1])) {
    matchup = _map(matchup, (region) => winningTeamFromRegion(region, o))
  }

  const possible = {
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
    },
  }

  const pickIndex =
    o.winners.length >= o.bracketData.constants.ORDER.length
      ? o.counters.regionCounter * (o.bracketData.constants.ORDER.length - 1) +
        (o.counters.winnerCounter + 1) -
        1
      : o.counters.winnerCounter

  const pick = o.winners.charAt(pickIndex)
  let winner

  if (pick === "1") {
    winner = possible.higher()
  } else if (pick === "0") {
    winner = possible.lower()
  } else if (typeof possible[o.winners] === "function") {
    winner = possible[o.winners]()
  } else if (typeof possible[o.winners] !== "undefined") {
    winner = possible[o.winners]
  }

  return winner >= 0 && winner < matchup.length ? winner : possible.random
}

module.exports = { generate }
