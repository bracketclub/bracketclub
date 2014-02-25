var assert = require('assert'),
    BracketUpdater = require('../index'),
    BracketGenerator = require('bracket-generator'),
    year = '2013',
    sport = 'ncaa-mens-basketball',
    BracketData = require('bracket-data'),
    bd = new BracketData({year: year, sport: sport, props: ['constants']}),
    c = bd.constants;

describe('Bracket Updater', function () {

    it('Game should be updated', function () {
        var beforeBracket = 'MW1812463721X3XXXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
            afterBracket =  'MW1812463721123XXXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: 12,
                loser: 4,
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should be updated', function () {
        var beforeBracket = 'MW18124637211232XXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
            afterBracket =  'MW18124637211232X3XW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: '3',
                loser: '2',
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should be updated', function () {
        var beforeBracket = 'MW18124637211232123XW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
            afterBracket =  'MW181246372112321233W191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MIDWEST',
                winner: {seed: 3},
                loser: {seed: '12'},
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should be updated even if bracket is unfinished', function () {
        var beforeBracket = 'MW185XXXXXXXXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            afterBracket =  'MW185XXXXXX5XXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MIDWEST',
                winner: 5,
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should be updated even if bracket is unfinished', function () {
        var beforeBracket = 'MW185XXXXXX5XXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            afterBracket =  'MW185XXXXXX5XX5XXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: {name: '', seed: 5},
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should be updated even if bracket is unfinished and the previous winning team has already advanced', function () {
        var beforeBracket = 'MW18XXXXXX1XXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            afterBracket =  'MW168XXXXXXXXXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: {name: '', seed: 16},
                loser: {name: '', seed: 1},
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should be updated even if bracket is unfinished and the previous winning team has already advanced', function () {
        var beforeBracket = 'MW18XXXXXX1XXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            afterBracket =  'MW168XXXXXXXXXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: {name: '', seed: 16},
                // We don't specify a loser in this case to make sure that the updater
                // picks the first last game that the winner appears
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Game should not be updated if we are only passing in a winner and that team has won all possible games', function () {
        var beforeBracket = 'MW1XXXXXXX1XXX1X1WXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            afterBracket =  'MW1XXXXXXX1XXX1X1WXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: 1,
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });

    it('Teams in final four should be removed when lost', function () {
        var beforeBracket = 'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX2XXX2X22EXXXXXXX2XXX2X22FFMWEE',
            afterBracket =  'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX15XXXXXXXEXXXXXXX2XXX2X22FFMWEE',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'S',
                winner: 15,
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());
    });


    it('Teams in final four should be removed when lost', function () {
        var beforeBracket = 'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX2XXX2X22EXXXXXXX2XXX2X22FFMWEE',
            afterBracket =  'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX2XXX2X22EXXXXXXX15XXXXXXXFFMWXX',
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'E',
                winner: 15,
                year: year,
                sport: sport
            });

        assert.equal(afterBracket, u.update());

        var beforeBracket2 = 'MW1XXXXXXX1XXX1X1W16XXXXXXX16XXX16X16SXXX4XXXXX4XX4X4EXXXX6XXXXX6XX66FFMWEE',
            afterBracket2 =  'MW1XXXXXXX1XXX1X1W16XXXXXXX16XXX16X16SXXX13XXXXXXXXXXXEXXXX6XXXXX6XX66FFMWEE',
            u2 = new BracketUpdater({
                currentMaster: beforeBracket2,
                fromRegion: 'S',
                winner: 13,
                year: year,
                sport: sport
            });

        assert.equal(afterBracket2, u2.update());
    });

    it('First round game should be updated', function () {
        var beforeBracket = c.EMPTY,
            afterBracket =  beforeBracket.replace('MWX', 'MW1'),
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                fromRegion: 'MW',
                winner: 1,
                loser: 16,
                year: year,
                sport: sport
            });

        assert.equal(u.update(), afterBracket);
    });

    it('Final four and champ game should be updated even if it is 1 vs 1', function () {
        var flat = new BracketGenerator({year: year, winners: 'lower'}).flatBracket(),
            noFF = flat.split(c.FINAL_ID)[0] + c.FINAL_ID,
            withoutFF = noFF + new Array(c.REGION_IDS.length).join(c.UNPICKED_MATCH);
            
        var mwFF = new BracketUpdater({
            year: year,
            sport: sport,
            currentMaster: withoutFF,
            fromRegion: 'FF',
            winner: 'louisville',
            loser: {name: 'gonzaga'}
        }).update();

        var sFF = new BracketUpdater({
            year: year,
            sport: sport
        }).update({
            currentMaster: mwFF,
            fromRegion: 'FF',
            winner: {name: 'KANSAS'},
            loser: {name: 'Indiana'}
        });

        var ncg = new BracketUpdater({
            year: year,
            sport: sport
        }).update({
            currentMaster: sFF,
            fromRegion: 'Championship',
            winner: {name: 'Kansas'},
            loser: {name: 'Louisville'}
        });

        var ncg2 = new BracketUpdater({
            year: year,
            sport: sport,
            currentMaster: sFF,
            fromRegion: 'FF',
            winner: 'Kansas'
        }).update();

        assert.equal(mwFF, noFF + 'MWXX');
        assert.equal(sFF, noFF + 'MWSX');
        assert.equal(ncg, noFF + 'MWSS');
        assert.equal(ncg2, noFF + 'MWSS');
    });

    it('Can update multiple games', function () {
        var beforeBracket = c.EMPTY,
            afterBracket =  beforeBracket.replace('MWXXXX', 'MW1854'),
            u = new BracketUpdater({
                currentMaster: beforeBracket,
                year: year,
                sport: sport
            });

        u.update({
            fromRegion: 'MW',
            winner: 1,
            loser: 16
        });

        u.update({
            fromRegion: 'MW',
            winner: 8,
            loser: 9,
        });

        u.update({
            fromRegion: 'MW',
            winner: 4,
            loser: 13,
        });

        u.update({
            fromRegion: 'MW',
            winner: 5,
            loser: 12
        });

        assert.equal(u.currentMaster, afterBracket);
    });

});
