const test = require('tape')
const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')
const _ = require('lodash')

const allScripts = fs.readdirSync(path.join(__dirname, '../scripts'))
  .map((script) => script.replace('.js', ''))

const scriptNames = allScripts.reduce((acc, script) => {
  acc[script] = script
  acc[_.kebabCase(script)] = script
  return acc
}, {})

const stringifyArgs = (obj) => Object.keys(obj).reduce((acc, key) => {
  return acc + `--${key} ${Array.isArray(obj[key]) ? obj[key].join(' ') : obj[key]} `
}, '')

const exexScript = (index, args = {}) => (t, cb = _.noop) => {
  const scriptArgs = Object.assign({
    sport: 'ncaam',
    year: '2013',
    dataDir: 'test/fixtures'
  }, args)

  exec(`node index --script ${scriptNames[index]} ${stringifyArgs(scriptArgs)}`, (err, stdout, stderr) => {
    t.notOk(err)
    t.notOk(stderr)
    t.ok(stdout)
    const lines = stdout.split('\n').filter(Boolean).filter((l) => !l.startsWith('===')).slice(1)
    cb(null, { lines, output: lines.join('\n') })
  })
}

test('all scripts work', (t) => {
  allScripts.forEach((script) => exexScript(script)(t))
  t.end()
})

test('all scripts work with all data', (t) => {
  allScripts.forEach((script) => exexScript(script, {years: '2012 2013 2014 2015 2016 2017', sports: 'ncaam ncaaw nba nhl'})(t, (err, {lines}) => {
    t.notOk(err)
    t.ok(lines.includes('ncaam 2014'))
  }))
  t.end()
})

test('user filter work', (t) => {
  exexScript('correct-by-region', {user: 'test1'})(t, (err, {lines}) => {
    t.notOk(err)
    t.equal(lines.length, 7)
  })
  t.end()
})

test('master filter work', (t) => {
  exexScript('possible-winners', {master: 63})(t, (err, {lines}) => {
    t.notOk(err)
    t.equal(lines.length, 6)
  })
  exexScript('possible-winners', {master: -1})(t, (err, {lines}) => {
    t.notOk(err)
    t.equal(lines.length, 10)
  })
  t.end()
})
