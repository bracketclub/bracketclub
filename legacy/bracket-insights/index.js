const _ = require("lodash")
const opts = require("./lib/opts")()
const getData = require("./lib/data")

// Anything can be passed in through yargs and makes it way to the script
// so define any defaults that need to always be assigned here
const argv = require("yargs")
  .default("dataDir", ".data")
  .default("scoring", "standard").argv

const script = require(`./scripts/${argv.script}`)
const after = script.after

const log = (str) => {
  if (str) console.log(str)
  console.log("=".repeat(50))
}

const replacer = (key, value) => {
  if (
    Array.isArray(value) &&
    value.every(_.overSome(_.isNumber, _.isString)) &&
    value.join(" ").length < 100
  ) {
    return `[${value.join(" -- ")}]`
  }

  return value
}

const stringify = (data) => {
  if (data instanceof Error) {
    return `Error: ${data.message}`
  }

  return JSON.stringify(data, replacer, 2)
    .replace(/"\[/g, "")
    .replace(/\]",?/g, "")
}

opts
  .map((o) => {
    const data = getData(_.assign({}, argv, o))
    if (data === null) return null
    return _.assign({ data: script(data) }, o)
  })
  .filter(Boolean)
  .forEach((o, index, arr) => {
    if (index === 0) log()

    log(`${o.sport} ${o.year}`)
    log(stringify(o.data))

    if (index === arr.length - 1 && after) {
      const afterData = after(arr)
      log(afterData.title)
      log(stringify(afterData.data))
    }
  })
