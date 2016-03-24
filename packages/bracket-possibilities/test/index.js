import test from 'tape'
import _ from 'lodash'
import Scorer from 'bracket-scorer'
import Possibilities from '../src/index'

const sport = 'ncaam'
const year = '2016'

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

test('can any user win', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const usernames = _.map(entries, ({ user }) => user.username)
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const outcomes = usernames.map((username) => {
    const canWin = p.canWin({
      findEntry: ({ user }) => user.username === username,
      master,
      entries
    })

    return { username, canWin }
  })

  const [winners, eliminated] = _.partition(outcomes, ({ canWin }) => !!canWin)

  console.log(winners.length, eliminated.length)

  t.equal(winners.length, 19)
  t.equal(eliminated.length, 16)
  t.equal(outcomes.length, entries.length)

  t.end()
})

test('can user win', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const winners = p.winners({
    findEntry: ({ user }) => user.username.toLowerCase() === 'oneatatime',
    master,
    entries
  })

  t.equal(winners.length, 878)

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

test.skip('can user get top 5', (t) => {
  const entries = require('./fixtures/entries-ncaam-2016')
  const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'
  const p = new Possibilities({ sport, year })

  const finishes = p.finishes({
    findEntry: ({ user }) => user.username.toLowerCase() === 'lukekarryz',
    master,
    entries,
    rank: 5
  })

  t.equal(finishes.length, 84)

  t.end()
})
