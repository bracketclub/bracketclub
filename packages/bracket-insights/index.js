const _ = require('lodash')
const opts = require('./lib/opts')()
const getData = require('./lib/data')
const argv = require('yargs').string('script').argv

const scriptName = argv.script
const script = require(`./scripts/${scriptName}`)
const after = script.after

const action = (o) => _.flowRight(script, getData)(o)

const log = (str) => {
  if (str) console.log(str)
  console.log('='.repeat(50))
}

const replacer = (key, value) => {
  if (Array.isArray(value) && value.every(_.overSome(_.isNumber, _.isString))) {
    return `[${value.join(', ')}]`
  }

  return value
}

opts
  .map((o) => _.assign({data: action(o)}, o))
  .forEach((o, index, arr) => {
    if (index === 0) log()

    log(o.sport, o.year)
    log(JSON.stringify(o.data, replacer, 2))

    if (index === arr.length - 1 && arr.length > 1 && after) {
      const afterData = after(arr)
      log(afterData.title)
      log(JSON.stringify(afterData.data, replacer, 2))
    }
  })
