import { each } from 'lodash'

export const eachGame = (bracket, iterator, returnOnMatch = false) => {
  let match

  each(bracket, (region) => {
    each(region.rounds, (round, roundIndex) => {
      each(round, (game, gameIndex) => {
        if (roundIndex === 0) return false
        match = iterator({ game, gameIndex, region, roundIndex, prevRound: region.rounds[roundIndex - 1] })
        return returnOnMatch ? !match : true
      })
      return returnOnMatch ? !match : true
    })
    return returnOnMatch ? !match : true
  })

  return returnOnMatch ? match : null
}

export const nextGame = (...args) => eachGame(...args, true)
