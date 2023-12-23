const { validate } = require("@bracketclub/validator")
const _each = require("lodash/forEach")
const _contains = require("lodash/includes")
const _findIndex = require("lodash/findIndex")
const _pick = require("lodash/pick")
const _cloneDeep = require("lodash/cloneDeep")

const eliminations = function () {
  const _eliminations = []
  return {
    push: function (g) {
      g && _eliminations.push(g.fromRegion + g.seed)
    },
    contains: function (g) {
      return g && _contains(_eliminations, g.fromRegion + g.seed)
    },
  }
}

const setDiffResult = ({
  eliminated,
  game,
  masterGame,
  status,
  bonusStatus,
  setResult,
}) => {
  if (bonusStatus === "incorrect" || bonusStatus === "correct") {
    setResult({ winsInCorrect: bonusStatus === "correct" })
  }

  if (masterGame) {
    setResult({ shouldBe: masterGame })
  }

  if (status === "incorrect") {
    setResult({ correct: false })
    eliminated.push(game)
  } else if (status === "correct") {
    setResult({ correct: true })
  } else if (status === "unplayed" && eliminated.contains(game)) {
    setResult({ eliminated: true })
  }
}

// Generic score method
const diff = (entry, master, bracketData) => {
  const validated = validate(entry, bracketData)
  const validatedMaster = validate(master, bracketData)
  return roundLoop(validated, validatedMaster, bracketData)
}

const roundLoop = (entry, master, bracketData) => {
  const results = _cloneDeep(entry)
  const eliminated = eliminations()

  _each(entry, function (region, regionId) {
    const isFinal = regionId === bracketData.constants.FINAL_ID
    _each(region.rounds, function (round, roundIndex) {
      if (roundIndex > 0 || isFinal) {
        _each(round, function (game, gameIndex) {
          const findOpponent = function (rounds, g) {
            const previousRound =
              rounds[isFinal && roundIndex === 0 ? roundIndex : roundIndex - 1]
            const gameIndex = _findIndex(
              previousRound,
              _pick(g, "fromRegion", "seed", "name")
            )
            return previousRound[
              gameIndex % 2 === 0 ? gameIndex + 1 : gameIndex - 1
            ]
          }

          const masterRounds = master[regionId].rounds
          const masterGame = masterRounds[roundIndex][gameIndex]
          const masterOpponent = findOpponent(masterRounds, masterGame)
          const opponent = findOpponent(region.rounds, game)

          let status
          let bonusStatus
          const defaultBonusStatus =
            masterGame && masterGame.winsIn ? "incorrect" : "unused"

          // Set the status of the result
          if (masterGame === null) {
            status = "unplayed"
            // If the game did not pick a winsIn or it does not apply then
            // consider it incorrect for the purposes of points remaining
            bonusStatus = game.winsIn ? "unplayed" : defaultBonusStatus
          } else if (game.name === masterGame.name) {
            status = "correct"
            // If both opponents and the winsIn match then the bonus is correct
            bonusStatus =
              opponent &&
              masterOpponent &&
              opponent.name === masterOpponent.name &&
              game.winsIn &&
              masterGame.winsIn &&
              game.winsIn === masterGame.winsIn
                ? "correct"
                : defaultBonusStatus
          } else {
            status = "incorrect"
            bonusStatus = defaultBonusStatus
          }

          setDiffResult({
            eliminated,
            game,
            masterGame,
            status,
            bonusStatus,
            setResult: (r) =>
              Object.assign(results[regionId].rounds[roundIndex][gameIndex], r),
          })
        })
      }
    })
  })

  return results
}

module.exports = { diff }
