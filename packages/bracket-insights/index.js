const _ = require('lodash')
const opts = require('./lib/opts')()
const getData = require('./lib/data')
const argv = require('yargs').string('script').argv

const scriptName = argv.script
const script = require(`${__dirname}/scripts/${scriptName}`)
const after = script.after

const action = (o) => _.flowRight(script, getData)(o)

const spacer = '='.repeat(50)

const replacer = (key, value) => {
  if (Array.isArray(value) && value.every(_.overSome(_.isNumber, _.isString))) {
    return `[${value.join(', ')}]`
  }

  return value
}

;(Array.isArray(opts) ? opts : [opts])
  .map((o) => _.assign({data: action(o)}, o))
  .forEach((o, index, arr) => {
    if (index === 0) {
      console.log(spacer)
    }

    console.log(o.sport, o.year)
    console.log(spacer)

    console.log(JSON.stringify(o.data, replacer, 2))
    console.log(spacer)

    if (index === arr.length - 1 && arr.length > 1 && after) {
      const afterData = after(arr)

      console.log(afterData.title)
      console.log(spacer)

      console.log(JSON.stringify(afterData.data, replacer, 2))
      console.log(spacer)
    }
  })
