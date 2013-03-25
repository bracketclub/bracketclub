var _ = require('lodash'),
    async = require('async'),

    BracketValidator = require('./validator'),
    BracketGenerator = require('./generator'),
    CONSTS = require('../data/ncaa-mens-basketball/consts'),
    scoringData = require('../data/ncaa-mens-basketball/scoring')();


function Scorer(options) {
  options = options || {};
  this.validateUser = new BracketValidator({flatBracket: options.userBracket});
  this.validateMaster = new BracketValidator({flatBracket: options.masterBracket});
  this.otherData = options.otherData || {};
  this.roundPoints = options.roundPoints || scoringData.standard;
}

Scorer.prototype.diff = function(cb) {
  var self = this;

  self.startDiff(function(err, results) {
    if (err) return cb(err, null);

    var validatedUser = results[0],
        validatedMaster = results[1],
        diff = _.cloneDeep(validatedUser),
        eliminatedTeams = [];

    _.each(validatedUser, function(region, regionId) {
      _.each(region.rounds, function(round, round_i) {
        if (round_i > 0 || regionId === CONSTS.FINAL_ID) {
          _.each(round, function(game, game_i) {

            var masterGame = validatedMaster[regionId].rounds[round_i][game_i];

            if (masterGame === null) {
              // Hasn't been played yet
              if (_.contains(eliminatedTeams, game.fromRegion + game.seed)) {
                // An unplayed game with a team that is eliminated
                diff[regionId].rounds[round_i][game_i].eliminated = true;
              }
            } else {
              // You got it wrong
              if (!_.isEqual(game, masterGame)) {
                diff[regionId].rounds[round_i][game_i].correct = false;
                diff[regionId].rounds[round_i][game_i].shouldBe = masterGame;
                eliminatedTeams.push(game.fromRegion + game.seed);
              } else {
                diff[regionId].rounds[round_i][game_i].correct = true;
              }
            }
          }, self);
        }
      }, self);
    }, self);

    cb(null, diff);

  });
};

Scorer.prototype.startDiff = function(cb) {

  var self = this;

  async.parallel([
    function(cb) {
      self.validateUser.validate(cb);
    },
    function(cb) {
      self.validateMaster.validate(cb);
    }
  ], cb);

};

Scorer.prototype.gooley = function(cb) {
  var self = this;

  self.startDiff(function(err, results) {
    if (err) return cb(err, null);

    var validatedUser = results[0],
        validatedMaster = results[1],
        totalPoints = 0;

    _.each(validatedUser, function(region, regionId) {
      _.each(region.rounds, function(round, round_i) {
        if (round_i > 0) {
          _.each(round, function(game, game_i) {

            var masterGame = validatedMaster[regionId].rounds[round_i][game_i];

            if (masterGame !== CONSTS.UNPICKED_MATCH && _.isEqual(game, masterGame)) {
              totalPoints += scoringData.gooley[round_i-1][game.seed-1];
            }
          }, self);
        }
      }, self);
    }, self);

    self.otherData.gooley = totalPoints;
    cb(null, self.otherData);
  });
};

Scorer.prototype.getScore = function(cb) {
  var self = this;

  self.startDiff(function(err, results) {
    if (err) return cb(err, null);

    var validatedUser = results[0],
        validatedMaster = results[1],
        rounds = [],
        correctCounter = 0;

    _.each(validatedUser, function(region, regionId) {
      _.each(region.rounds, function(round, round_i) {
        if (round_i > 0) {
          _.each(round, function(game, game_i) {

            var masterGame = validatedMaster[regionId].rounds[round_i][game_i];

            if (masterGame !== CONSTS.UNPICKED_MATCH && _.isEqual(game, masterGame)) {
              correctCounter++;
            }
          }, self);
          var regionIndex = (regionId === CONSTS.FINAL_ID) ? CONSTS.REGION_COUNT + round_i - 1 : round_i - 1;
          if (rounds[regionIndex] === undefined) {
            rounds[regionIndex] = correctCounter;
          } else {
            rounds[regionIndex] += correctCounter;
          }
          correctCounter = 0;
        }
      }, self);
    }, self);

    self.otherData.totalScore = _.reduce(rounds, function(memo, num, i){ return memo + (num * (self.roundPoints[i] || 1)); }, 0);
    self.otherData.rounds = rounds;
    cb(null, self.otherData);
  });
};

module.exports = Scorer;
