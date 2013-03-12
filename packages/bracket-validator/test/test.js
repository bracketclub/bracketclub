var _ = require('underscore'),
    _s = require('underscore.string');
    data = require('../data/ncaa-mens-basketball/2012'),
    firstRoundOrder = require('../data/ncaa-mens-basketball/_ORDER').order,
    validator = require('../lib/new-validator.js'),
    helpers = require('../lib/helpers.js');

var BracketGenerator = function(options) {
  var data = options.data,
      winnerCounter = 0,
      howToPickWinners = options.winners || '',
      generatedBracket = null;
  return {
    winners: function(arg) {
      generatedBracket = null;
      howToPickWinners = arg;
      return this;
    },
    generateWinner: function(matchup) {
      var possible = {
            random: _.random(matchup.length-1),
            higher: matchup.indexOf(Math.max.apply(Math, matchup)),
            lower: matchup.indexOf(Math.min.apply(Math, matchup))
          },
          pick = howToPickWinners.charAt(winnerCounter),
          winner;

      if (pick === "1") {
        winner = possible.higher;
      } else if (pick === "0") {
        winner = possible.lower;
      } else if (typeof possible[howToPickWinners] !== 'undefined') {
        winner = possible[howToPickWinners];
      }

      return (winner >= 0 && winner < matchup.length) ? winner : possible.random;
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
      var optRound = _.toArray(opts.round),
          round = this.generateRound({seeds: opts.round}),
          rounds = (opts.rounds || []);

      if (rounds.length === 0) {
        rounds.push(optRound);
      }
      rounds.push(_.toArray(round));

      if (round.length === 1) {
        return rounds;
      } else {
        return this.generateRounds({round: round,  rounds: rounds});
      }
    },
    generateRegion: function(region, key) {
      winnerCounter = 0;
      return {name: key, rounds: this.generateRounds({round: firstRoundOrder.slice()})};
    },
    generateRegions: function(regions) {
      return _.map(data.regions, this.generateRegion, this);
    },
    generateFinalFour: function() {
      var regions = _.keys(data.regions),
          firstTeam = regions[0],
          matchup1 = [firstTeam, data.regions[firstTeam].sameSideAs],
          matchup2 = _.difference(regions, matchup1);

      return _.flatten([matchup1, matchup2]);
    },
    generateFinal: function() {
      return {name: _.keys(data.final)[0], rounds: this.generateRounds({round: this.generateFinalFour()})};
    },
    generateBracket: function() {
      if (generatedBracket === null) {
        generatedBracket = _.shuffle(this.generateRegions(data.regions)).concat(this.generateFinal());
      }
      return generatedBracket;
    },
    winningTeamFromRegion: function(fromRegion) {
      return _.last(_.find(_.toArray(this.generateBracket()), function(region) {
        return region.name === fromRegion;
      }).rounds)[0];
    },
    teamNameFromRegion: function(regionName, seed) {
      return data.regions[regionName].teams[seed-1];
    },
    bracketWithTeamInfo: function() {
      var bracket = _.toArray(this.generateBracket());
      return _.map(bracket, function(region) {
        return _.map(region.rounds, function(round) {
          var returnRound = [];
          _.each(round, function(seed, index) {
            if (region.name !== 'FF') {
              returnRound[index] = {
                fromRegion: region.name,
                seed: seed,
                name: this.teamNameFromRegion(region.name, seed)
              };
            } else {
              returnRound[index] = {
                fromRegion: seed,
                seed: this.winningTeamFromRegion(seed),
                name: this.teamNameFromRegion(seed, this.winningTeamFromRegion(seed))
              };
            }
          }, this);
          return returnRound;
        }, this);
      }, this);
    },
    flatBracket: function() {
      return _.map(_.flatten(_.toArray(this.generateBracket())), function(region) {
        return region.name + _.flatten(region.rounds).join('');
      })
      .join('')
      .replace(new RegExp(firstRoundOrder.join(''), 'g'), '')
      .replace(new RegExp(this.generateFinalFour().join(''), 'g'), '');
    }
  };
};


var bg = new BracketGenerator({data: data}),
    flat,
    expanded,
    validated,
    noUpsets = new BracketGenerator({data: data, winners: 'higher'}),
    allUpsets= new BracketGenerator({data: data, winners: 'random'}),

    r = /^[a-zA-Z]{1,2}[0-9]{15,30}[a-zA-Z]{1,2}[0-9]{15,30}[a-zA-Z]{1,2}[0-9]{15,30}[a-zA-Z]{1,2}[0-9]{15,30}[a-zA-Z]{5,8}/;

console.log(r.test(noUpsets.flatBracket()))
console.log(r.test(allUpsets.flatBracket()))

/*
bg.winners('random');
expanded = bg.bracketWithTeamInfo();
flat = bg.flatBracket();
validated = validator.validateTournament(flat, false, true);


var iterations = 1 || Math.pow(2, firstRoundOrder.length-1),
    i = 0;

for (i; i < iterations; i++) {
  bg.winners('random' || _s.pad((i).toString(2), '15', '0'));
  expanded = bg.bracketWithTeamInfo();
  flat = bg.flatBracket();
  validated = validator.validateTournament(flat, false, false, noUpsets.flatBracket());

  console.log('BRACKET:', i, JSON.stringify(validated, null, 1));

  _.each(validated.regions, function(region, regionIndex) {
    _.each(region.rounds, function(round, roundIndex) {
      _.each(round.games, function(game, gameIndex) {
        var seed = expanded[regionIndex][roundIndex][gameIndex].seed,
            fromRegion = expanded[regionIndex][roundIndex][gameIndex].fromRegion;

        if (!(game === seed || fromRegion)) {
          throw new Error('');
        }
      });
    });
  });

  console.log('ALL GAMES MATCH');
  console.log('--------------------------')
};*/