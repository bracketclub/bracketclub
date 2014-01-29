var BracketValidator = require('bracket-validator'),
    BracketData = require('bracket-data'),
    _cloneDeep = require('lodash-node/modern/objects/cloneDeep'),
    _each = require('lodash-node/modern/collections/forEach'),
    _contains = require('lodash-node/modern/collections/contains'),
    _isEqual = require('lodash-node/modern/objects/isEqual'),
    _reduce = require('lodash-node/modern/collections/reduce');


function Scorer(options) {
    BracketData.call(this, options, {
        otherData: {}
    });
    this.validateUser = new BracketValidator({flatBracket: options.userBracket, year: this.year});
    this.validateMaster = new BracketValidator({flatBracket: options.masterBracket, year: this.year});
}

Scorer.prototype = Object.create(BracketData.prototype, {
    constructor: {
        value: Scorer
    }
});

Scorer.prototype.diff = function () {
    var validatedUser = this.validateUser.validate(),
        validatedMaster = this.validateMaster.validate(),
        diff = _cloneDeep(validatedUser),
        eliminatedTeams = [];

    _each(validatedUser, function (region, regionId) {
        _each(region.rounds, function (round, round_i) {
            if (round_i > 0 || regionId === this.constants.FINAL_ID) {
                _each(round, function (game, game_i) {
                    var masterGame = validatedMaster[regionId].rounds[round_i][game_i];

                    if (masterGame === null) {
                        // Hasn't been played yet
                        if (_contains(eliminatedTeams, game.fromRegion + game.seed)) {
                            // An unplayed game with a team that is eliminated
                            diff[regionId].rounds[round_i][game_i].eliminated = true;
                        }
                    } else {
                        // You got it wrong
                        if (!_isEqual(game, masterGame)) {
                            diff[regionId].rounds[round_i][game_i].correct = false;
                            diff[regionId].rounds[round_i][game_i].shouldBe = masterGame;
                            eliminatedTeams.push(game.fromRegion + game.seed);
                        } else {
                            diff[regionId].rounds[round_i][game_i].correct = true;
                        }
                    }
                }, this);
            }
        }, this);
    }, this);

    return diff;
};

Scorer.prototype.gooley = function () {
    var validatedUser = this.validateUser.validate(),
        validatedMaster = this.validateMaster.validate(),
        totalPoints = 0;

    _each(validatedUser, function (region, regionId) {
        _each(region.rounds, function (round, round_i) {
            if (round_i > 0) {
                _each(round, function (game, game_i) {
                    var masterGame = validatedMaster[regionId].rounds[round_i][game_i];

                    if (masterGame !== this.constants.UNPICKED_MATCH && _isEqual(game, masterGame)) {
                        totalPoints += (this.scoring.gooley[round_i - 1][game.seed - 1] * 10);
                    }
                }, this);
            }
        }, this);
    }, this);

    this.otherData.gooley = totalPoints / 10;
    return this.otherData;
};

Scorer.prototype.getScore = function () {
    var validatedUser = this.validateUser.validate(),
            validatedMaster = this.validateMaster.validate(),
            rounds = [],
            correctCounter = 0;

    _each(validatedUser, function (region, regionId) {
        _each(region.rounds, function (round, round_i) {
            if (round_i > 0) {
                _each(round, function (game, game_i) {
                    var masterGame = validatedMaster[regionId].rounds[round_i][game_i];

                    if (masterGame !== this.constants.UNPICKED_MATCH && _isEqual(game, masterGame)) {
                        correctCounter++;
                    }
                }, this);
                var regionIndex = (regionId === this.constants.FINAL_ID) ? this.constants.REGION_COUNT + round_i - 1 : round_i - 1;
                if (rounds[regionIndex] === undefined) {
                    rounds[regionIndex] = correctCounter;
                } else {
                    rounds[regionIndex] += correctCounter;
                }
                correctCounter = 0;
            }
        }, this);
    }, this);

    this.otherData.totalScore = _reduce(rounds, function (memo, num, i) {
        return memo + (num * (this.scoring.standard[i] || 1));
    }, 0, this);
    this.otherData.rounds = rounds;

    return this.otherData;
};

module.exports = Scorer;
