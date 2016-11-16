/* eslint-env mocha */

var BracketGenerator = require('bracket-generator')
var BracketValidator = require('../index')
var _ = require('lodash')
var assert = require('assert')
var year = '2013'
var sport = 'ncaam'

describe('A few random ncaa brackets', function () {
  for (var i = 0; i < 100; i++) {
    (function () {
      it('the created and flat brackets should be equal', function () {
        var bg = new BracketGenerator({sport: sport, winners: 'random', year: year})
        var flat = bg.generate()
        var bv = new BracketValidator({flatBracket: flat, year: year, sport: sport, testOnly: true}).validate()
        var v = new BracketValidator({flatBracket: flat, year: year, sport: sport}).validate()
        assert.equal(flat, bv)
        assert.equal(false, bv instanceof Error)
        _.each(v, function (region) {
          _.each(region.rounds, function (round) {
            _.each(round, function (team) {
              assert.ok(team.seed)
              assert.ok(team.name)
              assert.ok(team.fromRegion)
              assert.ok(!team.winsIn)
              assert.equal(typeof team.seed, 'number')
              assert.equal(typeof team.name, 'string')
              assert.equal(typeof team.fromRegion, 'string')
              assert.equal(typeof team.winsIn, 'undefined')
            })
          })
        })
      })
    })()
  }
})

describe('A few random nhl brackets', function () {
  for (var i = 0; i < 100; i++) {
    (function () {
      it('the created and flat brackets should be equal', function () {
        var s = 'nhl'
        var y = '2016'
        var bg = new BracketGenerator({sport: s, winners: 'random', year: y})
        var flat = bg.generate()
        var bv = new BracketValidator({flatBracket: flat, year: y, sport: s, testOnly: true}).validate()
        var v = new BracketValidator({flatBracket: flat, year: y, sport: s}).validate()
        assert.equal(flat, bv)
        assert.equal(false, bv instanceof Error)
        _.each(v, function (region) {
          _.each(region.rounds, function (round) {
            _.each(round, function (team) {
              assert.ok(team.seed)
              assert.ok(team.name)
              assert.ok(team.fromRegion)
              assert.ok(!team.winsIn)
              assert.equal(typeof team.seed, 'number')
              assert.equal(typeof team.name, 'string')
              assert.equal(typeof team.fromRegion, 'string')
              assert.equal(typeof team.winsIn, 'undefined')
            })
          })
        })
      })
    })()
  }
})

describe('A few random nba brackets', function () {
  for (var i = 0; i < 100; i++) {
    (function () {
      it('the created and flat brackets should be equal', function () {
        var s = 'nba'
        var y = '2016'
        var bg = new BracketGenerator({sport: s, winners: 'random', year: y})
        var flat = bg.generate()
        var bv = new BracketValidator({flatBracket: flat, year: y, sport: s, testOnly: true}).validate()
        var v = new BracketValidator({flatBracket: flat, year: y, sport: s}).validate()
        assert.equal(flat, bv)
        assert.equal(false, bv instanceof Error)
        _.each(v, function (region) {
          _.each(region.rounds, function (round) {
            _.each(round, function (team) {
              assert.ok(team.seed)
              assert.ok(team.name)
              assert.ok(team.fromRegion)
              assert.ok(!team.winsIn)
              assert.equal(typeof team.seed, 'number')
              assert.equal(typeof team.name, 'string')
              assert.equal(typeof team.fromRegion, 'string')
              assert.equal(typeof team.winsIn, 'undefined')
            })
          })
        })
      })
    })()
  }
})

describe('New validator has correct properties', function () {
  it('Has the four necessary properties and no more', function () {
    var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport})

    var hasOwnProperties = []
    var protoProperties = []

    for (var x in validator) {
      if (validator.hasOwnProperty(x)) {
        hasOwnProperties.push(x)
      } else {
        protoProperties.push(x)
      }
    }

    var expectedProto = [
      'reset',
      'validate',
      'expandFlatBracket',
      'hasNecessaryKeys',
      'decorateValidated',
      'teamNameFromRegion',
      'validatePicks',
      'getRounds',
      'picksToArray',
      'validateFinal'
    ]

    var expectedOwn = [
      'options',
      'bracketData',
      'flatBracket'
    ]

    assert.equal(protoProperties.length, expectedProto.length)
    assert.equal(hasOwnProperties.length, expectedOwn.length)

    assert.equal(_.isEqual(protoProperties, expectedProto), true)
    assert.equal(_.isEqual(hasOwnProperties, expectedOwn), true)
  })
})

