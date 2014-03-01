var assert = require('assert');
var _ = require('lodash-node');
var year = '2013';
var sport = 'ncaa-mens-basketball';
var BracketScorer = require('../index');
var BracketGenerator = require('bracket-generator');
var BracketData = require('bracket-data');
var bracketData = new BracketData({year: year, sport: sport, props: ['constants', 'scoring']});
var CONSTS = bracketData.constants;
var masterScoring = bracketData.scoring;

var getGooley = function (method) {
    var perfect = 0;
    _.each(masterScoring.gooley, function (gooleyRound, index) {
        var lastCount;
        var last;
        var roundScore;

        if (index === 0) lastCount = 8;
        if (index === 1) lastCount = 4;
        if (index === 2) lastCount = 2;
        if (index === 3) lastCount = 1;
        if (index === 4) lastCount = 1;
        if (index === 5) lastCount = 1;

        last = _[method](gooleyRound, lastCount);
        roundScore = _.reduce(last, function (memo, num) { return memo + (num * 10); }, 0);

        if (index <= 3) {
            perfect += roundScore * CONSTS.REGION_COUNT;
        } else if (index === 4) {
            perfect += roundScore * 2;
        } else {
            perfect += roundScore;
        }
    });
    return perfect / 10;
};

describe('Bracket Scorer', function () {

    it('Should return rounds', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            random = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            scorer = new BracketScorer({
                entry: random.generate(),
                master: noUpsets.generate(),
                sport: sport,
                year: year
            }),
            s = scorer.score();

        assert.equal(true, _.isArray(s));
        assert.equal(s.length, 6);
        assert.equal(true, _.isEqual(s, [32, 16, 8, 4, 2, 1]));

        var perf = new BracketGenerator({winners: 'lower', year: year, sport: sport}).generate(),
            perf2 = new BracketGenerator({winners: 'higher', year: year, sport: sport}).generate();
        s = scorer.score({entry: perf, master: perf2});

        assert.equal(true, _.isArray(s));
        assert.equal(s.length, 6);
        assert.equal(true, _.isEqual(s, [0, 0, 0, 0, 0, 0]));
    });

    it('Perfect score', function () {
        var entry = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            master = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            s = new BracketScorer({
                entry: entry.generate(),
                master: master.generate(),
                sport: sport,
                year: year
            }).score('standard');

        assert.equal(s, 1920);
    });

    it('Worst score', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            allUpsets = new BracketGenerator({winners: 'higher', year: year, sport: sport}),
            s = new BracketScorer({
                entry: allUpsets.generate(),
                master: noUpsets.generate(),
                sport: sport,
                year: year
            }).score('standard');

        assert.equal(s, 0);
    });

    it('Can be reset', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            allUpsets = new BracketGenerator({winners: 'higher', year: year, sport: sport}),
            scorer = new BracketScorer({
                entry: allUpsets.generate(),
                master: noUpsets.generate(),
                sport: sport,
                year: year
            }),
            s = scorer.score('standard');

        assert.equal(s, 0);

        s = scorer.standard({
            master: new BracketGenerator({winners: 'higher', year: year, sport: sport}).generate()
        });

        assert.equal(s, 1920);
    });

    it('Can be called with the options as the first param', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            allUpsets = new BracketGenerator({winners: 'higher', year: year, sport: sport}),
            scorer = new BracketScorer({
                entry: allUpsets.generate(),
                master: noUpsets.generate(),
                sport: sport,
                year: year
            }),
            s = scorer.score('standard');

        assert.equal(s, 0);

        s = scorer.score({
            master: new BracketGenerator({winners: 'higher', year: year, sport: sport}).generate()
        });

        assert.equal(true, _.isEqual(s, [32, 16, 8, 4, 2, 1]));
    });

    it('Gooley with all upsets', function () {
        var entry = new BracketGenerator({winners: 'higher', year: year, sport: sport}),
            master = new BracketGenerator({winners: 'higher', year: year, sport: sport}),
            s = new BracketScorer({
                entry: entry.generate(),
                master: master.generate(),
                sport: sport,
                year: year
            }).score('gooley');

        assert.equal(s, getGooley('last'));
    });

    it('Gooley with all chalk', function () {
        var entry = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            master = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            s = new BracketScorer({
                entry: entry.generate(),
                master: master.generate(),
                sport: sport,
                year: year
            }).score('gooley');

        assert.equal(s, getGooley('first'));
    });

    it('Gooley and standard', function () {
        var entry = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            master = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            s = new BracketScorer({
                entry: entry.generate(),
                master: master.generate(),
                sport: sport,
                year: year
            }).score(['gooley', 'standard']);

        assert.equal(s.gooley, getGooley('first'));
        assert.equal(s.standard, 1920);
    });

    it('Convenience methods', function () {
        var entry = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            master = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            s = new BracketScorer({
                entry: entry.generate(),
                master: master.generate(),
                sport: sport,
                year: year
            });

        assert.equal(s.gooley(), getGooley('first'));
        assert.equal(s.standard(), 1920);
    });

    it('Ad hoc scoring systems', function () {
        var entry = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            master = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            s = new BracketScorer({
                entry: entry.generate(),
                master: master.generate(),
                sport: sport,
                year: year,
                scoring: {
                    one: 1,
                    standard: [1, 2, 4, 8, 16, 32],
                    champion: [1, 1, 1, 1, 1, 1000],
                    doesNotWork: [1, 6]
                }
            }),
            oneWrong = new BracketScorer({
                entry: entry.generate().replace('FFMWSMW', 'FFMWSS'),
                master: master.generate(),
                sport: sport,
                year: year,
                scoring: {
                    one: 1,
                    standard: [1, 2, 4, 8, 16, 32],
                    champion: [1, 1, 1, 1, 1, 1000],
                    doesNotWork: [1, 6]
                }
            });

        assert.equal(s.one(), 63);
        assert.equal(s.standard(), 192);
        assert.equal(s.champion(), 1062);
        assert.equal(oneWrong.champion(), 62);
        assert.throws(function () { s.score('notASystem'); }, /no scoring system: notASystem/);
        assert.throws(function () { s.score('doesNotWork'); }, /Cant do anything with scoring system: doesNotWork/);
    });

});

