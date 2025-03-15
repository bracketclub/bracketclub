import type { BracketData } from "../bracket-data/index.ts"
// import assert from "node:assert"
const assert = (v: any) => {
  if (!v) {
    throw new Error("assertion failed")
  }
}
// import { formatWithOptions } from "node:util"

// let debug: ((...args: any[]) => void) | null = (...args: any[]) =>
//   console.log(
//     "debug:validator",
//     formatWithOptions(
//       { colors: true, depth: Infinity, breakLength: 120 },
//       ...args
//     )
//   )
let debug: any = console.log
if (Math.random() !== 0) {
  debug = null
}

type Seed = number
type RegionId = string

type Picks = {
  picks: string[]
  id: string
}

export type Round = ([Seed, RegionId] | null)[]

export type Region = {
  rounds: Round[]
  id: string
}

function makeRange(start: number, stop: number, step: number = 1) {
  const res = []
  for (; start < stop; start += step) {
    res.push(start)
  }
  return res
}

const difference = (arr1: any[], arr2: any[]) =>
  arr1.filter((x) => !arr2.includes(x))

const uniqBy = (arr: any[], fn: (x: any) => {}, set = new Set()) =>
  arr.filter((el) => ((v) => !set.has(v) && set.add(v))(fn(el)))

const without = (arr: any[], item: any) => arr.filter((a) => a !== item)

const subset = (small: any[], big: any[]) => {
  if (small.length === 0) return true
  return small.every((n) => big.includes(n))
}

class BracketValidationError extends Error {}

export const validate = (
  flatBracket: string,
  bracketData: BracketData,
  { allowEmpty = true } = {}
) => {
  // Test expansion from flat to JSON
  debug?.("validate", { flatBracket, bracketData, allowEmpty })

  const { A, B, C, D, Z } = expandFlatBracket(
    flatBracket,
    allowEmpty,
    bracketData
  )

  assert(A)
  assert(B)
  assert(C)
  assert(D)
  assert(Z)

  const regions = [
    ["A", A],
    ["B", B],
    ["C", C],
    ["D", D],
  ] as const

  // Picks to arrays
  const regionsResult: { [key: string]: Region } = {}

  for (const [regionId, picks] of regions) {
    const picksArray = picksToArray(picks, regionId, bracketData)
    const rounds = getRounds(picksArray, bracketData)
    const validatedPicks = validatePicks(rounds, bracketData)
    regionsResult[regionId] = validatedPicks
  }

  debug?.({ regionsResult })

  const finalPicks = picksToArray(
    Z,
    bracketData.constants.FINAL_ID,
    bracketData
  )
  debug?.({ finalPicks })
  const finalRounds = getFinalRounds(
    finalPicks,
    {
      A: regionsResult.A?.rounds.at(-1)?.[0]?.[0]!,
      B: regionsResult.B?.rounds.at(-1)?.[0]?.[0]!,
      C: regionsResult.C?.rounds.at(-1)?.[0]?.[0]!,
      D: regionsResult.D?.rounds.at(-1)?.[0]?.[0]!,
    },
    bracketData
  )
  debug?.({ finalRounds })
  // const final = validateFinal()

  return { regions: Object.values(regionsResult), final: finalRounds }
}

const expandFlatBracket = (
  flat: string,
  allowEmpty: boolean,
  bracketData: BracketData
): { [key: string]: string } => {
  if (!allowEmpty && flat.includes(bracketData.constants.UNPICKED_MATCH)) {
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

    picks
      .replace(rTestRegionPicks, replacement)
      .split(",")
      .forEach((pick, index) => {
        if (bestOf && index % 2) {
          // winsInPicks.push(pick ? +pick : null)
        } else {
          matchPicks.push(pick)
        }
      })

    debug?.({ regionName, matchPicks })
    return {
      picks: matchPicks,
      id: regionName,
    }
  }

  throw new BracketValidationError(
    `Unable to parse picks in region: ${regionName}`
  )
}

// Takes an array of values and removes all invalids
// return an array or arrays where each subarray is one round
const getRounds = (options: Picks, bracketData: BracketData): Region => {
  const rounds = options.picks || []
  debug?.({ rounds })
  const regionName = options.id || ""
  let length = rounds.length + 1
  const retRounds: Round[] = [
    bracketData.constants.ORDER.map((pick) => [pick, regionName]),
  ]

  const verify = (arr: any[], keep: any[]) => {
    // Compacts the array and remove all duplicates that are not "X"
    return uniqBy(arr, (n) => {
      return keep.indexOf(n) > -1 ? n + Math.random() : n
    })
  }

  const checkVal = (val: string) => {
    const num = parseInt(val, 10)
    if (num >= 1 && num <= bracketData.constants.TEAMS_PER_REGION) {
      return [num, regionName]
    } else if (val === bracketData.constants.UNPICKED_MATCH) {
      return null
    } else {
      return 0
    }
  }

  while (length > 1) {
    length = length / 2
    const roundGames = verify(
      rounds.splice(0, Math.floor(length)).map(checkVal),
      [bracketData.constants.UNPICKED_MATCH]
    )

    debug?.({ length, roundGames })

    retRounds.push(roundGames)
  }

  debug?.({ retRounds })

  if (retRounds.length) {
    return { rounds: retRounds, id: regionName }
  }

  throw new BracketValidationError(`Could not get rounds from: ${regionName}`)
}

