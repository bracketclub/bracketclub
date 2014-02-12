var assert = require('assert'),

    _isArray = require('lodash-node/modern/objects/isArray'),
    _isEqual = require('lodash-node/modern/objects/isEqual'),
    _isNumber = require('lodash-node/modern/objects/isNumber'),
    _isObject = require('lodash-node/modern/objects/isObject'),
    _keys = require('lodash-node/modern/objects/keys'),
    _compact = require('lodash-node/modern/arrays/compact'),
    _pluck = require('lodash-node/modern/collections/pluck'),
    _every = require('lodash-node/modern/collections/every'),

    year = process.env.BRACKET_YEAR,

    BracketScorer = require('../index'),
    BracketGenerator = require('bracket-generator'),
    BracketData = require('bracket-data'),
    CONSTS = (new BracketData({year: year})).constants;

describe('Bracket Scorer', function () {

    it('Should return an array with 6 values', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year}),
            random = new BracketGenerator({winners: 'random', year: year}),
            s = new BracketScorer({
                userBracket: random.flatBracket(),
                masterBracket: noUpsets.flatBracket(),
                year: year
            }).getScore();

        assert.equal(true, _isArray(s.rounds));
        assert.equal(true, s.rounds.length === 6);
    });

    it('Perfect score', function () {
        var noUpsets = new BracketGenerator({winners: 'higher', year: year}),
            random = new BracketGenerator({winners: 'higher', year: year}),
            s = new BracketScorer({
                userBracket: random.flatBracket(),
                masterBracket: noUpsets.flatBracket(),
                year: year
            }).getScore();

        assert.equal(true, _isArray(s.rounds));
        assert.equal(true, s.rounds.length === 6);
        assert.equal(true, _isEqual(s.rounds, [32, 16, 8, 4, 2, 1]));
    });

    it('Worst score', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year}),
            allUpsets = new BracketGenerator({winners: 'higher', year: year}),
            s = new BracketScorer({
                userBracket: allUpsets.flatBracket(),
                masterBracket: noUpsets.flatBracket(),
                year: year
            }).getScore();

        assert.equal(true, _isArray(s.rounds));
        assert.equal(true, s.rounds.length === 6);
        assert.equal(true, _isEqual(s.rounds, [0, 0, 0, 0, 0, 0]));
    });

    it('Can reset', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year}),
            allUpsets = new BracketGenerator({winners: 'higher', year: year}),
            scorer = new BracketScorer({
                userBracket: allUpsets.flatBracket(),
                masterBracket: noUpsets.flatBracket(),
                year: year
            }),
            s = scorer.getScore();

        assert.equal(true, _isArray(s.rounds));
        assert.equal(true, s.rounds.length === 6);
        assert.equal(true, _isEqual(s.rounds, [0, 0, 0, 0, 0, 0]));

        console.log(s.rounds[0])

        var perf = new BracketGenerator({winners: 'higher', year: year}).flatBracket(),
            perf2 = new BracketGenerator({winners: 'higher', year: year}).flatBracket();
        scorer.reset(perf, perf2);
        s = scorer.getScore();

        console.log(s.rounds[0])

        assert.equal(true, _isArray(s.rounds));
        assert.equal(true, s.rounds.length === 6);
        assert.equal(true, _isEqual(s.rounds, [32, 16, 8, 4, 2, 1]));
    });

    it('Gooley', function () {
        var bracket = 'MW19546310159531591515W191213631015112315133S169121361471516121415161515E16812411147158411781111FFMWEMW',
            master = 'MW18124637211232XXXW19121361410291362XXXS185411371514315XXXE1912463721432XXXFFXXX',
            s = new BracketScorer({
                userBracket: bracket,
                masterBracket: master,
                year: year
            }).gooley();

        assert.equal(true, _isNumber(s.gooley));
        assert.equal(true, s.gooley > 0);
    });

});

