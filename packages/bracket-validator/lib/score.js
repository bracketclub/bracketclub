var _ = require('lodash'),
    async = require('async'),

    BracketValidator = require('./validator'),
    BracketGenerator = require('./generator'),
    CONSTS = require('../data/ncaa-mens-basketball/consts');


function Scorer(options) {
  options = options || {};
  this.validateUser = new BracketValidator({flatBracket: options.userBracket});
  this.validateMaster = new BracketValidator({flatBracket: options.masterBracket});
}

Scorer.prototype.diff = function(cb) {
  var self = this;

  self.startDiff(function(err, results) {
    if (err) return cb(err, null);

    var validatedUser = results[0],
        validatedMaster = results[1];
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

    cb(null, rounds);
  });
};

module.exports = Scorer;
