var assert = require('assert'),
    BracketUpdater = require('../lib/updater');

describe('Bracket Updater', function() {

  it('Game should be updated', function(done) {
    var beforeBracket = 'MW1812463721X3XXXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
        regionGame = 'MW',
        winningSeed = 12,
        losingSeed = 4,
        afterBracket =  'MW1812463721123XXXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
        u = new BracketUpdater({
          currentMaster: beforeBracket,
          fromRegion: regionGame,
          winningSeed: winningSeed,
          losingSeed: losingSeed
        });

    u.update(function(err, res) {
      assert.equal(res, afterBracket);
      done();
    });
  });

  it('Game should be updated', function(done) {
    var beforeBracket = 'MW18124637211232XXXW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
        regionGame = 'MW',
        winningSeed = 3,
        losingSeed = 2,
        afterBracket =  'MW18124637211232X3XW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
        u = new BracketUpdater({
          currentMaster: beforeBracket,
          fromRegion: regionGame,
          winningSeed: winningSeed,
          losingSeed: losingSeed
        });

    u.update(function(err, res) {
      assert.equal(res, afterBracket);
      done();
    });
  });

  it('Game should be updated', function(done) {
    var beforeBracket = 'MW18124637211232123XW191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
        regionGame = 'MIDWEST',
        winningSeed = 3,
        losingSeed = 12,
        afterBracket =  'MW181246372112321233W191213614102XX6XXXXS1854113715X4XXXXXE191246372XXXXXXXFFXXX',
        u = new BracketUpdater({
          currentMaster: beforeBracket,
          fromRegion: regionGame,
          winningSeed: winningSeed,
          losingSeed: losingSeed
        });

    u.update(function(err, res) {
      assert.equal(res, afterBracket);
      done();
    });
  });

});
