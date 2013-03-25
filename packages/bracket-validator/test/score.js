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
      assert.equal(true, _.isArray(res.rounds));
      assert.equal(true, res.rounds.length === 6);
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
      assert.equal(true, _.isArray(res.rounds));
      assert.equal(true, res.rounds.length === 6);
      assert.equal(true, _.isEqual(res.rounds, [32, 16, 8, 4, 2, 1]));
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
      assert.equal(true, _.isArray(res.rounds));
      assert.equal(true, res.rounds.length === 6);
      assert.equal(true, _.isEqual(res.rounds, [0, 0, 0, 0, 0, 0]));
      done();
    });
  });

  it('Gooley', function(done) {
    var bracket = 'MW19546310159531591515W191213631015112315133S169121361471516121415161515E16812411147158411781111FFMWEMW',
        master = 'MW18124637211232XXXW19121361410291362XXXS185411371514315XXXE1912463721432XXXFFXXX',
        s = new BracketScorer({
          userBracket: bracket,
          masterBracket: master
        });

    s.gooley(function(err, res) {
      assert.equal(true, _.isNumber(res.gooley));
      assert.equal(true, res.gooley > 0);
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

  it('Check games: round 1 wrong', function(done) {
    var user = new BracketGenerator({winners: 'higher'}),
        s = new BracketScorer({
          userBracket: user.flatBracket(),
          masterBracket: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX'
        });

    s.diff(function(err, res) {
      assert.equal(0, _.compact(_.pluck(res.MW.rounds[1], 'correct')).length);
      assert.equal(0, _.compact(_.pluck(res.W.rounds[1], 'correct')).length);
      assert.equal(0, _.compact(_.pluck(res.S.rounds[1], 'correct')).length);
      assert.equal(0, _.compact(_.pluck(res.E.rounds[1], 'correct')).length);

      assert.equal(true, _.every(_.pluck(res.MW.rounds[2], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[2], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[2], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[2], 'eliminated'), function(i) { return i === true;}));

      assert.equal(true, _.every(_.pluck(res.MW.rounds[3], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[3], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[3], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[3], 'eliminated'), function(i) { return i === true;}));

      assert.equal(true, _.every(_.pluck(res.MW.rounds[4], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[4], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[4], 'eliminated'), function(i) { return i === true;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[4], 'eliminated'), function(i) { return i === true;}));

      assert.equal(1, res.MW.rounds[1][0].shouldBe.seed);
      assert.equal(1, res.W.rounds[1][0].shouldBe.seed);
      assert.equal(1, res.E.rounds[1][0].shouldBe.seed);
      assert.equal(1, res.S.rounds[1][0].shouldBe.seed);

      done();
    });
  });

  it('Check games: round 1 right', function(done) {
    var user = new BracketGenerator({winners: 'lower'}),
        s = new BracketScorer({
          userBracket: user.flatBracket(),
          masterBracket: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX'
        });

    s.diff(function(err, res) {

      assert.equal(8, _.compact(_.pluck(res.MW.rounds[1], 'correct')).length);
      assert.equal(8, _.compact(_.pluck(res.W.rounds[1], 'correct')).length);
      assert.equal(8, _.compact(_.pluck(res.S.rounds[1], 'correct')).length);
      assert.equal(8, _.compact(_.pluck(res.E.rounds[1], 'correct')).length);

      assert.equal(true, _.every(_.pluck(res.MW.rounds[2], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[2], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[2], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[2], 'eliminated'), function(i) { return i === undefined;}));

      assert.equal(true, _.every(_.pluck(res.MW.rounds[3], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[3], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[3], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[3], 'eliminated'), function(i) { return i === undefined;}));

      assert.equal(true, _.every(_.pluck(res.MW.rounds[4], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[4], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[4], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[4], 'eliminated'), function(i) { return i === undefined;}));

      assert.equal(true, res.MW.rounds[1][0].correct);
      assert.equal(true, res.W.rounds[1][0].correct);
      assert.equal(true, res.E.rounds[1][0].correct);
      assert.equal(true, res.S.rounds[1][0].correct);

      assert.equal(undefined, res.MW.rounds[2][0].eliminated);
      assert.equal(undefined, res.W.rounds[2][0].eliminated);
      assert.equal(undefined, res.E.rounds[2][0].eliminated);
      assert.equal(undefined, res.S.rounds[2][0].eliminated);

      assert.equal(undefined, res.MW.rounds[1][0].shouldBe);
      assert.equal(undefined, res.W.rounds[1][0].shouldBe);
      assert.equal(undefined, res.E.rounds[1][0].shouldBe);
      assert.equal(undefined, res.S.rounds[1][0].shouldBe);

      done();
    });
  });

  it('Check games: round 1 right', function(done) {
    var user = new BracketGenerator({winners: 'lower'}),
        s = new BracketScorer({
          userBracket: user.flatBracket(),
          masterBracket: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX'
        });

    s.diff(function(err, res) {

      assert.equal(8, _.compact(_.pluck(res.MW.rounds[1], 'correct')).length);
      assert.equal(8, _.compact(_.pluck(res.W.rounds[1], 'correct')).length);
      assert.equal(8, _.compact(_.pluck(res.S.rounds[1], 'correct')).length);
      assert.equal(8, _.compact(_.pluck(res.E.rounds[1], 'correct')).length);

      assert.equal(true, _.every(_.pluck(res.MW.rounds[2], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[2], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[2], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[2], 'eliminated'), function(i) { return i === undefined;}));

      assert.equal(true, _.every(_.pluck(res.MW.rounds[3], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[3], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[3], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[3], 'eliminated'), function(i) { return i === undefined;}));

      assert.equal(true, _.every(_.pluck(res.MW.rounds[4], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.W.rounds[4], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.S.rounds[4], 'eliminated'), function(i) { return i === undefined;}));
      assert.equal(true, _.every(_.pluck(res.E.rounds[4], 'eliminated'), function(i) { return i === undefined;}));

      assert.equal(true, res.MW.rounds[1][0].correct);
      assert.equal(true, res.W.rounds[1][0].correct);
      assert.equal(true, res.E.rounds[1][0].correct);
      assert.equal(true, res.S.rounds[1][0].correct);

      assert.equal(undefined, res.MW.rounds[2][0].eliminated);
      assert.equal(undefined, res.W.rounds[2][0].eliminated);
      assert.equal(undefined, res.E.rounds[2][0].eliminated);
      assert.equal(undefined, res.S.rounds[2][0].eliminated);

      assert.equal(undefined, res.MW.rounds[1][0].shouldBe);
      assert.equal(undefined, res.W.rounds[1][0].shouldBe);
      assert.equal(undefined, res.E.rounds[1][0].shouldBe);
      assert.equal(undefined, res.S.rounds[1][0].shouldBe);

      done();
    });
  });

});

