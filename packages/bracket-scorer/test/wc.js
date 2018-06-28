/* eslint-env mocha */

var assert = require('assert')
var _ = require('lodash')
var BracketScorer = require('../index')

describe('World Cup', function () {
  var sport = 'wcm'
  var year = '2018'

  it('should diff with best of', function () {
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
})