describe('Bracket Differ', function () {

    it('Should return an object', function () {
        var noUpsets = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            random = new BracketGenerator({winners: 'random', year: year, sport: sport}),
            s = new BracketScorer({
                entry: random.generate(),
                master: noUpsets.generate(),
                sport: sport,
                year: year
            }).score('diff');

        assert.equal(true, _.isObject(s));
        assert.equal(true, _.keys(s).length === CONSTS.REGION_COUNT + 1);
    });

    it('Check games: round 1 wrong', function () {
        var user = new BracketGenerator({winners: 'higher', year: year, sport: sport}),
            res = new BracketScorer({
                entry: user.generate(),
                master: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX',
                year: year,
                sport: sport
            }).score('diff');

        assert.equal(0, _.compact(_.pluck(res.MW.rounds[1], 'correct')).length);
        assert.equal(0, _.compact(_.pluck(res.W.rounds[1], 'correct')).length);
        assert.equal(0, _.compact(_.pluck(res.S.rounds[1], 'correct')).length);
        assert.equal(0, _.compact(_.pluck(res.E.rounds[1], 'correct')).length);

        assert.equal(true, _.every(_.pluck(res.MW.rounds[2], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.W.rounds[2], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.S.rounds[2], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.E.rounds[2], 'eliminated'), function (i) { return i === true; }));

        assert.equal(true, _.every(_.pluck(res.MW.rounds[3], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.W.rounds[3], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.S.rounds[3], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.E.rounds[3], 'eliminated'), function (i) { return i === true; }));

        assert.equal(true, _.every(_.pluck(res.MW.rounds[4], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.W.rounds[4], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.S.rounds[4], 'eliminated'), function (i) { return i === true; }));
        assert.equal(true, _.every(_.pluck(res.E.rounds[4], 'eliminated'), function (i) { return i === true; }));

        assert.equal(1, res.MW.rounds[1][0].shouldBe.seed);
        assert.equal(1, res.W.rounds[1][0].shouldBe.seed);
        assert.equal(1, res.E.rounds[1][0].shouldBe.seed);
        assert.equal(1, res.S.rounds[1][0].shouldBe.seed);
    });

    it('Check games: round 1 right', function () {
        var user = new BracketGenerator({winners: 'lower', year: year, sport: sport}),
            res = new BracketScorer({
                entry: user.generate(),
                master: 'MW18546372XXXXXXXW18546372XXXXXXXS18546372XXXXXXXE18546372XXXXXXXFFXXX',
                year: year,
                sport: sport
            }).score('diff');

        assert.equal(8, _.compact(_.pluck(res.MW.rounds[1], 'correct')).length);
        assert.equal(8, _.compact(_.pluck(res.W.rounds[1], 'correct')).length);
        assert.equal(8, _.compact(_.pluck(res.S.rounds[1], 'correct')).length);
        assert.equal(8, _.compact(_.pluck(res.E.rounds[1], 'correct')).length);

        assert.equal(true, _.every(_.pluck(res.MW.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.W.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.S.rounds[2], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.E.rounds[2], 'eliminated'), function (i) { return i === undefined; }));

        assert.equal(true, _.every(_.pluck(res.MW.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.W.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.S.rounds[3], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.E.rounds[3], 'eliminated'), function (i) { return i === undefined; }));

        assert.equal(true, _.every(_.pluck(res.MW.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.W.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.S.rounds[4], 'eliminated'), function (i) { return i === undefined; }));
        assert.equal(true, _.every(_.pluck(res.E.rounds[4], 'eliminated'), function (i) { return i === undefined; }));

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

    it('Check final four: all wrong', function () {
        var user = new BracketGenerator({winners: 'higher', year: year, sport: sport});
        var master = new BracketGenerator({winners: 'lower', year: year, sport: sport});
        var res = new BracketScorer({
            entry: user.generate(),
            master: master.generate(),
            year: year,
            sport: sport
        }).score('diff');

        assert.equal(_.last(res.MW.rounds, 2)[0][0].seed, 16);
        assert.equal(_.last(res.MW.rounds, 2)[0][0].shouldBe.seed, 1);
        assert.equal(_.last(res.MW.rounds, 2)[0][1].seed, 15);
        assert.equal(_.last(res.MW.rounds, 2)[0][1].shouldBe.seed, 2);
        assert.equal(_.last(res.MW.rounds, 2)[1][0].seed, 16);
        assert.equal(_.last(res.MW.rounds, 2)[1][0].shouldBe.seed, 1);

        assert.equal(1, res.FF.rounds[0][0].shouldBe.seed);
        assert.equal(1, res.FF.rounds[0][1].shouldBe.seed);
        assert.equal(1, res.FF.rounds[0][2].shouldBe.seed);
        assert.equal(1, res.FF.rounds[0][3].shouldBe.seed);
    });

});

