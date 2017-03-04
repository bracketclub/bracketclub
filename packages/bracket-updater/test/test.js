/* eslint-env mocha */

var assert = require('assert')
var BracketUpdater = require('../index')
var BracketGenerator = require('bracket-generator')
var year = '2013'
var sport = 'ncaam'
var bracketData = require('bracket-data')
var bd = bracketData({year: year, sport: sport})
var c = bd.constants

describe('Bracket Updater', function () {
  it('Game should be updated', function () {
    var beforeBracket = 'MW1812463721X3XXXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX'
    var afterBracket = 'MW1812463721123XXXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: 12,
      loser: 4,
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should be updated', function () {
    var beforeBracket = 'MW18124637211232XXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX'
    var afterBracket = 'MW18124637211232X3XW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: '3',
      loser: '2',
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should be updated', function () {
    var beforeBracket = 'MW18124637211232123XW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX'
    var afterBracket = 'MW181246372112321233W191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MIDWEST',
      winner: {seed: 3},
      loser: {seed: '12'},
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should be updated even if bracket is unfinished', function () {
    var beforeBracket = 'MW185XXXXXXXXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var afterBracket = 'MW185XXXXXX5XXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MIDWEST',
      winner: 5,
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should be updated even if bracket is unfinished', function () {
    var beforeBracket = 'MW185XXXXXX5XXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var afterBracket = 'MW185XXXXXX5XX5XXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: {name: '', seed: 5},
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should be updated even if bracket is unfinished and the previous winning team has already advanced', function () {
    var beforeBracket = 'MW18XXXXXX1XXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var afterBracket = 'MW168XXXXXXXXXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: {name: '', seed: 16},
      loser: {name: '', seed: 1},
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should be updated even if bracket is unfinished and the previous winning team has already advanced', function () {
    var beforeBracket = 'MW18XXXXXX1XXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var afterBracket = 'MW168XXXXXXXXXXXXXWXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: {name: '', seed: 16},
      // We don't specify a loser in this case to make sure that the updater
      // picks the first last game that the winner appears
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Game should not be updated if we are only passing in a winner and that team has won all possible games', function () {
    var beforeBracket = 'MW1XXXXXXX1XXX1X1WXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var afterBracket = 'MW1XXXXXXX1XXX1X1WXXXXXXXXXXXXXXXSXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXFFXXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: 1,
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Teams in final four should be removed when lost', function () {
    var beforeBracket = 'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX2XXX2X22EXXXXXXX2XXX2X22FFMWEX'
    var afterBracket = 'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX15XXXXXXXEXXXXXXX2XXX2X22FFMWEX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'S',
      winner: 15,
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())
  })

  it('Teams in final four should be removed when lost', function () {
    var beforeBracket = 'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX2XXX2X22EXXXXXXX2XXX2X22FFMWEX'
    var afterBracket = 'MW1XXXXXXX1XXX1X1W1XXXXXXX1XXX1X1SXXXXXXX2XXX2X22EXXXXXXX15XXXXXXXFFMWXX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'E',
      winner: 15,
      year: year,
      sport: sport
    })

    assert.equal(afterBracket, u.update())

    var beforeBracket2 = 'MW1XXXXXXX1XXX1X1W16XXXXXXX16XXX16X16SXXX4XXXXX4XX4X4EXXXX6XXXXX6XX66FFMWEX'
    var afterBracket2 = 'MW1XXXXXXX1XXX1X1W16XXXXXXX16XXX16X16SXXX13XXXXXXXXXXXEXXXX6XXXXX6XX66FFMWEX'
    var u2 = new BracketUpdater({
      currentMaster: beforeBracket2,
      fromRegion: 'S',
      winner: 13,
      year: year,
      sport: sport
    })

    assert.equal(afterBracket2, u2.update())
  })

  it('First round game should be updated', function () {
    var beforeBracket = c.EMPTY
    var afterBracket = beforeBracket.replace('MWX', 'MW1')
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'MW',
      winner: 1,
      loser: 16,
      year: year,
      sport: sport
    })

    assert.equal(u.update(), afterBracket)
  })

  it('Should not update future games if a winner and loser is passed and that specific game has been recorded', function () {
    var before = 'MWXXXXXX10XXXX10X1010WXXXXXXXXXXXXXXXS168XXXXXX8XXX8X8EXXXXXXXXXXXXXXXFFMWSS'
    var befor1 = 'MWXXXXXX10XXXX10X1010WXXXXXXXXXXXXXXXS168XXXXXX16XXXXXXEXXXXXXXXXXXXXXXFFMWXX'

    var u = new BracketUpdater({
      currentMaster: before,
      fromRegion: 'S',
      winner: 16,
      loser: 1,
      year: year,
      sport: sport
    })

    assert.equal(u.update(), before)

    // Without the loser this time
    var u2 = new BracketUpdater({
      currentMaster: before,
      fromRegion: 'S',
      winner: 16,
      year: year,
      sport: sport
    })

    assert.equal(u2.update(), befor1)
  })

  it('Final four and champ game should be updated even if it is 1 vs 1', function () {
    var flat = new BracketGenerator({year: year, sport: sport, winners: 'lower'}).generate()
    var noFF = flat.split(c.FINAL_ID)[0] + c.FINAL_ID
    var withoutFF = noFF + new Array(c.REGION_IDS.length).join(c.UNPICKED_MATCH)

    var mwFF = new BracketUpdater({
      year: year,
      sport: sport,
      currentMaster: withoutFF,
      fromRegion: 'Final Four',
      winner: 'louisville',
      loser: {name: 'gonzaga'}
    }).update()

    var sFF = new BracketUpdater({
      year: year,
      sport: sport
    }).update({
      currentMaster: mwFF,
      fromRegion: 'final four',
      winner: {name: 'KANSAS'},
      loser: {name: 'Indiana'}
    })

    var ncg = new BracketUpdater({
      year: year,
      sport: sport
    }).update({
      currentMaster: sFF,
      fromRegion: 'Championship',
      winner: {name: 'Kansas'},
      loser: {name: 'Louisville'}
    })

    var ncg2 = new BracketUpdater({
      year: year,
      sport: sport,
      currentMaster: sFF,
      fromRegion: 'FF',
      winner: 'Kansas'
    }).update()

    assert.equal(mwFF, noFF + 'MWXX')
    assert.equal(sFF, noFF + 'MWSX')
    assert.equal(ncg, noFF + 'MWSS')
    assert.equal(ncg2, noFF + 'MWSS')
  })

  it('Can update multiple games', function () {
    var beforeBracket = c.EMPTY
    var afterBracket = beforeBracket.replace('MWXXXX', 'MW1854')
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      year: year,
      sport: sport
    })

    u.update({
      fromRegion: 'MW',
      winner: 1,
      loser: 16
    })

    u.update({
      fromRegion: 'MW',
      winner: 8,
      loser: 9
    })

    u.update({
      fromRegion: 'MW',
      winner: 4,
      loser: 13
    })

    u.update({
      fromRegion: 'MW',
      winner: 5,
      loser: 12
    })

    assert.equal(u.currentMaster, afterBracket)
  })

  it('Should update 1st FF game in 2015', function () {
    var beforeBracket = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFXXX'
    var afterBracket1 = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFXSX'
    var afterBracket2 = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFMWSX'
    var u1 = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'FINAL FOUR',
      winner: {name: 'Duke', seed: 1},
      loser: {name: 'Michigan State', seed: 7},
      year: '2015',
      sport: sport
    })
    var u2 = new BracketUpdater({
      currentMaster: u1.update(),
      fromRegion: 'FINAL FOUR',
      winner: {name: 'Kentucky', seed: 1},
      loser: {name: 'Wisconsin', seed: 1},
      year: '2015',
      sport: sport
    })

    assert.equal(u1.update(), afterBracket1)
    assert.equal(u2.update(), afterBracket2)
  })

  it('Should match array of team names', function () {
    var beforeBracket = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFXXX'
    var afterBracket1 = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFXSX'
    var u1 = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'FINAL FOUR',
      winner: {name: 'Duke', seed: 1},
      loser: {name: ['Michigan St', 'MICHIGAN STATE'], seed: 7},
      year: '2015',
      sport: sport
    })

    assert.equal(u1.update(), afterBracket1)
  })

  it('Should match array of team names from names prop too', function () {
    var beforeBracket = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFXXX'
    var afterBracket1 = 'MW185463721537131W18546141021462121E1854113728437477S185411147215112121FFXSX'
    var u1 = new BracketUpdater({
      currentMaster: beforeBracket,
      fromRegion: 'FINAL FOUR',
      winner: {name: 'Duke', seed: 1},
      loser: {name: 'Michigan St', names: ['MST', 'Michigan State', 'Michigan St'], seed: 7},
      year: '2015',
      sport: sport
    })

    assert.equal(u1.update(), afterBracket1)
  })

  it('Should pick next games in random order', function () {
    var bracket = c.EMPTY
    var u1 = new BracketUpdater({
      year: '2015',
      sport: sport
    })

    for (var i = 0; i < 63; i++) {
      var next = u1.nextRandom({currentMaster: bracket})
      bracket = u1.update({
        currentMaster: bracket,
        fromRegion: next[0].fromRegion,
        winner: {seed: next[0].seed, name: next[0].name},
        loser: {seed: next[1].seed, name: next[1].name}
      })
    }

    assert.equal(bracket.indexOf(bd.constants.UNPICKED_MATCH), -1)
  })

  it('Should get pick next games in order', function () {
    var bracket = c.EMPTY
    var u1 = new BracketUpdater({
      year: '2015',
      sport: sport
    })

    for (var i = 0; i < 63; i++) {
      var next = u1.next({currentMaster: bracket})
      bracket = u1.update({
        currentMaster: bracket,
        fromRegion: next[0].fromRegion,
        winner: {seed: next[0].seed, name: next[0].name},
        loser: {seed: next[1].seed, name: next[1].name}
      })
    }

    assert.equal(bracket.indexOf(bd.constants.UNPICKED_MATCH), -1)
  })

  it('Should get pick next games in order with random winners', function () {
    var bracket = c.EMPTY
    var u1 = new BracketUpdater({
      year: '2015',
      sport: sport
    })

    for (var i = 0; i < 63; i++) {
      var next = u1.next({currentMaster: bracket}, {winner: true, order: false})
      bracket = u1.update({
        currentMaster: bracket,
        fromRegion: next[0].fromRegion,
        winner: {seed: next[0].seed, name: next[0].name},
        loser: {seed: next[1].seed, name: next[1].name}
      })
    }

    assert.equal(bracket.indexOf(bd.constants.UNPICKED_MATCH), -1)
  })

  it('Should get pick next games in order with played competitions', function () {
    var bracket = bracketData({year: '2016', sport: 'nba'}).constants.EMPTY
    var u1 = new BracketUpdater({
      year: '2016',
      sport: 'nba'
    })

    for (var i = 0; i < 15; i++) {
      var next = u1.next({currentMaster: bracket})
      bracket = u1.update({
        currentMaster: bracket,
        fromRegion: next[0].fromRegion,
        winner: {seed: next[0].seed, name: next[0].name},
        loser: {seed: next[1].seed, name: next[1].name},
        playedCompetitions: 7
      })
    }

    assert.equal(bracket.indexOf(bd.constants.UNPICKED_MATCH), -1)
    assert.equal(bracket, 'W17472737172717E17472737172717FW7')
  })

  it('Should get pick next games in order', function () {
    var bracket = c.EMPTY
    var u1 = new BracketUpdater({
      year: '2015',
      sport: sport
    })

    for (var i = 0; i < 5; i++) {
      var next = u1.next({currentMaster: bracket})
      bracket = u1.update({
        currentMaster: bracket,
        fromRegion: next[0].fromRegion,
        winner: {seed: next[0].seed, name: next[0].name},
        loser: {seed: next[1].seed, name: next[1].name}
      })
    }

    assert.equal(bracket, c.EMPTY.replace('MWXXXXX', 'MW18546'))
  })
})

