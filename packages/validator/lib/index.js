const _all = require("lodash/every")
const _include = require("lodash/includes")
const _map = require("lodash/map")
const _range = require("lodash/range")
const _keys = require("lodash/keys")
const _difference = require("lodash/difference")
const _isArray = require("lodash/isArray")
const _some = require("lodash/some")
const _every = require("lodash/every")
const _filter = require("lodash/filter")
const _find = require("lodash/find")
const _each = require("lodash/forEach")
const _extend = require("lodash/assign")
const _last = require("lodash/last")
const _without = require("lodash/without")
const _compact = require("lodash/compact")
const _uniqBy = require("lodash/uniqBy")
const _indexOf = require("lodash/indexOf")
const _reduce = require("lodash/reduce")

const _subset = (small, big) => {
  if (small.length === 0) return true
  return _all(small, (n) => _include(big, n))
}

const hasError = (result) => {
  return _isArray(result)
    ? _some(result, (r) => r instanceof Error)
    : result instanceof Error
}

const getErrors = (result) => {
  return _isArray(result)
    ? _filter(result, (r) => r instanceof Error)[0]
    : result
}

const findResult = (result) => {
  return _isArray(result) ? _map(result, "result") : result.result
}

const wrapError = (...args) => ({
  error: true,
  result: new Error(
    _map(args, (arg) =>
      typeof arg.message === "string" ? arg.message : arg.toString()
    ).join(" ")
  ),
})

const wrapSuccess = (result) => ({
  error: null,
  result: result,
})

const winningTeamFromRegion = (bracket, regionName) => {
  return _last(_find(bracket, (b) => b.id === regionName).rounds)[0]
}

const validate = (
  flatBracket,
  bracketData,
  { testOnly = false, allowEmpty = true } = {}
) => {
  let result = flatBracket

  // Test expansion from flat to JSON
  result = findResult(expandFlatBracket(result, allowEmpty, bracketData))
  if (hasError(result)) return getErrors(result)

  // Test if JSON has all the keys
  result = findResult(hasNecessaryKeys(result, bracketData))
  if (hasError(result)) return getErrors(result)

  // Picks to arrays
  result = findResult(
    _map(result, (picks, regionName) =>
      picksToArray(picks, regionName, bracketData)
    )
  )
  if (hasError(result)) return getErrors(result)

  // Array to nested array
  result = findResult(_map(result, (r) => getRounds(r, bracketData)))
  if (hasError(result)) return getErrors(result)

  // All regions have valid picks
  result = findResult(_map(result, (r) => validatePicks(r, bracketData)))
  if (hasError(result)) return getErrors(result)

  // Final region has valid picks
  result = findResult(
    validateFinal(
      _find(result, (item) => item.id === bracketData.constants.FINAL_ID),
      result,
      bracketData
    )
  )
  if (hasError(result)) return getErrors(result)

  // Testing only return flat bracktet
  if (testOnly) return flatBracket

  // Decorate with data
  result = findResult(decorateValidated(result, bracketData))
  if (hasError(result)) return getErrors(result)

  return result
}

const expandFlatBracket = (flat, allowEmpty, bracketData) => {
  if (!allowEmpty && flat.indexOf(bracketData.constants.UNPICKED_MATCH) > -1) {
    return wrapError("Bracket has unpicked matches")
  }

  const length = bracketData.regex.source.split("(").length
  const range = _range(1, length)
  const replacer = _map(range, (i) => {
    const prepend = i === 1 ? '{"$' : ""
    const append = i % 2 ? '":"$' : i < length - 1 ? '","$' : '"}'
    return prepend + i + append
  }).join("")

  try {
    return wrapSuccess(JSON.parse(flat.replace(bracketData.regex, replacer)))
  } catch (e) {
    return wrapError("Bracket does not look like a bracket")
  }
}

const hasNecessaryKeys = (obj, bracketData) => {
  const hasKeys = _keys(obj)
  const hasAllKeys = !!(
    bracketData.constants.ALL_IDS.length === hasKeys.length &&
    _difference(bracketData.constants.ALL_IDS, hasKeys).length === 0
  )

  if (hasAllKeys) {
    return wrapSuccess(obj)
  }
  return wrapError(
    "Bracket does not have the corret keys. Missing:",
    _difference(bracketData.constants.ALL_IDS, hasKeys).join(",")
  )
}

