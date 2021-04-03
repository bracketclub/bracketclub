import Scorer from "bracket-scorer"
import Updater from "bracket-updater"
import Data from "bracket-data"
import Validator from "bracket-validator"
import {
  each,
  pick,
  sortBy,
  find,
  sortedLastIndexOf,
  orderBy,
  filter,
} from "lodash"
import { eachGame, nextGame } from "./each-game"
import binaryCombinations from "./binary-combinations"

export default class Possibilities {
  constructor({ sport, year }) {
    this._scorer = new Scorer({ sport, year })
    this._updater = new Updater({ sport, year })
    this._validator = new Validator({ sport, year })
    this._unpicked = new RegExp(
      new Data({ sport, year }).constants.UNPICKED_MATCH,
      "g"
    )
  }

  best({ entry, master }) {
    let current = master
    const diff = this._scorer.diff({ entry, master })

    eachGame(diff, ({ game, region }) => {
      if (typeof game.correct === "undefined" && game.eliminated !== true) {
        current = this._updater.update({
          currentMaster: current,
          fromRegion: region.id,
          winner: pick(game, "seed", "name"),
          playedCompetitions: game.winsIn,
        })
      }
    })

    return current
  }

  bestScore({ entry, master, scoreType = "standard" }) {
    const best = this.best({ entry, master })
    return this._scorer.score(scoreType, { entry, master: best })
  }

  possibilities(options) {
    const bracket = typeof options === "string" ? options : this.best(options)
    const unpicked = bracket.match(this._unpicked) || []

    return binaryCombinations(unpicked.length).map((combo) => {
      return combo.reduce((memo, c) => {
        return this._updater.update({
          currentMaster: memo,
          ...nextGame(
            this._validator.validate(memo),
            ({ prevRound, game, region, roundIndex, gameIndex }) => {
              if (game === null) {
                return {
                  fromRegion: region.id,
                  winner: pick(prevRound[gameIndex * 2 + c], "seed", "name"),
                  playedCompetitions: prevRound[gameIndex * 2 + c].winsIn,
                }
              }
            }
          ),
        })
      }, bracket)
    })
  }

  finishes({ findEntry, entries, master, type, rank, scoreType = "standard" }) {
    const entry = find(entries, findEntry)
    const entryBracket = entry.bracket || entry
    const finishes = []
    let bestFinish = null

    // If only looking for the first winning entry, then return null if the entry's
    // best score isn't higher than the current leader
    if (type === "find") {
      const bestScore = this.bestScore({
        entry: entryBracket,
        master,
        scoreType,
      })
      const currentLeader = orderBy(
        this._scorer.score(scoreType, { entry: entries, master }),
        "score",
        "desc"
      )[0].score

      if (currentLeader > bestScore) {
        return bestFinish
      }
    }

    const possibilities =
      type === "all" ? master : { entry: entryBracket, master }

    each(this.possibilities(possibilities), (bracket) => {
      const scores = sortBy(
        this._scorer.score(scoreType, { entry: entries, master: bracket }),
        "score"
      )
      const scoredEntry = find(scores, findEntry)
      const entryRank =
        scores.length -
        sortedLastIndexOf(
          scores.map((s) => s.score),
          scoredEntry.score
        )
      const winner = scores[scores.length - 1]
      const behind = winner.score - scoredEntry.score

      const finish = {
        rank: entryRank,
        behind,
        bracket,
      }

      if (type === "find" && entryRank <= (rank || 1)) {
        bestFinish = finish
        return false
      }

      finishes.push(finish)
    })

    if (type === "find") {
      return bestFinish
    }

    const sortedFinishes = orderBy(finishes, ["rank", "behind"], ["asc", "asc"])

    return rank
      ? filter(sortedFinishes, ({ rank: entryRank }) => entryRank <= rank)
      : sortedFinishes
  }

  canWin(options) {
    // Will return the first occurrence of a winner entry
    return this.finishes({ ...options, type: "find", rank: 1 })
  }

  winners(options) {
    // Will return some winning possible finishes
    return this.finishes({ ...options, rank: 1 })
  }

  allWinners(options) {
    // Will return all winning brackets
    return this.finishes({ ...options, type: "all", rank: 1 })
  }
}