describe('Incomplete Brackets', function () {
  it('Splits Correctly', function () {
    var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX'
    var v = new BracketValidator({flatBracket: bracket, year: year, sport: sport})
    var validator = v.validate()

    assert.equal(false, validator instanceof Error)
  })

  it('Should have an error if we dont want unfinished brackets', function () {
    var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX'
    var validator = new BracketValidator({flatBracket: bracket, allowEmpty: false, year: year, sport: sport}).validate()

    assert.equal(validator.message, 'Bracket has unpicked matches')
    assert.equal(true, validator instanceof Error)
  })
})

describe('Final four', function () {
  it('Regions dont need to be set for final four to be set', function () {
    var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX66 FF MW E E'.replace(/\s/g, '')
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(false, validator instanceof Error)
  })

  it('Teams cant win a game in final four without winning region', function () {
    var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX6X FF MW E E'.replace(/\s/g, '')
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
    assert.equal(validator.message, 'Final teams are selected without all regions finished')
  })
})

describe('Can be reset', function () {
  it('Teams cant win a game in final four without winning region', function () {
    var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX6X FF MW E E'.replace(/\s/g, '')
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport})

    var validated = validator.validate()
    assert.equal(true, validated instanceof Error)
    assert.equal(validated.message, 'Final teams are selected without all regions finished')

    validator.reset('MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX66 FF MW E E'.replace(/\s/g, ''))
    assert.equal(false, validator.validate() instanceof Error)

    validator.reset('sdfsdf')
    assert.equal(true, validator.validate() instanceof Error)

    assert.equal(false, validator.validate('MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX') instanceof Error)
  })
})

