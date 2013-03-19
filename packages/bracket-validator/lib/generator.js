var _ = require('lodash'),
    thisData = require('../data/ncaa-mens-basketball/data')(),
    thisOrder = require('../data/ncaa-mens-basketball/order')(),
    CONSTS = require('../data/ncaa-mens-basketball/consts');

function Generator(options) {
  options = options || {};
  this.data = options.data || thisData;
  this.firstRoundOrder = options.order || thisOrder;
  this.howToPickWinners = options.winners || '';
  this.generatedBracket = null;
  this.winnerCounter = 0;
  this.regionCounter = 0;
  this.finishedRegions = null;
}

Generator.prototype.winners = function(arg) {
  this.generatedBracket = null;
  this.finishedRegions = null;
  this.howToPickWinners = arg;
  return this;
};

Generator.prototype.generateWinner = function(matchup) {

  if (_.isString(matchup[0]) && _.isString(matchup[1])) {
    matchup = _.map(matchup, function(region) {
      return this.winningTeamFromRegion(region);
    }, this);
  }

  var possible = {
        random: _.random(matchup.length-1),
        // Higher means higher seed OR if seeds are the same 2nd team
        higher: function() {
          if (_.uniq(matchup, true).length < 2) return 1;
          return matchup.indexOf(Math.max.apply(Math, matchup));
        },
        // Lower means lower seed OR if seeds are the same 1st team
        lower: function() {
          if (_.uniq(matchup, true).length < 2) return 0;
          return matchup.indexOf(Math.min.apply(Math, matchup));
        }
      },
      pickIndex = (this.howToPickWinners.length >= this.firstRoundOrder.length) ?
                    this.regionCounter * (this.firstRoundOrder.length - 1) + (this.winnerCounter + 1) - 1 :
                    this.winnerCounter,
      pick = this.howToPickWinners.charAt(pickIndex),
      winner;

  if (pick === "1") {
    winner = possible.higher();
  } else if (pick === "0") {
    winner = possible.lower();
  } else if (typeof possible[this.howToPickWinners] === 'function') {
    winner = possible[this.howToPickWinners]();
  } else if (typeof possible[this.howToPickWinners] !== 'undefined') {
    winner = possible[this.howToPickWinners];
  }

  return (winner >= 0 && winner < matchup.length) ? winner : possible.random;
};

Generator.prototype.generateRound = function(opts) {
  var seeds = opts.seeds,
      matchup = [seeds[0], seeds[1]],
      winner = matchup[this.generateWinner(matchup)],
      winners = (opts.winners || []).concat(winner),
      remainingSeeds = seeds.splice(2);

  this.winnerCounter++;

  if (remainingSeeds.length === 0) {
    return winners;
  } else {
    return this.generateRound({seeds: remainingSeeds, winners: winners});
  }
};

Generator.prototype.generateRounds = function(opts) {
  var optRound = _.toArray(opts.round),
      round = this.generateRound({seeds: opts.round}),
      rounds = (opts.rounds || []);

  if (rounds.length === 0) {
    rounds.push(optRound);
  }
  rounds.push(_.toArray(round));

  if (round.length === 1) {
    this.regionCounter++;
    return rounds;
  } else {
    return this.generateRounds({round: round,  rounds: rounds});
  }
};

Generator.prototype.generateRegion = function(region, key) {
  this.winnerCounter = 0;
  return {id: key, rounds: this.generateRounds({round: this.firstRoundOrder.slice()})};
};

Generator.prototype.generateRegions = function() {
  this.regionCounter = 0;
  var regions = _.map(this.data.regions, this.generateRegion, this);
  this.finishedRegions = regions;
  return regions;
};

Generator.prototype.generateBracket = function() {
  if (this.generatedBracket === null) {
    this.generatedBracket = this.generateRegions().concat(this.generateFinal());
  }
  return this.generatedBracket;
};

Generator.prototype.generateFinalFour = function() {
  var regions = _.keys(this.data.regions),
      firstTeam = regions[0],
      matchup1 = [firstTeam, this.data.regions[firstTeam].sameSideAs],
      matchup2 = _.difference(regions, matchup1);

  return _.flatten([matchup1, matchup2]);
};

Generator.prototype.generateFinal = function() {
  this.winnerCounter = 0;
  return {id: CONSTS.FINAL_ID, name: CONSTS.FINAL_NAME, rounds: this.generateRounds({round: this.generateFinalFour()})};
};

Generator.prototype.winningTeamFromRegion = function(fromRegion) {
  var hasFinishedRegions = !!(this.finishedRegions.length),
      regions = (hasFinishedRegions) ? this.finishedRegions : this.generateBracket();
  return _.last(_.find(regions, function(region) {
    return region.id === fromRegion;
  }).rounds)[0];
};

Generator.prototype.teamNameFromRegion = function(regionName, seed) {
  return this.data.regions[regionName].teams[seed-1];
};

Generator.prototype.bracketWithTeamInfo = function() {
  var bracket = _.toArray(this.generateBracket()),
      originalData = _.cloneDeep(this.data.regions);

  _.each(bracket, function(region) {
    if (!_.has(originalData, region.id)) originalData[region.id] = _.omit(region, 'rounds');
    originalData[region.id].id = region.id;
    originalData[region.id].rounds = _.map(region.rounds, function(round) {
      var returnRound = [];
      _.each(round, function(seed, index) {
        if (region.id === CONSTS.FINAL_ID) {
          returnRound[index] = {
            fromRegion: seed,
            seed: this.winningTeamFromRegion(seed),
            name: this.teamNameFromRegion(seed, this.winningTeamFromRegion(seed))
          };
        } else {
          returnRound[index] = {
            fromRegion: region.id,
            seed: seed,
            name: this.teamNameFromRegion(region.id, seed)
          };
        }
      }, this);
      return returnRound;
    }, this);
  }, this);

  return originalData;
};

Generator.prototype.flatBracket = function() {
  return _.map(_.flatten(_.toArray(this.generateBracket())), function(region) {
    return region.id + _.flatten(region.rounds).join('');
  })
  .join('')
  .replace(new RegExp(this.firstRoundOrder.join(''), 'g'), '')
  .replace(new RegExp(this.generateFinalFour().join(''), 'g'), '');
};

module.exports = Generator;
