var _ = require('underscore'),
    _s = require('underscore.string');
    data = require('../data/ncaa-mens-basketball/2012'),
    firstRoundOrder = require('../data/ncaa-mens-basketball/_ORDER').order,
    validator = require('../lib/validator.js');

var BracketGenerator = function(data) {
  var winnerCounter = 0,
      howToPickWinners = '';
  return {
    setHowToPickWinners: function(arg) {
      howToPickWinners = arg;
    },
    generateWinner: function(matchup) {
      var possible = {
            random: _.random(matchup.length-1),
            higher: matchup.indexOf(Math.max.apply(Math, matchup)),
            lower: matchup.indexOf(Math.min.apply(Math, matchup))
          },
          pick = howToPickWinners.charAt(winnerCounter);

      if (pick === "1") {
        return possible.higher;
      } else if (pick === "0") {
        return possible.lower;
      } else if (typeof possible[howToPickWinners] !== 'undefined') {
        return possible[howToPickWinners];
      }

      return possible.random;
    },
    generateRound: function(opts) {
      var seeds = opts.seeds,
          matchup = [seeds[0], seeds[1]],
          winner = matchup[this.generateWinner(matchup)],
          winners = (opts.winners || []).concat(winner),
          remainingSeeds = seeds.splice(2);

      winnerCounter++;

      if (remainingSeeds.length === 0) {
        return winners;
      } else {
        return this.generateRound({seeds: remainingSeeds, winners: winners});
      }
    },
    generateRounds: function(opts) {
      var round = this.generateRound({seeds: opts.round}),
          rounds = (opts.rounds || []);

      rounds.push(_.toArray(round));

      if (round.length === 1) {
        return rounds;
      } else {
        return this.generateRounds({round: round,  rounds: rounds});
      }
    },
    generateRegion: function(region, key) {
      winnerCounter = 0;
      return [key].concat(this.generateRounds({round: firstRoundOrder.slice()}));
    },
    generateRegions: function(regions) {
      return _.map(regions, this.generateRegion, this);
    },
    generateFinal: function(final) {
      return _.keys(final)[0] + 'SEE';
    },
    generateBracket: function() {
      return this.generateRegions(data.regions) + this.generateFinal(data.final);
    },
    flatBracket: function() {
      return _.flatten(this.generateBracket()).join('').replace(/,/g, '');
    }
  };
};

var bg = new BracketGenerator(data),
    picks,
    validated;


var firstRoundGames = firstRoundOrder.length,
    iterations = Math.pow(2, firstRoundGames-1),
    i = 0;

for (i; i < iterations; i++) {
  picks = _s.pad((i).toString(2), '15', '0');
  bg.setHowToPickWinners(picks);
  validated = validator.validateTournament(bg.flatBracket(), false, true);
  if (_.has(validated, 'regions')) {
    console.log(i, picks);
  } else {
    break;
  }
};