describe('Bad Brackets', function () {
  it('Champ game participants are illegal', function () {
    var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSEE'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('This bracket is garbage and shouldnt break anything', function () {
    var bracket = 'heyowhatsupinthehizzzzzzzouse123FF123FF'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('There is a first round game missing', function () {
    var bracket = 'EX85463721432121W185463721432121S185463721432121MW185463721432121FFSEE'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('There is a regional final missing', function () {
    var bracket = 'E185463721432121W185463721432121S18546372143212XMW185463721432121FFSEE'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Championship game participants are wtf', function () {
    var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSNX'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Wrong keys', function () {
    var bracket = 'N185463721432121W185463721432121S185463721432121MW185463721432121FFXXX'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Not subsets', function () {
    var bracket = 'E185463721432121W185463721432123S185463721432121MW185463721432121FFXXX'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Incorrect number of picks', function () {
    var bracket = 'E185463721432121W18546372143212S185463721432121MW185463721432121FFXXX'
    var validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Bad types', function () {
    var validator = new BracketValidator({flatBracket: false, allowEmpty: false, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Bad types', function () {
    var validator = new BracketValidator({flatBracket: '', allowEmpty: false, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Bad types', function () {
    var validator = new BracketValidator({flatBracket: null, allowEmpty: false, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Bad types', function () {
    var validator = new BracketValidator({allowEmpty: false, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })

  it('Bad types', function () {
    var validator = new BracketValidator({flatBracket: 'boop', allowEmpty: false, year: year, sport: sport}).validate()

    assert.equal(true, validator instanceof Error)
  })
})

var pickRounds = function (rounds, props) {
  return rounds.map(function (round) {
    return round.map(function (team) {
      return _.pick(team, props)
    })
  })
}

describe('NBA', function () {
  it('works with only two regions and with one region with winsIn', function () {
    var validator = new BracketValidator({flatBracket: 'W1423121E17472737172717FW', year: '2016', sport: 'nba'}).validate()

    assert.equal(false, validator instanceof Error)
    assert.deepEqual(pickRounds(validator.W.rounds, ['seed', 'winsIn']), [
      [
        { seed: 1 },
        { seed: 8 },
        { seed: 4 },
        { seed: 5 },
        { seed: 2 },
        { seed: 7 },
        { seed: 3 },
        { seed: 6 }
      ],
      [
        { seed: 1 },
        { seed: 4 },
        { seed: 2 },
        { seed: 3 }
      ],
      [
        { seed: 1 },
        { seed: 2 }
      ],
      [
        { seed: 1 }
      ]
    ])
    assert.deepEqual(pickRounds(validator.E.rounds, ['seed', 'winsIn']), [
      [
        { seed: 1 },
        { seed: 8 },
        { seed: 4 },
        { seed: 5 },
        { seed: 2 },
        { seed: 7 },
        { seed: 3 },
        { seed: 6 }
      ],
      [
        { seed: 1, winsIn: 7 },
        { seed: 4, winsIn: 7 },
        { seed: 2, winsIn: 7 },
        { seed: 3, winsIn: 7 }
      ],
      [
        { seed: 1, winsIn: 7 },
        { seed: 2, winsIn: 7 }
      ],
      [
        { seed: 1, winsIn: 7 }
      ]
    ])
    assert.deepEqual(validator.E.winsIn, [
      [],
      [7, 7, 7, 7],
      [7, 7],
      [7]
    ])
  })
})

describe('NHL', function () {
  it('works', function () {
    var validator = new BracketValidator({flatBracket: 'C133P122M122A122FPMM', year: '2016', sport: 'nhl'}).validate()

    assert.equal(false, validator instanceof Error)

    assert.deepEqual(validator.C.winsIn, [
      [],
      [null, null],
      [null]
    ])
  })

  // https://github.com/tweetyourbracket/bracket-validator/issues/9
  it('works with number of games picks', function () {
    var validator = new BracketValidator({flatBracket: 'C143737P152627M142526A172627FP7M6M6', year: '2016', sport: 'nhl'}).validate()

    assert.equal(false, validator instanceof Error)

    assert.deepEqual(validator.C.winsIn, [
      [],
      [4, 7],
      [7]
    ])

    assert.deepEqual(pickRounds(validator.C.rounds, ['seed', 'winsIn']), [
      [
        { seed: 1 },
        { seed: 4 },
        { seed: 2 },
        { seed: 3 }
      ],
      [
        { seed: 1, winsIn: 4 },
        { seed: 3, winsIn: 7 }
      ],
      [
        { seed: 3, winsIn: 7 }
      ]
    ])

    assert.deepEqual(validator.M.winsIn, [
      [],
      [4, 5],
      [6]
    ])

    assert.deepEqual(pickRounds(validator.M.rounds, ['seed', 'winsIn']), [
      [
        { seed: 1 },
        { seed: 4 },
        { seed: 2 },
        { seed: 3 }
      ],
      [
        { seed: 1, winsIn: 4 },
        { seed: 2, winsIn: 5 }
      ],
      [
        { seed: 2, winsIn: 6 }
      ]
    ])
  })

  // https://github.com/tweetyourbracket/bracket-validator/issues/9
  it('works with only first round number of picks', function () {
    var validator = new BracketValidator({flatBracket: 'C14373P15262M14252A17262FPMM', year: '2016', sport: 'nhl'}).validate()

    assert.equal(false, validator instanceof Error)

    assert.deepEqual(validator.C.winsIn, [
      [],
      [4, 7],
      [null]
    ])

    assert.deepEqual(pickRounds(validator.C.rounds, ['seed', 'winsIn']), [
      [
        { seed: 1 },
        { seed: 4 },
        { seed: 2 },
        { seed: 3 }
      ],
      [
        { seed: 1, winsIn: 4 },
        { seed: 3, winsIn: 7 }
      ],
      [
        { seed: 3 }
      ]
    ])

    assert.deepEqual(validator.M.winsIn, [
      [],
      [4, 5],
      [null]
    ])

    assert.deepEqual(pickRounds(validator.M.rounds, ['seed', 'winsIn']), [
      [
        { seed: 1 },
        { seed: 4 },
        { seed: 2 },
        { seed: 3 }
      ],
      [
        { seed: 1, winsIn: 4 },
        { seed: 2, winsIn: 5 }
      ],
      [
        { seed: 2 }
      ]
    ])
  })
})
