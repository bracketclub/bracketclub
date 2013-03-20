var assert = require('assert'),
    _ = require('lodash'),

    BracketScorer = require('../lib/score'),
    BracketGenerator = require('../lib/generator'),

    CONSTS = require('../data/ncaa-mens-basketball/consts');

describe('Bracket Scorer', function() {

  it('Should return an array with 6 values', function(done) {
    var noUpsets = new BracketGenerator({winners: 'lower'}),
        random = new BracketGenerator({winners: 'random'}),
        s = new BracketScorer({
          userBracket: random.flatBracket(),
          masterBracket: noUpsets.flatBracket()
        });

    s.getScore(function(err, res) {
      assert.equal(true, _.isArray(res));
      assert.equal(true, res.length === 6);
      done();
    });
  });

  it('Perfect score', function(done) {
    var noUpsets = new BracketGenerator({winners: 'higher'}),
        random = new BracketGenerator({winners: 'higher'}),
        s = new BracketScorer({
          userBracket: random.flatBracket(),
          masterBracket: noUpsets.flatBracket()
        });

    s.getScore(function(err, res) {
      assert.equal(true, _.isArray(res));
      assert.equal(true, res.length === 6);
      assert.equal(true, _.isEqual(res, [32, 16, 8, 4, 2, 1]));
      done();
    });
  });

  it('Worst score', function(done) {
    var noUpsets = new BracketGenerator({winners: 'lower'}),
        allUpsets = new BracketGenerator({winners: 'higher'}),
        s = new BracketScorer({
          userBracket: allUpsets.flatBracket(),
          masterBracket: noUpsets.flatBracket()
        });

    s.getScore(function(err, res) {
      assert.equal(true, _.isArray(res));
      assert.equal(true, res.length === 6);
      assert.equal(true, _.isEqual(res, [0, 0, 0, 0, 0, 0]));
      done();
    });
  });

});

describe('Bracket Differ', function() {

  it('Should return an object', function(done) {
    var noUpsets = new BracketGenerator({winners: 'lower'}),
        random = new BracketGenerator({winners: 'random'}),
        s = new BracketScorer({
          userBracket: random.flatBracket(),
          masterBracket: noUpsets.flatBracket()
        });

    s.diff(function(err, res) {
      assert.equal(true, _.isObject(res));
      assert.equal(true, _.keys(res).length === CONSTS.REGION_COUNT + 1);
      done();
    });
  });

});

