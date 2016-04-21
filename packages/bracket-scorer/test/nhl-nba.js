var assert = require('assert');
var _ = require('lodash');
var BracketScorer = require('../index');


describe('NBA', function () {
    var sport = 'nba';
    var year = '2016';

    it('Should score against an empty master', function () {
        var entry = 'W1423121E1523131FW';
        var master = 'WXXXXXXXEXXXXXXXFX';
        var scorer = new BracketScorer({
            entry: entry,
            master: master,
            sport: sport,
            year: year
        });

        var s = scorer.score(['standard', 'standardPPR', 'rounds']);

        assert.equal(s.standard, 0);
        assert.equal(true, _.isArray(s.rounds));
        assert.equal(s.rounds.length, 4);
        assert.ok(_.every(s.rounds, function (s) { return s === 0; }));
        assert.equal(s.standardPPR, 380);
    });
});

describe('NHL', function () {
    var sport = 'nhl';
    var year = '2016';

    it('Should score against an empty master', function () {
        var entry = 'C133P122M122A122FPMM';
        var master = 'CXXXPXXXMXXXAXXXFXXX';
        var scorer = new BracketScorer({
            entry: entry,
            master: master,
            sport: sport,
            year: year
        });

        var s = scorer.score(['standard', 'standardPPR', 'rounds']);

        assert.equal(s.standard, 0);
        assert.equal(true, _.isArray(s.rounds));
        assert.equal(s.rounds.length, 4);
        assert.ok(_.every(s.rounds, function (s) { return s === 0; }));
        assert.equal(s.standardPPR, 380);
    });
});