const getFinalRounds = (
  options: Picks,
  regionWinners: { [key: string]: number },
  bracketData: BracketData
): Region => {
  const rounds = options.picks || []
  debug?.({ rounds })
  const regionName = options.id || ""
  let length = rounds.length + 1
  const retRounds: Round[] = [
    bracketData.constants.REGION_IDS.map((regionId) => [
      regionWinners[regionId]!,
      regionId,
    ]),
  ]

  const verify = (arr: any[], keep: any[]) => {
    // Compacts the array and remove all duplicates that are not "X"
    return uniqBy(arr, (n) => {
      return keep.indexOf(n) > -1 ? n + Math.random() : n
    })
  }

  const checkVal = (val: string) => {
    if (val === bracketData.constants.UNPICKED_MATCH) {
      return null
    } else if (bracketData.constants.REGION_IDS.includes(val)) {
      return [regionWinners[val], val]
      // throw new Error("xxxxx")
      // return val
    } else {
      return 0
    }
  }

  while (length > 1) {
    length = length / 2
    const roundGames = verify(
      rounds.splice(0, Math.floor(length)).map(checkVal),
      [bracketData.constants.UNPICKED_MATCH]
    )

    debug?.({ length, roundGames })

    retRounds.push(roundGames)
  }

  debug?.({ retRounds })

  if (retRounds.length) {
    return { rounds: retRounds, id: regionName }
  }

  throw new BracketValidationError(`Could not get rounds from: ${regionName}`)
}

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
const validatePicks = (options: Region, bracketData: BracketData) => {
  const rounds = options.rounds || []
  const regionName = options.id
  const length = rounds.length
  const regionPicks: Region = {
    id: regionName,
    rounds: [],
  }
  const errors: string[] = []

  rounds.forEach((round, i) => {
    debug?.({ round, i })
    const requiredLength = Math.pow(2, length - 1) / Math.pow(2, i)
    const nextRound = rounds[i + 1]
    const correctLength = round.length === requiredLength
    const lastItem = i === length - 1
    const thisRoundPickedGames = without(
      round,
      null
      // bracketData.constants.UNPICKED_MATCH
    )
    const nextRoundPickedGames = nextRound ? without(nextRound, null) : []
    const nextRoundIsSubset =
      !lastItem && subset(nextRoundPickedGames, thisRoundPickedGames)

    if (correctLength && (lastItem || nextRoundIsSubset)) {
      regionPicks.id = options.id
      regionPicks.rounds = rounds
    } else if (!correctLength) {
      errors.push("Incorrect number of pick in: " + regionName + (i + 1))
    } else if (!nextRoundIsSubset) {
      // TODO: should check previous round to see if the two indices that could result
      // in this pick are picked and possible
      // errors.push("Round is not a subset of previous: " + regionName + (i + 2))
    }
  })

  if (errors.length) {
    throw new BracketValidationError(errors.join(", "))
  }

  return regionPicks
}

// TODO: validate the final region
// const validateFinal = (
//   finalPicks: Region,
//   validatedRounds: { [key: string]: Region },
//   bracketData: BracketData
// ) => {
//   const semifinal = finalPicks.rounds[1]

//   if (!semifinal) {
//     throw new Error("X")
//   }

//   if (semifinal.includes(bracketData.constants.UNPICKED_MATCH)) {
//     return finalPicks
//   }

//   // debug({ validatedRounds })

//   for (const round of Object.values(validatedRounds)) {
//     const regionId = round.id
//     const regionWinner = last(round.rounds)[0]
//     if (
//       regionId !== bracketData.constants.FINAL_ID &&
//       regionWinner === bracketData.constants.UNPICKED_MATCH &&
//       semifinal.includes(regionId)
//     ) {
//       throw new BracketValidationError(
//         "Final teams are selected without all regions finished"
//       )
//     }
//   }

//   const semifinalIndexes = semifinal.map((v) =>
//     bracketData.constants.REGION_IDS.indexOf(v)
//   )
//   // debug({ semifinal, semifinalIndexes })

//   const playingItself = semifinal[0] === semifinal[1]
//   const playingWrongSide = semifinalIndexes[0] + 1 === semifinalIndexes[1]
//   // bracketData.bracket.regions[semifinal[0]].sameSideAs === semifinal[1]

//   if (!subset(semifinal, bracketData.constants.REGION_IDS)) {
//     throw new BracketValidationError(
//       "The championship game participants are invalid."
//     )
//   }

//   if (playingItself || playingWrongSide) {
//     throw new BracketValidationError(
//       "The championship game participants are from the same side of the bracket."
//     )
//   }

//   return finalPicks
// }