describe('Bracket Differ', function () {

    it('Should return an object', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year}),
            random = new BracketGenerator({winners: 'random', year: year}),
            res = new BracketScorer({
                userBracket: random.flatBracket(),
                masterBracket: noUpsets.flatBracket(),
                year: year
            }).diff();

        assert.equal(true, _isObject(res));
        assert.equal(true, _keys(res).length === CONSTS.REGION_COUNT + 1);
    });

    it('Check games: round 1 wrong', function () {
        var user = new BracketGenerator({winners: 'higher', year: year}),
            res = new BracketScorer({
                userBracket: user.flatBracket(),
                masterBracket: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX',
                year: year
            }).diff();

        assert.equal(0, _compact(_pluck(res.MW.rounds[1], 'correct')).length);
        assert.equal(0, _compact(_pluck(res.W.rounds[1], 'correct')).length);
        assert.equal(0, _compact(_pluck(res.S.rounds[1], 'correct')).length);
        assert.equal(0, _compact(_pluck(res.E.rounds[1], 'correct')).length);

        assert.equal(true, _every(_pluck(res.MW.rounds[2], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.W.rounds[2], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.S.rounds[2], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.E.rounds[2], 'eliminated'), function (i) { return i === true; }));

        assert.equal(true, _every(_pluck(res.MW.rounds[3], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.W.rounds[3], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.S.rounds[3], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.E.rounds[3], 'eliminated'), function (i) { return i === true; }));

        assert.equal(true, _every(_pluck(res.MW.rounds[4], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.W.rounds[4], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.S.rounds[4], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _every(_pluck(res.E.rounds[4], 'eliminated'), function (i) { return i === true; }));

        assert.equal(1, res.MW.rounds[1][0].shouldBe.seed);
        assert.equal(1, res.W.rounds[1][0].shouldBe.seed);
        assert.equal(1, res.E.rounds[1][0].shouldBe.seed);
        assert.equal(1, res.S.rounds[1][0].shouldBe.seed);
    });

    it('Check games: round 1 right', function () {
        var user = new BracketGenerator({winners: 'lower', year: year}),
            res = new BracketScorer({
                userBracket: user.flatBracket(),
                masterBracket: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX',
                year: year
            }).diff();

        assert.equal(8, _compact(_pluck(res.MW.rounds[1], 'correct')).length);
        assert.equal(8, _compact(_pluck(res.W.rounds[1], 'correct')).length);
        assert.equal(8, _compact(_pluck(res.S.rounds[1], 'correct')).length);
        assert.equal(8, _compact(_pluck(res.E.rounds[1], 'correct')).length);

        assert.equal(true, _every(_pluck(res.MW.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.W.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.S.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.E.rounds[2], 'eliminated'), function (i) { return i === undefined; }));

        assert.equal(true, _every(_pluck(res.MW.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.W.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.S.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.E.rounds[3], 'eliminated'), function (i) { return i === undefined; }));

        assert.equal(true, _every(_pluck(res.MW.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.W.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.S.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.E.rounds[4], 'eliminated'), function (i) { return i === undefined; }));

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
    });

    it('Check games: round 1 right', function () {
        var user = new BracketGenerator({winners: 'lower', year: year}),
            res = new BracketScorer({
                userBracket: user.flatBracket(),
                masterBracket: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX',
                year: year
            }).diff();

        assert.equal(8, _compact(_pluck(res.MW.rounds[1], 'correct')).length);
        assert.equal(8, _compact(_pluck(res.W.rounds[1], 'correct')).length);
        assert.equal(8, _compact(_pluck(res.S.rounds[1], 'correct')).length);
        assert.equal(8, _compact(_pluck(res.E.rounds[1], 'correct')).length);

        assert.equal(true, _every(_pluck(res.MW.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.W.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.S.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.E.rounds[2], 'eliminated'), function (i) { return i === undefined; }));

        assert.equal(true, _every(_pluck(res.MW.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.W.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.S.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.E.rounds[3], 'eliminated'), function (i) { return i === undefined; }));

        assert.equal(true, _every(_pluck(res.MW.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.W.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.S.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _every(_pluck(res.E.rounds[4], 'eliminated'), function (i) { return i === undefined; }));

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
    });

});

