import type { BracketData } from "@bracketclub/data"

type Picks = {
  picks: string[]
  winsIn: (number | null)[]
  id: string
}

type Rounds = {
  rounds: (string | number)[][]
  winsIn: (number | null)[][]
  id: string
}

// const winningTeamFromRegion = (bracket, regionName) => {
//   return _last(_find(bracket, (b) => b.id === regionName).rounds)[0]
// }

function makeRange(start: number, stop: number, step: number = 1) {
  const res = []
  for (; start < stop; start += step) {
    res.push(start)
  }
  return res
}

const difference = (arr1: any[], arr2: any[]) =>
  arr1.filter((x) => !arr2.includes(x))

const compact = (arr: any[]) => arr.filter(Boolean)

const uniqBy = (arr: any[], fn: (x: any) => {}, set = new Set()) =>
  arr.filter((el) => ((v) => !set.has(v) && set.add(v))(fn(el)))

const without = (arr: any[], item: any) => arr.filter((a) => a !== item)

const subset = (small: any[], big: any[]) => {
  if (small.length === 0) return true
  return small.every((n) => big.includes(n))
}

const last = (arr: any[]) => arr[arr.length - 1]

class BracketValidationError extends Error {}

export const validate = (
  flatBracket: String,
  bracketData: BracketData,
  { allowEmpty = true } = {}
) => {
  // Test expansion from flat to JSON
  const expanded = expandFlatBracket(flatBracket, allowEmpty, bracketData)

  // Picks to arrays
  const result: { [key: string]: Rounds } = {}
  for (const [regionId, picks] of Object.entries(expanded)) {
    const picksArray = picksToArray(picks, regionId, bracketData)
    const rounds = getRounds(picksArray, bracketData)
    const validatedPicks = validatePicks(rounds, bracketData)
    result[regionId] = validatedPicks
  }

  // Final region has valid picks
  result[bracketData.constants.FINAL_ID] = validateFinal(
    result[bracketData.constants.FINAL_ID],
    result,
    bracketData
  )

  // // Decorate with data
  // result = decorateValidated(result, bracketData)

  // return result
}

const expandFlatBracket = (
  flat: String,
  allowEmpty: Boolean,
  bracketData: BracketData
): { [key: string]: string } => {
  if (!allowEmpty && flat.indexOf(bracketData.constants.UNPICKED_MATCH) > -1) {
    throw new BracketValidationError("Bracket has unpicked matches")
  }

  const { length } = bracketData.regex.source.split("(")
  const replacer = makeRange(1, length)
    .map((i) => {
      const prepend = i === 1 ? '{"$' : ""
      const append = i % 2 ? '":"$' : i < length - 1 ? '","$' : '"}'
      return prepend + i + append
    })
    .join("")

  let expandedBracket: { [key: string]: string } = {}
  try {
    expandedBracket = JSON.parse(flat.replace(bracketData.regex, replacer))
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error"
    throw new BracketValidationError(
      `Bracket does not look like a bracket: ${message}`
    )
  }

  const hasKeys = Object.keys(expandedBracket)
  const diffKeys = difference(bracketData.constants.ALL_IDS, hasKeys)
  const hasAllKeys =
    bracketData.constants.ALL_IDS.length === hasKeys.length &&
    diffKeys.length === 0

  if (!hasAllKeys) {
    throw new BracketValidationError(
      `Bracket does not have the corret keys. Missing: ${diffKeys.join(",")}`
    )
  }

  return expandedBracket
}

