var _ = require('lodash'),
    BracketValidator = require('./validator'),
    order = require('../data/ncaa-mens-basketball/order')(),
    consts = require('../data/ncaa-mens-basketball/consts'),
    data = require('../data/ncaa-mens-basketball/data')();

function Updater(options) {
  options = options || {};
  this.currentMaster = options.currentMaster;
  this.fromRegion = options.fromRegion;
  this.winningSeed = options.winningSeed;
  this.losingSeed = options.losingSeed;
}

Updater.prototype.update = function(cb) {

  var self = this;

  new BracketValidator({flatBracket: this.currentMaster}).validate(function(err, bracketData) {
    if (err) return cb(new Error('Bad bracket validation'), null);

    var region = bracketData[self.fromRegion] || _.find(bracketData, function(item) { return item.name.toLowerCase() === self.fromRegion.toLowerCase(); });
    if (!region) return cb(new Error('No region'), null);

    roundLoop: for (var i = 0, m = region.rounds.length; i < m; i++) {
      if (i > 0) {
        var round = region.rounds[i];
        gameLoop: for (var ii = 0, mm = round.length; ii < mm; ii++) {
          var roundGame = round[ii],
              otherTeam = round[(ii % 2 === 0) ? ii+1 : ii-1];
          if (roundGame !== null && roundGame.seed === self.winningSeed && otherTeam.seed === self.losingSeed) {
            region.rounds[i+1][Math.floor(ii/2)] = {seed: self.winningSeed};
            console.log(region.rounds[i+1])
            break roundLoop;
          }
        }
      }
    }

    cb(null, self.flatten(bracketData));
  });

};

Updater.prototype.flatten = function(bracket) {
  var flattenedBracket = '';
  _.each(bracket, function(bracketRegion) {
    var regionString =_.map(bracketRegion.rounds, function(round, roundIndex) {
      if (roundIndex === 0) return '';
      return _.map(round, function(roundGame) {
        if (roundGame === null) return 'X';
        if (_.isNumber(roundGame)) return roundGame;
        return roundGame.seed;
      }).join('');
    }).join('')
    .replace(new RegExp(order.join(''), 'g'), '')
    .replace(new RegExp(_.values(consts.REGION_IDS).join(''), 'g'), '');
    flattenedBracket += bracketRegion.id + regionString;
  });
  return flattenedBracket;
};

module.exports = Updater;