const decorateValidated = (bracket, bracketData) => {
  const decorated = {}

  _each(bracket, (region) => {
    decorated[region.id] = _extend(
      {},
      region,
      bracketData.bracket.regions[region.id] ||
        bracketData.bracket[bracketData.constants.FINAL_ID]
    )
    decorated[region.id].rounds = _map(region.rounds, (round, roundIndex) => {
      const returnRound = []
      _each(round, (seed, index) => {
        if (seed === bracketData.constants.UNPICKED_MATCH) {
          returnRound[index] = null
        } else if (region.id === bracketData.constants.FINAL_ID) {
          const winningTeam = winningTeamFromRegion(bracket, seed)

          if (winningTeam === bracketData.constants.UNPICKED_MATCH) {
            returnRound[index] = null
          } else {
            returnRound[index] = {
              fromRegion: seed,
              seed: winningTeam,
              winsIn: region.winsIn[roundIndex][index],
            }
            const name = teamNameFromRegion(seed, winningTeam, bracketData)
            if (name != null) {
              returnRound[index].name = name
            }
            if (roundIndex === 0 || returnRound[index].winsIn == null)
              delete returnRound[index].winsIn
          }
        } else {
          returnRound[index] = {
            fromRegion: region.id,
            seed: seed,
            winsIn: region.winsIn[roundIndex][index],
          }
          const name = teamNameFromRegion(region.id, seed, bracketData)
          if (name != null) {
            returnRound[index].name = name
          }
          if (roundIndex === 0 || returnRound[index].winsIn == null)
            delete returnRound[index].winsIn
        }
      })
      return returnRound
    })
  })

  return wrapSuccess(decorated)
}

const teamNameFromRegion = (regionName, seed, bracketData) => {
  return bracketData.bracket.regions[regionName]?.teams?.[seed - 1] ?? undefined
}

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
const validatePicks = (options, bracketData) => {
  const rounds = options.rounds || []
  const winsIn = options.winsIn || []
  const regionName = options.id
  const length = rounds.length
  const regionPicks = {}
  const errors = []

  _each(rounds, (round, i) => {
    const winsInThis = winsIn[i]
    const requiredLength = Math.pow(2, length - 1) / Math.pow(2, i)
    const nextRound = rounds[i + 1]
    const correctLength = round.length === requiredLength
    const lastItem = i === length - 1
    const thisRoundPickedGames = _without(
      round,
      bracketData.constants.UNPICKED_MATCH
    )
    const nextRoundPickedGames = nextRound
      ? _without(nextRound, bracketData.constants.UNPICKED_MATCH)
      : []
    const nextRoundIsSubset =
      !lastItem && _subset(nextRoundPickedGames, thisRoundPickedGames)
    const winsInCorrect = _every(winsInThis, (w) => {
      return w === null || bracketData.constants.BEST_OF_RANGE.indexOf(w) > -1
    })

    if (correctLength && winsInCorrect && (lastItem || nextRoundIsSubset)) {
      regionPicks.id = options.id
      regionPicks.rounds = rounds
      regionPicks.winsIn = winsIn
    } else if (!correctLength) {
      errors.push("Incorrect number of pick in: " + regionName + (i + 1))
    } else if (!nextRoundIsSubset) {
      errors.push("Round is not a subset of previous: " + regionName + (i + 2))
    } else if (!winsInCorrect) {
      errors.push(
        "Round has incorrect possible winsIn in: " + regionName + (i + 1)
      )
    }
  })

  return !errors.length ? wrapSuccess(regionPicks) : wrapError(errors)
}

// Takes an array of values and removes all invalids
// return an array or arrays where each subarray is one round
const getRounds = (options, bracketData) => {
  const rounds = options.picks || []
  const winsIn = options.winsIn || []
  const regionName = options.id || ""
  let length = rounds.length + 1
  const retRounds = [
    regionName === bracketData.constants.FINAL_ID
      ? bracketData.constants.REGION_IDS
      : bracketData.constants.ORDER,
  ]
  const retWinsIn = [[]]

  const verify = (arr, keep) => {
    // Compacts the array and remove all duplicates that are not "X"
    return _compact(
      _uniqBy(arr, (n) => {
        return _indexOf(keep, n) > -1 ? n + Math.random() : n
      })
    )
  }

  const checkVal = (val) => {
    const num = parseInt(val, 10)
    if (num >= 1 && num <= bracketData.constants.TEAMS_PER_REGION) {
      return num
    } else if (val === bracketData.constants.UNPICKED_MATCH) {
      return val
    } else if (_include(bracketData.constants.REGION_IDS, val)) {
      return val
    } else {
      return 0
    }
  }

  const checkWinsInVal = (val) => {
    if (bracketData.constants.BEST_OF_RANGE.indexOf(val) > -1) {
      return val
    } else {
      return null
    }
  }

  while (length > 1) {
    length = length / 2
    const roundGames = verify(
      _map(rounds.splice(0, Math.floor(length)), checkVal),
      [bracketData.constants.UNPICKED_MATCH]
    )
    retWinsIn.push(_map(winsIn.splice(0, Math.floor(length)), checkWinsInVal))
    retRounds.push(roundGames)
  }

  return retRounds.length
    ? wrapSuccess({ rounds: retRounds, winsIn: retWinsIn, id: regionName })
    : wrapError("Could not get rounds from:", regionName)
}

