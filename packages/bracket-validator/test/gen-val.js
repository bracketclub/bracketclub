/* global console: true */

var BracketGenerator = require('../lib/generator'),
    BracketValidator = require('../lib/validator'),
    _ = require('lodash'),
    _s = require('underscore.string'),
    assert = require('assert'),

    data = require('../data/ncaa-mens-basketball/data')(2012),
    CONSTS = require('../data/ncaa-mens-basketball/consts'),
    totalRegions = CONSTS.REGION_COUNT,
    finalGames = totalRegions - 1,
    firstRoundOrder = require('../data/ncaa-mens-basketball/order')(),
    firstRoundOrderLength = firstRoundOrder.length - 1,

    iterations = Math.pow(2, firstRoundOrderLength),

    intToBinary = function(i, length) {
      return _s.pad((i).toString(2), length, '0');
    },

    // Creates a bracket with one defined region and everything else random
    fullBracketBinary = function(i) {
      return intToBinary(i, firstRoundOrderLength) +
        intToBinary(_.random(0, iterations - 1), firstRoundOrderLength) +
        intToBinary(_.random(0, iterations - 1), firstRoundOrderLength) +
        intToBinary(_.random(0, iterations - 1), firstRoundOrderLength) +
        intToBinary(_.random(0, Math.pow(2, finalGames) - 1), finalGames);
    },

    i = 0;
/*
describe('ALL THE BRACKETS!', function() {
  for (i; i < iterations; i++) {
    (function(i) {
      it('the created and validated brackets should be equal', function(done) {
        var bg = new BracketGenerator({data: data, winners: fullBracketBinary(i)}),
            expanded = bg.bracketWithTeamInfo(),
            flat = bg.flatBracket(),
            bv = new BracketValidator({flatBracket: flat});

        bv.validate(function(err, res) {
          assert.equal(true, _.isEqual(expanded, res));
          done();
        });
      });
    })(i);
  }
});*/

describe('A few random brackets for good measure', function() {
  for (i; i < 20; i++) {
    (function(i) {
      it('the created and validated brackets should be equal', function(done) {
        var bg = new BracketGenerator({data: data, winners: 'random'}),
            expanded = bg.bracketWithTeamInfo(),
            flat = bg.flatBracket(),
            bv = new BracketValidator({flatBracket: flat});

        bv.validate(function(err, res) {
          assert.equal(true, _.isEqual(expanded, res));
          done();
        });
      });
    })(i);
  }
});

describe('Bad Brackets', function() {
  it('Champ game participants are illegal', function(done) {
    var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSWW',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('This bracket is garbage and shouldnt break anything', function(done) {
    var bracket = 'heyowhatsupinthehizzzzzzzouse123FF123FF',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('There is a first round game missing', function(done) {
    var bracket = 'EX85463721432121W185463721432121S185463721432121MW185463721432121FFSEE',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('There is a regional final missing', function(done) {
    var bracket = 'E185463721432121W185463721432121S18546372143212XMW185463721432121FFSEE',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Championship game participants are wtf', function(done) {
    var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSNX',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Wrong keys', function(done) {
    var bracket = 'N185463721432121W185463721432121S185463721432121MW185463721432121FFXXX',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Not subsets', function(done) {
    var bracket = 'E185463721432121W185463721432123S185463721432121MW185463721432121FFXXX',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Incorrect number of picks', function(done) {
    var bracket = 'E185463721432121W18546372143212S185463721432121MW185463721432121FFXXX',
        validator = new BracketValidator({flatBracket: bracket});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Bad types', function(done) {
    var validator = new BracketValidator({flatBracket: false});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Bad types', function(done) {
    var validator = new BracketValidator({flatBracket: ''});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Bad types', function(done) {
    var validator = new BracketValidator({flatBracket: null});

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });

  it('Bad types', function(done) {
    var validator = new BracketValidator();

    validator.validate(function(err, res) {
      console.log(err.message);
      assert.equal(true, err instanceof Error);
      assert.equal(true, res === null);
      done();
    });
  });



});