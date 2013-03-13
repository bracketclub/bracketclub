var BracketGenerator = require('../index').generator,
    validator = require('../index').validator,
    _ = require('underscore'),
    _s = require('underscore.string'),
    firstRoundOrder = require('../data/ncaa-mens-basketball/_ORDER').order,
    assert = require('assert');

var bg = new BracketGenerator({}),
    flat,
    expanded,
    validated,
    iterations = Math.pow(2, firstRoundOrder.length-1),
    i = 0;

describe('Bracket Validator', function() {

  for (i; i < iterations; i++) {
    bg.winners(_s.pad((i).toString(2), '15', '0'));
    expanded = bg.bracketWithTeamInfo();
    flat = bg.flatBracket();
    validated = validator.validateTournament(flat, {validateOnly: true});

    _.each(validated.regions, function(region, regionIndex) {
      _.each(region.rounds, function(round, roundIndex) {
        _.each(round.games, function(game, gameIndex) {
          var seed = expanded[regionIndex][roundIndex][gameIndex].seed,
              fromRegion = expanded[regionIndex][roundIndex][gameIndex].fromRegion,
              assertAgainst = _.isNumber(game) ? seed : fromRegion;

          it('the game should be equal to the seed or the from region', function() {
            assert.equal(game, assertAgainst);
          });
        });
      });
    });
  }

});