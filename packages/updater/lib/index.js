const validator = require("@bracketclub/validator")
const _extend = require("lodash/assign")
const _pick = require("lodash/pick")
const _find = require("lodash/find")
const _findIndex = require("lodash/findIndex")
const _each = require("lodash/forEach")
const _map = require("lodash/map")
const _isNumber = require("lodash/isNumber")
const _isArray = require("lodash/isArray")
const _values = require("lodash/values")
const _compact = require("lodash/compact")
const _intersection = require("lodash/intersection")
const _shuffle = require("lodash/shuffle")

const _constant = (item) => item

const allIndices = (arr, val) => {
  const indices = []
  let i = -1
  while ((i = arr.indexOf(val, i + 1)) !== -1) {
    indices.push(i)
  }
  return indices
}

const teamNameMatches = (team1, team2) => {
  let team1Name = team1 && team1.name
  let team1Names = team1 && team1.names
  let team2Name = team2 && team2.name
  let team2Names = team2 && team2.names

  if (!_isArray(team1Name)) {
    team1Name = [team1Name]
  }

  if (team1Names) {
    team1Name = team1Name.concat(team1Names)
  }

  team1Name = _compact(
    team1Name.map((name) => {
      return typeof name === "string" ? name.toLowerCase() : null
    })
  )

  if (!_isArray(team2Name)) {
    team2Name = [team2Name]
  }

  if (team2Names) {
    team2Name = team1Name.concat(team2Names)
  }

  team2Name = _compact(
    team2Name.map((name) => {
      return typeof name === "string" ? name.toLowerCase() : null
    })
  )

  if (team1Name.length && team2Name.length) {
    return _intersection(team1Name, team2Name).length > 0
  }

  return false
}

const seedMatches = (team1, team2) => {
  return team1 && team2 && parseInt(team1.seed) === parseInt(team2.seed)
}

const updater = (currentMaster, { winner, loser, fromRegion }, bracketData) => {
  if (typeof winner === "number" || !isNaN(winner))
    winner = { seed: parseInt(winner, 10) }
  if (typeof loser === "number" || !isNaN(loser))
    loser = { seed: parseInt(loser, 10) }
  if (typeof winner === "string" && isNaN(winner)) winner = { name: winner }
  if (typeof loser === "string" && isNaN(loser)) loser = { name: loser }

  // If we got passed in null or something, set the properties we need to not break
  if (!winner) winner = {}
  if (!loser) loser = {}
  if (!winner.name) winner.name = ""
  if (!loser.name) loser.name = ""

  return update(
    {
      winner,
      loser,
      fromRegion,
      validated: validator(currentMaster, bracketData),
    },
    bracketData
  )
}

const hasTeam = (team) => {
  return !!(team && (team.name || team.seed))
}

const isFinal = ({ fromRegion }, bracketData) => {
  const finalName = bracketData.constants.FINAL_NAME.toLowerCase()
  const finalFullname = bracketData.constants.FINAL_FULLNAME.toLowerCase()
  const finalId = bracketData.constants.FINAL_ID.toLowerCase()
  const region = fromRegion.toLowerCase()

  return region === finalName || region === finalFullname || region === finalId
}

const isChampionship = ({ fromRegion }, bracketData) => {
  const championshipName = bracketData.constants.FINAL_CHAMPIONSHIP_NAME
  return championshipName
    ? fromRegion.toLowerCase() === championshipName.toLowerCase()
    : false
}

const teamMatches = ({ fromRegion }, team1, team2, bracketData) => {
  if (isFinal({ fromRegion }, bracketData)) {
    return teamNameMatches(team1, team2)
  }

  if (team1?.seed && team2?.seed) {
    return seedMatches(team1, team2)
  }

  return teamNameMatches(team1, team2)
}

const gameMatches = (
  { fromRegion, winner: pickWinner, loser: pickLoser },
  winner,
  loser,
  bracketData
) => {
  return (
    teamMatches({ fromRegion }, winner, pickWinner, bracketData) &&
    teamMatches({ fromRegion }, loser, pickLoser, bracketData)
  )
}

const getWinnerInfo = ({ fromRegion, validated, winner }, bracketData) => {
  if (isFinal({ fromRegion }, bracketData)) {
    const finalTeams = validated[bracketData.constants.FINAL_ID].rounds[0]
    const finalTeam = _find(finalTeams, (team) => {
      return teamNameMatches(team, winner)
    })
    return { fromRegion: finalTeam.fromRegion }
  } else if (winner.seed) {
    return { seed: winner.seed }
  } else {
    return { name: winner.name, names: winner.names }
  }
}

const flatten = (bracket, bracketData) => {
  let flattenedBracket = ""
  _each(bracket, (bracketRegion) => {
    const regionString = _map(bracketRegion.rounds, (round, roundIndex) => {
      if (roundIndex === 0) return ""
      return _map(round, (roundGame) => {
        let roundValue
        const pc =
          roundGame && (roundGame.winsIn || roundGame.playedCompetitions)
        if (roundGame === null) {
          return bracketData.constants.UNPICKED_MATCH
        } else if (_isNumber(roundGame) || !isNaN(roundGame)) {
          roundValue = roundGame
        } else if (bracketRegion.id === bracketData.constants.FINAL_ID) {
          roundValue = roundGame.fromRegion
        } else if (roundGame.name || roundGame.names) {
          const indexByName = _findIndex(bracketRegion.teams, (t) => {
            return teamNameMatches({ name: t }, roundGame)
          })
          roundValue = indexByName > -1 ? indexByName + 1 : null
        } else {
          roundValue = roundGame.seed
        }
        const bor = (bracketData.constants.BEST_OF_RANGE || []).map((i) =>
          Number(i)
        )
        const emptyPc = !pc || bor.indexOf(Number(pc)) === -1
        return roundValue.toString() + (emptyPc ? "" : pc.toString())
      }).join("")
    })
      .join("")
      .replace(new RegExp(bracketData.constants.ORDER.join(""), "g"), "")
      .replace(
        new RegExp(_values(bracketData.constants.REGION_IDS).join(""), "g"),
        ""
      )
    flattenedBracket += bracketRegion.id + regionString
  })
  return flattenedBracket
}