// Takes a string of the picks for a region and validates them
// Return an array of picks if valid or false if invalid
const picksToArray = (picks, regionName, bracketData) => {
  let rTestRegionPicks = null
  let regExpGroups = []
  const bestOf = bracketData.constants.BEST_OF_RANGE
  const captureGroupCount = bestOf ? 2 : 1
  const firstRoundLength =
    regionName === bracketData.constants.FINAL_ID
      ? bracketData.constants.REGION_COUNT
      : bracketData.constants.TEAMS_PER_REGION
  const replacement =
    "$" +
    _range(1, bestOf ? firstRoundLength * 2 - 1 : firstRoundLength).join(",$")
  const seeds =
    regionName === bracketData.constants.FINAL_ID
      ? bracketData.constants.REGION_IDS
      : bracketData.constants.ORDER
  const regExpJoiner = (arr, reverse) => {
    const newArr = reverse ? arr.reverse() : arr
    return (
      "(" + newArr.join("|") + "|" + bracketData.constants.UNPICKED_MATCH + ")"
    )
  }
  const backref = (start, stop, step) => {
    // stop + 1 is so its inclusive
    return regExpJoiner(
      _map(_range(start, stop + 1, step), (n) => {
        return "\\" + n
      }),
      true
    )
  }

  let i

  if (regionName === bracketData.constants.FINAL_ID) {
    // Allow order independent final picks, we'll validate against matchups later
    for (i = 0; i < bracketData.constants.REGION_COUNT - 1; i++) {
      regExpGroups.push(
        regExpJoiner(seeds.slice(0, bracketData.constants.REGION_COUNT))
      )
      if (i > 0 && i === bracketData.constants.REGION_COUNT - 1) {
        regExpGroups.push(backref(1, 2))
      }
    }
  } else {
    // Create capture groups for the first round of the region
    for (i = 0; i < firstRoundLength; i += 2) {
      regExpGroups.push(regExpJoiner(seeds.slice(i, i + 2)))
    }
    // Create capture groups using backreferences for the capture groups above
    for (
      i = 1;
      i < firstRoundLength * captureGroupCount - 2;
      i += 2 * captureGroupCount
    ) {
      regExpGroups.push(backref(i, i + captureGroupCount, captureGroupCount))
    }
  }

  if (bestOf) {
    regExpGroups = _reduce(
      regExpGroups,
      (memo, group) => {
        memo.push(group)
        memo.push("(" + bestOf.join("|") + ")?")
        return memo
      },
      []
    )
  }

  rTestRegionPicks = new RegExp(regExpGroups.join(""))

  if (rTestRegionPicks.test(picks)) {
    const matchPicks = []
    const winsInPicks = []

    _each(
      picks.replace(rTestRegionPicks, replacement).split(","),
      (pick, index) => {
        if (bestOf && index % 2) {
          winsInPicks.push(pick ? +pick : null)
        } else {
          matchPicks.push(pick)
        }
      }
    )

    return wrapSuccess({
      picks: matchPicks,
      winsIn: winsInPicks,
      id: regionName,
    })
  } else {
    return wrapError("Unable to parse picks in region:", regionName)
  }
}

const validateFinal = (finalPicks, validatedRounds, bracketData) => {
  const semifinal = finalPicks.rounds[1]

  if (_include(semifinal, bracketData.constants.UNPICKED_MATCH)) {
    return wrapSuccess(validatedRounds)
  }

  for (let i = 0, m = validatedRounds.length; i < m; i++) {
    const regionId = validatedRounds[i].id
    const regionWinner = _last(validatedRounds[i].rounds)[0]
    if (
      regionId !== bracketData.constants.FINAL_ID &&
      regionWinner === bracketData.constants.UNPICKED_MATCH &&
      _include(semifinal, regionId)
    ) {
      return wrapError("Final teams are selected without all regions finished")
    }
  }

  const playingItself = semifinal[0] === semifinal[1]
  const playingWrongSide =
    bracketData.bracket.regions[semifinal[0]].sameSideAs === semifinal[1]

  if (!_subset(semifinal, bracketData.constants.REGION_IDS)) {
    return wrapError("The championship game participants are invalid.")
  }

  if (playingItself || playingWrongSide) {
    return wrapError(
      "The championship game participants are from the same side of the bracket."
    )
  }

  return wrapSuccess(validatedRounds)
}

module.exports = { validate }
