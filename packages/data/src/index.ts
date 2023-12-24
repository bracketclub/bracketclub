import constants from "./constants.js"
import regex from "./regex.js"
import * as bracketData from "./data.js"

export type BestOf = number | string[]

export type BracketInputData = {
  regions: number
  order: number[]
  bestOf: BestOf
}

export const createData = (data: BracketInputData) => {
  const consts = constants(data)
  return {
    constants: consts,
    regex: regex(data, consts),
  }
}

export type BracketData = ReturnType<typeof createData>

export const data = bracketData
