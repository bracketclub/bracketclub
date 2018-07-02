/* eslint-env mocha */

var assert = require('assert')
var _ = require('lodash')
var BracketScorer = require('../index')

describe('World Cup', function () {
  it('should diff with best of', function () {
    var sport = 'wcm'
    var year = '2018'
    var entry = 'L11422331112213R11422331112211FL1'
    var master = 'L11422331112213R11422331112211FL1'
    var diff = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year
    }).diff()

    _.each(diff, (region) => {
      _.each(region.rounds, (round, index) => {
        if (index > 0) {
          _.each(round, (game) => {
            assert.equal(game.correct, true)
            assert.equal(game.winsInCorrect, true)
          })
        }
      })
    })
  })

  it('should have the same ppr', function () {
    var sport = 'wcm'
    var year = '2018'
    var entry1 = 'L8252233251222R12412161136212FL2'
    var entry2 = 'L83522131513331R11412162116113FL2'
    var master = 'LXXXXXXXRXXXXXXXFX'

    var score1 = new BracketScorer({
      entry: entry1,
      master: master,
      sport: sport,
      year: year
    }).score(['standardPPR'])

    var score2 = new BracketScorer({
      entry: entry2,
      master: master,
      sport: sport,
      year: year
    }).score(['standardPPR'])

    assert.equal(score1, 480)
    assert.equal(score2, 492)
  })
})
