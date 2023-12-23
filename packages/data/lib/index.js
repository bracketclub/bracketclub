const bracket = require("./bracket")
const constants = require("./constants")
const regex = require("./regex")

module.exports = (data, dataByRegion) => {
  const consts = constants(data)
  return {
    constants: consts,
    bracket: bracket(data, dataByRegion),
    regex: regex(data, consts),
  }
}