// Takes a string of the picks for a region and validates them
// Return an array of picks if valid or false if invalid
const picksToArray = (
  picks: string,
  regionName: string,
  bracketData: BracketData
) => {
  let rTestRegionPicks: RegExp
  let regExpGroups: string[] = []

  const bestOf = bracketData.constants.BEST_OF_RANGE
  const captureGroupCount = bestOf ? 2 : 1
  const firstRoundLength =
    regionName === bracketData.constants.FINAL_ID
      ? bracketData.constants.REGION_COUNT
      : bracketData.constants.TEAMS_PER_REGION
  const replacement =
    "$" +
    makeRange(1, bestOf ? firstRoundLength * 2 - 1 : firstRoundLength).join(
      ",$"
    )
  const seeds =
    regionName === bracketData.constants.FINAL_ID
      ? bracketData.constants.REGION_IDS
      : bracketData.constants.ORDER

  const regExpJoiner = (arr: any[], reverse = false) => {
    const newArr = reverse ? arr.reverse() : arr
    return (
      "(" + newArr.join("|") + "|" + bracketData.constants.UNPICKED_MATCH + ")"
    )
  }

  const backref = (start: number, stop: number, step = 1) => {
    // stop + 1 is so its inclusive
    return regExpJoiner(
      makeRange(start, stop + 1, step).map((n) => {
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
    regExpGroups = regExpGroups.reduce((memo, group) => {
      memo.push(group)
      memo.push("(" + bestOf.join("|") + ")?")
      return memo
    }, [] as string[])
  }

  rTestRegionPicks = new RegExp(regExpGroups.join(""))

  if (rTestRegionPicks.test(picks)) {
    const matchPicks: string[] = []
    const winsInPicks: (number | null)[] = []

    picks
      .replace(rTestRegionPicks, replacement)
      .split(",")
      .forEach((pick, index) => {
        if (bestOf && index % 2) {
          winsInPicks.push(pick ? +pick : null)
        } else {
          matchPicks.push(pick)
        }
      })

    return {
      picks: matchPicks,
      winsIn: winsInPicks,
      id: regionName,
    }
  }

  throw new BracketValidationError(
    `Unable to parse picks in region: ${regionName}`
  )
}

// Takes an array of values and removes all invalids
// return an array or arrays where each subarray is one round
const getRounds = (options: Picks, bracketData: BracketData) => {
  const rounds = options.picks || []
  const winsIn = options.winsIn || []
  const regionName = options.id || ""
  let length = rounds.length + 1
  const retRounds = [
    regionName === bracketData.constants.FINAL_ID
      ? bracketData.constants.REGION_IDS
      : bracketData.constants.ORDER,
  ]

  const retWinsIn: any[][] = [[]]

  const verify = (arr: any[], keep: any[]) => {
    // Compacts the array and remove all duplicates that are not "X"
    return compact(
      uniqBy(arr, (n) => {
        return keep.indexOf(n) > -1 ? n + Math.random() : n
      })
    )
  }

  const checkVal = (val: string) => {
    const num = parseInt(val, 10)
    if (num >= 1 && num <= bracketData.constants.TEAMS_PER_REGION) {
      return num
    } else if (val === bracketData.constants.UNPICKED_MATCH) {
      return val
    } else if (bracketData.constants.REGION_IDS.includes(val)) {
      return val
    } else {
      return 0
    }
  }

  const checkWinsInVal = (val: number | null) => {
    if (val === null) {
      return null
    }
    if (bracketData.constants.BEST_OF_RANGE.indexOf(val) > -1) {
      return val
    } else {
      return null
    }
  }

  while (length > 1) {
    length = length / 2
    const roundGames = verify(
      rounds.splice(0, Math.floor(length)).map(checkVal),
      [bracketData.constants.UNPICKED_MATCH]
    )

    retWinsIn.push(winsIn.splice(0, Math.floor(length)).map(checkWinsInVal))
    retRounds.push(roundGames)
  }

  if (retRounds.length) {
    return { rounds: retRounds, winsIn: retWinsIn, id: regionName }
  }

  throw new BracketValidationError(`Could not get rounds from: ${regionName}`)
}

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
const validatePicks = (options: Rounds, bracketData: BracketData) => {
  const rounds = options.rounds || []
  const winsIn = options.winsIn || []
  const regionName = options.id
  const length = rounds.length
  const regionPicks: Rounds = {
    id: regionName,
    rounds: [],
    winsIn: [],
  }
  const errors: string[] = []

  rounds.forEach((round, i) => {
    const winsInThis = winsIn[i]
    const requiredLength = Math.pow(2, length - 1) / Math.pow(2, i)
    const nextRound = rounds[i + 1]
    const correctLength = round.length === requiredLength
    const lastItem = i === length - 1
    const thisRoundPickedGames = without(
      round,
      bracketData.constants.UNPICKED_MATCH
    )
    const nextRoundPickedGames = nextRound
      ? without(nextRound, bracketData.constants.UNPICKED_MATCH)
      : []
    const nextRoundIsSubset =
      !lastItem && subset(nextRoundPickedGames, thisRoundPickedGames)
    const winsInCorrect = winsInThis?.every((w) => {
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

  if (errors.length) {
    throw new BracketValidationError(errors.join(", "))
  }

  return regionPicks
}

const validateFinal = (
  finalPicks: Rounds,
  validatedRounds: { [key: string]: Rounds },
  bracketData: BracketData
) => {
  const semifinal = finalPicks.rounds[1]

  if (!semifinal) {
    throw new Error("X")
  }

  if (semifinal.includes(bracketData.constants.UNPICKED_MATCH)) {
    return validatedRounds
  }

  for (let i = 0, m = validatedRounds.length; i < m; i++) {
    const regionId = validatedRounds[i].id
    const regionWinner = last(validatedRounds[i].rounds)[0]
    if (
      regionId !== bracketData.constants.FINAL_ID &&
      regionWinner === bracketData.constants.UNPICKED_MATCH &&
      semifinal.includes(regionId)
    ) {
      throw new BracketValidationError(
        "Final teams are selected without all regions finished"
      )
    }
  }

  const playingItself = semifinal[0] === semifinal[1]
  const playingWrongSide =
    bracketData.bracket.regions[semifinal[0]].sameSideAs === semifinal[1]

  if (!subset(semifinal, bracketData.constants.REGION_IDS)) {
    throw new BracketValidationError(
      "The championship game participants are invalid."
    )
  }

  if (playingItself || playingWrongSide) {
    throw new BracketValidationError(
      "The championship game participants are from the same side of the bracket."
    )
  }

  return validatedRounds
}

// const decorateValidated = (bracket, bracketData) => {
//   const decorated = {}

//   _each(bracket, (region) => {
//     decorated[region.id] = _extend(
//       {},
//       region,
//       bracketData.bracket.regions[region.id] ||
//         bracketData.bracket[bracketData.constants.FINAL_ID]
//     )
//     decorated[region.id].rounds = _map(region.rounds, (round, roundIndex) => {
//       const returnRound = []
//       _each(round, (seed, index) => {
//         if (seed === bracketData.constants.UNPICKED_MATCH) {
//           returnRound[index] = null
//         } else if (region.id === bracketData.constants.FINAL_ID) {
//           const winningTeam = winningTeamFromRegion(bracket, seed)

//           if (winningTeam === bracketData.constants.UNPICKED_MATCH) {
//             returnRound[index] = null
//           } else {
//             returnRound[index] = {
//               fromRegion: seed,
//               seed: winningTeam,
//               winsIn: region.winsIn[roundIndex][index],
//             }
//             const name = teamNameFromRegion(seed, winningTeam, bracketData)
//             if (name != null) {
//               returnRound[index].name = name
//             }
//             if (roundIndex === 0 || returnRound[index].winsIn == null)
//               delete returnRound[index].winsIn
//           }
//         } else {
//           returnRound[index] = {
//             fromRegion: region.id,
//             seed: seed,
//             winsIn: region.winsIn[roundIndex][index],
//           }
//           const name = teamNameFromRegion(region.id, seed, bracketData)
//           if (name != null) {
//             returnRound[index].name = name
//           }
//           if (roundIndex === 0 || returnRound[index].winsIn == null)
//             delete returnRound[index].winsIn
//         }
//       })
//       return returnRound
//     })
//   })

//   return decorated
// }

// const teamNameFromRegion = (regionName, seed, bracketData) => {
//   return bracketData.bracket.regions[regionName]?.teams?.[seed - 1] ?? undefined
// }