describe('NBA', () => {
  it('Game should be updated', function () {
    var beforeBracket = 'W142312XE142312XFX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      year: '2016',
      sport: 'nba'
    })

    assert.equal('W1423121E142312XFX', u.update({
      fromRegion: 'W',
      winner: 1,
      loser: 2
    }))

    assert.equal('W1423121E1423121FX', u.update({
      fromRegion: 'E',
      winner: 1,
      loser: 2
    }))

    assert.equal('W1423121E1423121FW', u.update({
      fromRegion: 'FINALS',
      winner: { name: 'Golden State', seed: 1 },
      loser: { name: 'Cleveland', seed: 1 }
    }))
  })

  it('should update played competitions', () => {
    var beforeBracket = 'W174727371727XE174727371727XFX'
    var u = new BracketUpdater({
      currentMaster: beforeBracket,
      year: '2016',
      sport: 'nba'
    })

    assert.equal('W17472737172714E174727371727XFX', u.update({
      fromRegion: 'W',
      winner: 1,
      loser: 2,
      playedCompetitions: 4
    }))

    assert.equal('W17472737172714E17472737172715FX', u.update({
      fromRegion: 'E',
      winner: 1,
      loser: 2,
      playedCompetitions: 5
    }))

    assert.equal('W17472737172714E17472737172715FW7', u.update({
      fromRegion: 'FINALS',
      winner: { name: 'Golden State', seed: 1 },
      loser: { name: 'Cleveland', seed: 1 },
      playedCompetitions: 7
    }))
  })

  it('should not update played competitions when it is 1', () => {
    var beforeBracket = c.EMPTY
    var afterBracket = beforeBracket.replace('MWX', 'MW1')
    var update = {
      currentMaster: beforeBracket,
      playedCompetitions: 1,
      fromRegion: 'MW',
      winner: 1,
      loser: 16
    }

    var updater = new BracketUpdater({
      year: year,
      sport: sport
    })

    assert.equal(updater.update(update), afterBracket)
  })
})