const next = (currentMaster, random, bd) => {
  if (bd === undefined && typeof random === "object") {
    bd = random
    random = { order: false, winner: false }
  }

  const validated = validator(currentMaster, bd)
  if (validated instanceof Error) return validated

  const randomOrder =
    typeof random === "boolean" ? random : random && random.order
  const randomWinner =
    typeof random === "boolean" ? random : random && random.winner
  let nextGame

  const regionKeys = (randomOrder ? _shuffle : _constant)(
    bd.constants.REGION_IDS
  ).concat(bd.constants.FINAL_ID)

  _each(regionKeys, (regionKey) => {
    const region = validated[regionKey]
    const rounds = region.rounds

    _each(rounds, (round, roundIndex) => {
      const indices = allIndices(round, null)
      const game = indices.length
        ? (randomOrder ? _shuffle : _constant)(indices)[0]
        : null
      if (game !== null) {
        nextGame = {
          region: regionKey,
          regionId: region.id,
          round: roundIndex,
          game: game,
        }
        return false
      }
      return true
    })

    return !nextGame
  })

  if (nextGame) {
    const prevRound = validated[nextGame.region].rounds[nextGame.round - 1]
    return (randomWinner ? _shuffle : _constant)([
      _extend({}, prevRound[nextGame.game * 2], {
        fromRegion: nextGame.regionId,
      }),
      _extend({}, prevRound[nextGame.game * 2 + 1], {
        fromRegion: nextGame.regionId,
      }),
    ])
  }

  return null
}

const update = (
  { winner, loser, fromRegion, validated, ...restOptions },
  bracketData
) => {
  if (validated instanceof Error) return validated

  if (isChampionship({ fromRegion }, bracketData)) {
    fromRegion = bracketData.constants.FINAL_ID
  }

  // Looks up by id and then tries to find a match by name or fullname
  const region =
    validated[fromRegion] ||
    _find(validated, (item) => {
      const fromRegion = fromRegion.toLowerCase()
      const name = item.name && item.name.toLowerCase()
      const fullname = item.fullname && item.fullname.toLowerCase()
      const id = item.id && item.id.toLowerCase()
      return name === fromRegion || fullname === fromRegion || id === fromRegion
    })

  if (!region) return new Error("No region")
  if (!hasTeam(winner)) return new Error("Supply at least winning team")

  let regionRoundIndex = null
  let nextRoundGameIndex = null
  let i, ii, m, mm, round, roundGame, otherTeam

  // eslint-disable-line no-labels
  roundLoop: for (i = region.rounds.length; i-- > 0; ) {
    round = region.rounds[i]
    for (ii = round.length; ii-- > 0; ) {
      roundGame = round[ii]
      otherTeam = round[ii % 2 === 0 ? ii + 1 : ii - 1]

      if (roundGame !== null) {
        if (
          hasTeam(winner) &&
          hasTeam(loser) &&
          gameMatches(
            { fromRegion, winner, loser },
            roundGame,
            otherTeam,
            bracketData
          )
        ) {
          // If we have a winner and a loser look for the game that matches both
          // Place winner into the next round
          regionRoundIndex = i + 1
          nextRoundGameIndex = Math.floor(ii / 2)
          break roundLoop // eslint-disable-line no-labels
        } else {
          // If there is no other team, it means we want to use the winner of the latest game they appear
          // So if a user is picking a bracket, a winner can be picked without an opponent
          if (
            teamMatches({ fromRegion }, roundGame, winner, bracketData) &&
            !hasTeam(loser)
          ) {
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
    const hasRound = !!region.rounds[regionRoundIndex]
    if (hasRound) {
      region.rounds[regionRoundIndex][nextRoundGameIndex] = _extend(
        getWinnerInfo({ fromRegion, validated, winner }, bracketData),
        _pick(restOptions, "playedCompetitions")
      )
      for (i = regionRoundIndex, m = region.rounds.length; i < m; i++) {
        round = region.rounds[i]
        for (ii = 0, mm = round.length; ii < mm; ii++) {
          roundGame = round[ii]
          otherTeam = round[ii % 2 === 0 ? ii + 1 : ii - 1]
          // The losing team might have already advanced in the bracket
          // Such as when someone is picking a bracket and changed their mind
          // We need to remove all of the losing team from the rest of the rounds
          if (
            hasTeam(loser) &&
            roundGame !== null &&
            teamMatches({ fromRegion }, roundGame, this.loser, bracketData)
          ) {
            round[ii] = null
          }
        }
      }
    }
  }

  // Clear losing teams from final four also
  const isFinalRegion = fromRegion === bracketData.constants.FINAL_ID
  if (
    hasTeam(loser) &&
    (!isFinalRegion || (isFinalRegion && regionRoundIndex === 1))
  ) {
    const fin = validated[bracketData.constants.FINAL_ID]
    _each(fin.rounds, (round, i) => {
      if (i > 0) {
        _each(round, (game, ii) => {
          if (game && teamNameMatches(game, loser)) {
            validated[bracketData.constants.FINAL_ID].rounds[i][ii] = null
          }
        })
      }
    })
  }

  return flatten(validated, bracketData)
}

module.exports = {
  update: updater,
  next: next,
  nextRandom: (bracket, bd) => next(bracket, true, bd),
}
