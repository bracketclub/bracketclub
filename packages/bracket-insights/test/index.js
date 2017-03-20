const test = require('tape')
const fs = require('fs')
const path = require('path')
const {exec} = require('child_process')
const _ = require('lodash')

const scripts = fs.readdirSync(path.join(__dirname, '../scripts')).reduce((acc, script) => {
  const name = script.replace('.js', '')
  acc[name] = script
  acc[_.kebabCase(name)] = script
  return acc
}, {})

const defaultArgs = '--sport ncaam --year 2013 --dataDir test/fixtures'

const exexScript = (index, args = '') => (t, cb = _.noop) => exec(`node index --script ${scripts[index]} ${defaultArgs} ${args}`, (err, stdout, stderr) => {
  t.notOk(err)
  t.notOk(stderr)
  t.ok(stdout)
  const lines = stdout.split('\n').filter(Boolean).filter((l) => !l.startsWith('===')).slice(1)
  cb({ lines, output: lines.join('\n') })
})

test('scripts work', (t) => {
  exexScript('average-percentile')(t)
  exexScript('best-finish')(t)
  exexScript('correct-by-region')(t)
  exexScript('possible-winners')(t)
  exexScript('winners-by-seed')(t)
  exexScript('yearly-upsets')(t)
  t.end()
})

test('user filter work', (t) => {
  exexScript('correct-by-region', '--user test1')(t, ({lines}) => {
    t.equal(lines.length, 7)
  })
  t.end()
})

test('master filter work', (t) => {
  exexScript('possible-winners', '--master 63')(t, ({lines}) => {
    t.equal(lines.length, 6)
  })
  exexScript('possible-winners', '--master -1')(t, ({lines}) => {
    t.equal(lines.length, 10)
  })
  t.end()
})
