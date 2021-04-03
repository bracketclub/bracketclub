/* eslint-env mocha */

var BracketGenerator = require('../index')
var assert = require('assert')
var year = '2013'
var sport = 'ncaam'
var chalk = 'MW185463721432121W185463721432121S185463721432121E185463721432121FFMWSMW'
var upsets = 'MW16912131114101516131415161516W16912131114101516131415161516S16912131114101516131415161516E16912131114101516131415161516FFWEE'
var BracketValidator = require('bracket-validator')
var bd = require('bracket-data')
var bracketData = bd({year: year, sport: sport})
var finalGames = bracketData.constants.REGION_COUNT - 1
var firstRoundGames = bracketData.order.length - 1
var _ = require('lodash')

var intToBinary = function (i, length) {
  typeof i === 'undefined' && (i = _.random(0, Math.pow(2, length)))
  return _.padStart((i).toString(2), length, '0')
}

var intToRegionBinary = _.partialRight(intToBinary, firstRoundGames)
var intToFinalBinary = _.partialRight(intToBinary, finalGames)

// Creates a bracket with one defined region and everything else random
var fullBracketBinary = function (i) {
  return [intToRegionBinary(i), intToRegionBinary(), intToRegionBinary(), intToRegionBinary(), intToFinalBinary()].join('')
}

describe('Bracket generator', function () {
  it('generates a flat string bracket', function () {
    var generator = new BracketGenerator({year: year, sport: sport})
    assert.equal(true, typeof generator.generate() === 'string')
  })

  it('generates an all lower seeded bracket', function () {
    var generator = new BracketGenerator({year: year, sport: sport, winners: 'lower'})
    assert.equal(generator.generate(), chalk)
  })

  it('generates an all higher seeded bracket', function () {
    var generator = new BracketGenerator({year: year, sport: sport, winners: 'higher'})
    assert.equal(generator.generate(), upsets)
  })

  it('generates a bracket from a binary string', function () {
    var generator = new BracketGenerator({year: year, sport: sport, winners: fullBracketBinary(4044)})
    var bracket = generator.generate()
    var validator = new BracketValidator({
      year: year,
      sport: sport,
      testOnly: true,
      allowEmpty: false,
      flatBracket: bracket
    })
    var validated = validator.validate()
    assert.equal(false, validated instanceof Error)
  })

  it('Can be reset', function () {
    var generator = new BracketGenerator({year: year, sport: sport})
    assert.equal(generator.generate('higher'), upsets)
    assert.equal(generator.generate('lower'), chalk)
    assert.notEqual(generator.generate('random'), chalk)
    assert.notEqual(generator.generate('random'), upsets)
  })

  it('Can be validated', function () {
    var generator = new BracketGenerator({year: year, sport: sport})
    var validator = new BracketValidator({
      year: year,
      sport: sport,
      testOnly: true,
      allowEmpty: false
    })
    assert.equal(false, validator.validate(generator.generate('lower')) instanceof Error)
    assert.equal(false, validator.validate(generator.generate('higher')) instanceof Error)
  })

  it('Random binary brackets can be validated', function () {
    var iterations = 2000
    var start = Math.max(0, Math.pow(2, firstRoundGames) - iterations)
    var stop = start + iterations
    for (var i = start, m = stop; i < m; i++) {
      (function (i) {
        var generator = new BracketGenerator({year: year, sport: sport, winners: fullBracketBinary(i)})
        var bracket = generator.generate()
        var validator = new BracketValidator({
          year: year,
          sport: sport,
          testOnly: true,
          allowEmpty: false,
          flatBracket: bracket
        })
        var validated = validator.validate()
        assert.equal(false, validated instanceof Error)
      })(i)
    }
  })

  it('Random brackets can be validated', function () {
    var iterations = 2000
    var start = Math.max(0, Math.pow(2, firstRoundGames) - iterations)
    var stop = start + iterations
    for (var i = start, m = stop; i < m; i++) {
      (function () {
        var generator = new BracketGenerator({year: year, sport: sport, winners: 'random'})
        var bracket = generator.generate()
        var validator = new BracketValidator({
          year: year,
          sport: sport,
          testOnly: true,
          allowEmpty: false,
          flatBracket: bracket
        })
        var validated = validator.validate()
        assert.equal(false, validated instanceof Error)
      })(i)
    }
  })
})

describe('NBA', function () {
  it('NBA brackets can be validated with bestof', function () {
    for (var i = 0, m = 1000; i < m; i++) {
      (function () {
        var generator = new BracketGenerator({year: '2016', sport: 'nba', winners: 'random'})
        var bracket = generator.generate()
        var testValidator = new BracketValidator({
          year: '2016',
          sport: 'nba',
          testOnly: true,
          allowEmpty: false,
          flatBracket: bracket
        }).validate()
        var bracketValidator = new BracketValidator({
          year: '2016',
          sport: 'nba',
          allowEmpty: false,
          flatBracket: bracket
        }).validate()

        assert.equal(false, testValidator instanceof Error)
        assert.equal(bracket, testValidator)

        _.each(bracketValidator, function (b) {
          _.each(b.rounds, function (r, i) {
            if (i > 0) {
              _.each(r, function (g) {
                assert.ok(g.winsIn)
                assert.equal(typeof g.winsIn, 'number')
              })
            }
          })
        })
      })(i)
    }
  })
})

describe('NHL', function () {
  it('NHL brackets can be validated with bestof', function () {
    for (var i = 0, m = 1000; i < m; i++) {
      (function () {
        var generator = new BracketGenerator({year: '2016', sport: 'nhl', winners: 'random'})
        var bracket = generator.generate()
        var testValidator = new BracketValidator({
          year: '2016',
          sport: 'nhl',
          testOnly: true,
          allowEmpty: false,
          flatBracket: bracket
        }).validate()
        var bracketValidator = new BracketValidator({
          year: '2016',
          sport: 'nhl',
          allowEmpty: false,
          flatBracket: bracket
        }).validate()

        assert.equal(false, testValidator instanceof Error)
        assert.equal(bracket, testValidator)

        _.each(bracketValidator, function (b) {
          _.each(b.rounds, function (r, i) {
            if (i > 0) {
              _.each(r, function (g) {
                assert.ok(g.winsIn)
                assert.equal(typeof g.winsIn, 'number')
              })
            }
          })
        })
      })(i)
    }
  })
})

describe('World Cup', function () {
  it('wc brackets can be validated with bestof', function () {
    for (var i = 0, m = 1000; i < m; i++) {
      (function () {
        var generator = new BracketGenerator({year: '2018', sport: 'wcm', winners: 'random'})
        var bracket = generator.generate()
        var testValidator = new BracketValidator({
          year: '2018',
          sport: 'wcm',
          testOnly: true,
          allowEmpty: false,
          flatBracket: bracket
        }).validate()
        var bracketValidator = new BracketValidator({
          year: '2018',
          sport: 'wcm',
          allowEmpty: false,
          flatBracket: bracket
        }).validate()

        assert.equal(false, testValidator instanceof Error)
        assert.equal(bracket, testValidator)

        _.each(bracketValidator, function (b) {
          _.each(b.rounds, function (r, i) {
            if (i > 0) {
              _.each(r, function (g) {
                assert.ok(g.winsIn)
                assert.equal(typeof g.winsIn, 'number')
                assert.ok(g.winsIn >= 1)
                assert.ok(g.winsIn <= 3)
              })
            }
          })
        })
      })(i)
    }
  })
})
