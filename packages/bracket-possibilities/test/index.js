import test from 'tape'
import _ from 'lodash'
import Scorer from 'bracket-scorer'
import Possibilities from '../src/index'

const CI = process.env.CI
const sport = 'ncaam'
const year = '2016'

const testCI = CI ? test : test.skip
const log = CI ? console.log.bind(console) : () => {}

test('compare', (t) => {
  const entry = 'S195411372141121111W19541131021532522E195463721437131MW19546141021562522FFSMWS'
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'

  const p = new Possibilities({ sport, year })
  const best = p.best({ entry, master })
  const bestScore = p.bestScore({ entry, master })
  const possibilities = p.possibilities({ entry, master })
  const scores = possibilities.map((p) => new Scorer({ sport, year }).standard({ entry, master: p }))

  t.equal(best, 'S195131137215321X1W181241131021432X22E19546147215671X1MW191241131015141110XXXFFSXS')
  t.equal(bestScore, 1240)
  t.equal(possibilities.length, 128)
  t.equal(typeof possibilities[0], 'string')
  t.equal(_.uniq(possibilities).length, 128)
  t.equal(scores.length, 128)
  t.equal(scores[0], 1240)
  t.equal(_.uniq(scores).length, 1)

  t.end()
})

test('compare NBA', (t) => {
  const entry = ' W  17  47  27  37  17  27  17  E  17  47  27  37  17  27  27  F  E7'.replace(/\s*/g, '')
  const master = 'W  87  47  27  37  X   X   X   E  87  47  27  37  X   X   X   F  X '.replace(/\s*/g, '')
  // Best Score =    0   13  13  13  0   31  0      0   13  13  13  0   31  50     100
  const sport = 'nba'
  const year = '2016'

  const p = new Possibilities({ sport, year })
  const best = p.best({ entry, master })
  const bestScore = p.bestScore({ entry, master })
  const possibilities = p.possibilities({ entry, master })
  const scores = possibilities.map((p) => new Scorer({ sport, year }).standard({ entry, master: p }))

  t.equal(best, 'W87472737X27XE87472737X2727FE7')
  t.equal(bestScore, 290)
  t.equal(possibilities.length, 8)
  t.equal(typeof possibilities[0], 'string')
  t.equal(_.uniq(possibilities).length, 8)
  t.equal(scores.length, 8)
  t.equal(scores[0], 290)
  t.equal(_.uniq(scores).length, 1)

  t.end()
})

testCI('can any user win', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const usernames = _.map(entries, ({ user }) => user.username)
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const outcomes = usernames.map((username) => {
    const timing = Date.now()
    const canWin = p.canWin({
      findEntry: ({ user }) => user.username === username,
      master,
      entries
    })
    log(Date.now() - timing, JSON.stringify(canWin))
    return { username, canWin }
  })

  const [winners, eliminated] = _.partition(outcomes, ({ canWin }) => !!canWin)

  t.equal(winners.length, 23)
  t.equal(eliminated.length, 12)
  t.equal(outcomes.length, entries.length)

  t.end()
})

testCI('can user win', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const winners = p.winners({
    findEntry: ({ user }) => user.username.toLowerCase() === 'oneatatime',
    master,
    entries
  })

  t.equal(winners.length, 914)

  t.end()
})

test('can user win gooley', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const winners = p.winners({
    findEntry: ({ user }) => user.username.toLowerCase() === 'tessatweettrain',
    master,
    entries,
    scoreType: 'gooley'
  })

  t.equal(winners.length, 2)

  t.end()
})

test('can user win all gooley', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const master = 'S1951311372153212XW18124113102143212XE195461472156716XMW191241131015141110110XFFXXX'
  const p = new Possibilities({ sport, year })

  const allWinners = p.allWinners({
    findEntry: ({ user }) => user.username.toLowerCase() === 'jvhurley',
    master,
    entries
  })

  const winners = p.winners({
    findEntry: ({ user }) => user.username.toLowerCase() === 'jvhurley',
    master,
    entries
  })

  t.equal(allWinners.length, 14)
  t.equal(winners.length, 2)

  t.end()
})

test('can user get top 5', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const finishes = p.finishes({
    findEntry: ({ user }) => user.username.toLowerCase() === 'lukekarryz',
    master,
    entries,
    rank: 5
  })

  t.equal(finishes.length, 116)

  t.end()
})

test('possibilities can take a string', (t) => {
  const master = 'S19513113721532122W181241131021432122E195461472156716XMW191241131015141110110XFFXXX'
  const p = new Possibilities({ sport, year })

  const possibilities = p.possibilities(master)

  t.equal(possibilities.length, 32)

  t.end()
})
