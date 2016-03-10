var bracketData = require('bracket-data');
var BracketValidator = require('bracket-validator');
var _extend = require('lodash/object/assign');
var _defaults = require('lodash/object/defaults');
var _pick = require('lodash/object/pick');
var _find = require('lodash/collection/find');
var _each = require('lodash/collection/forEach');
var _map = require('lodash/collection/map');
var _isNumber = require('lodash/lang/isNumber');
var _isArray = require('lodash/lang/isArray');
var _values = require('lodash/object/values');
var _compact = require('lodash/array/compact');
var _intersection = require('lodash/array/intersection');


var teamNameMatches = function (team1, team2) {
    var team1Name = team1 && team1.name;
    var team1Names = team1 && team1.names;
    var team2Name = team2 && team2.name;
    var team2Names = team2 && team2.names;

    if (!_isArray(team1Name)) {
        team1Name = [team1Name];
    }

    if (team1Names) {
        team1Name = team1Name.concat(team1Names);
    }

    team1Name = _compact(team1Name.map(function (name) {
        return typeof name === 'string' ? name.toLowerCase() : null;
    }));

    if (!_isArray(team2Name)) {
        team2Name = [team2Name];
    }

    if (team2Names) {
        team2Name = team1Name.concat(team2Names);
    }

    team2Name = _compact(team2Name.map(function (name) {
        return typeof name === 'string' ? name.toLowerCase() : null;
    }));

    if (team1Name.length && team2Name.length) {
        return _intersection(team1Name, team2Name).length > 0;
    }

    return false;
};
var seedMatches = function (team1, team2) {
    return team1 && team2 && parseInt(team1.seed) === parseInt(team2.seed);
};


function Updater(options) {
    this.bracketData = bracketData({
        sport: options.sport,
        year: options.year
    });

    this.validator = new BracketValidator({
        sport: options.sport,
        year: options.year
    });

    return this.reset(options);
}

Updater.prototype.reset = function (options) {
    _defaults(options || {}, {
        winner: {},
        loser: {},
        fromRegion: ''
    });

    if (typeof options.winner === 'number' || !isNaN(options.winner)) options.winner = {seed: parseInt(options.winner, 10)};
    if (typeof options.loser === 'number' || !isNaN(options.loser)) options.loser = {seed: parseInt(options.loser, 10)};
    if (typeof options.winner === 'string' && isNaN(options.winner)) options.winner = {name: options.winner};
    if (typeof options.loser === 'string' && isNaN(options.loser)) options.loser = {name: options.loser};

    // If we got passed in null or something, set the properties we need to not break
    if (!options.winner) options.winner = {};
    if (!options.loser) options.loser = {};
    if (!options.winner.name) options.winner.name = '';
    if (!options.loser.name) options.loser.name = '';

    _extend(this, _pick(options, 'winner', 'loser', 'fromRegion', 'currentMaster'));

    return this;
};

Updater.prototype.hasWinner = function () {
    return !!(this.winner && (this.winner.name || this.winner.seed));
};

Updater.prototype.hasLoser = function () {
    return !!(this.loser && (this.loser.name || this.loser.seed));
};

Updater.prototype.isFinal = function () {
    var finalName = this.bracketData.constants.FINAL_NAME.toLowerCase(),
        finalId = this.bracketData.constants.FINAL_ID.toLowerCase(),
        region = this.fromRegion.toLowerCase();

    return region === finalName || region === finalId;
};

Updater.prototype.isChampionship = function () {
    return (/((National )?Championship( Game)?|NCG)/i).test(this.fromRegion);
};

Updater.prototype.teamMatches = function (team1, team2) {
    if (this.isFinal()) {
        return teamNameMatches(team1, team2);
    } else {
        return seedMatches(team1, team2);
    }
};

Updater.prototype.gameMatches = function (winner, loser) {
    return this.teamMatches(winner, this.winner) && this.teamMatches(loser, this.loser);
};

Updater.prototype.getSeed = function (winner) {
    if (this.isFinal()) {
        var finalTeams = this.validated[this.bracketData.constants.FINAL_ID].rounds[0];
        var finalTeam = _find(finalTeams, function (team) {
            return teamNameMatches(team, winner);
        }, this);
        return {fromRegion: finalTeam.fromRegion};
    } else {
        return {seed: winner.seed};
    }
};

Updater.prototype.flatten = function (bracket) {
    var self = this;
    var flattenedBracket = '';
    _each(bracket, function (bracketRegion) {
        var regionString = _map(bracketRegion.rounds, function (round, roundIndex) {
            if (roundIndex === 0) return '';
            return _map(round, function (roundGame) {
                if (roundGame === null) return self.bracketData.constants.UNPICKED_MATCH;
                if (_isNumber(roundGame) || !isNaN(roundGame)) return roundGame;
                if (bracketRegion.id === self.bracketData.constants.FINAL_ID) return roundGame.fromRegion;
                return roundGame.seed;
            }).join('');
        }).join('')
        .replace(new RegExp(self.bracketData.order.join(''), 'g'), '')
        .replace(new RegExp(_values(self.bracketData.constants.REGION_IDS).join(''), 'g'), '');
        flattenedBracket += bracketRegion.id + regionString;
    });
    return flattenedBracket;
};

Updater.prototype.update = function (options) {
    options && this.reset(options);
    var validated = this.validator.validate(this.currentMaster);
    if (validated instanceof Error) return validated;
    this.validated = validated;

    if (this.isChampionship()) {
        this.fromRegion = this.bracketData.constants.FINAL_ID;
    }

    var region = validated[this.fromRegion] || _find(validated, function (item) {
        return item.name.toLowerCase() === this.fromRegion.toLowerCase();
    }, this);

    if (!region) return new Error('No region');
    if (!this.hasWinner()) return new Error('Supply at least winning team');

    var regionRoundIndex = null;
    var nextRoundGameIndex = null;
    var i, ii, m, mm, round, roundGame, otherTeam;

    roundLoop:
    for (i = region.rounds.length; i-- > 0;) {
        round = region.rounds[i];
        for (ii = round.length; ii-- > 0;) {
            roundGame = round[ii],
            otherTeam = round[(ii % 2 === 0) ? ii + 1 : ii - 1];

            if (roundGame !== null) {
                if (this.hasWinner() && this.hasLoser() && this.gameMatches(roundGame, otherTeam)) {
                    // If we have a winner and a loser look for the game that matches both
                    // Place winner into the next round
                    regionRoundIndex = i + 1;
                    nextRoundGameIndex = Math.floor(ii / 2);
                    break roundLoop;
                } else {
                    // If there is no other team, it means we want to use the winner of the latest game they appear
                    // So if a user is picking a bracket, a winner can be picked without an opponent
                    if (this.teamMatches(roundGame, this.winner) && !this.hasLoser()) {
                        regionRoundIndex = i + 1;
                        nextRoundGameIndex = Math.floor(ii / 2);
                        otherTeam && (this.loser = otherTeam);
                        break roundLoop;
                    }
                }
            }
        }
    }

    if (regionRoundIndex !== null && nextRoundGameIndex !== null) {
        var hasRound = !!region.rounds[regionRoundIndex];
        if (hasRound) {
            region.rounds[regionRoundIndex][nextRoundGameIndex] = this.getSeed(this.winner);
            for (i = regionRoundIndex, m = region.rounds.length; i < m; i++) {
                round = region.rounds[i];
                for (ii = 0, mm = round.length; ii < mm; ii++) {
                    roundGame = round[ii],
                    otherTeam = round[(ii % 2 === 0) ? ii + 1 : ii - 1];
                    // The losing team might have already advanced in the bracket
                    // Such as when someone is picking a bracket and changed their mind
                    // We need to remove all of the losing team from the rest of the rounds
                    if (this.hasLoser() && roundGame !== null && this.teamMatches(roundGame, this.loser)) {
                        round[ii] = null;
                    }
                }
            }
        }
    }

    // Clear losing teams from final four also
    var isFinalRegion = this.fromRegion === this.bracketData.constants.FINAL_ID;
    if (this.hasLoser() && (!isFinalRegion || (isFinalRegion && regionRoundIndex === 1))) {
        var fin = validated[this.bracketData.constants.FINAL_ID];
        _each(fin.rounds, function (round, i) {
            if (i > 0) {
                _each(round, function (game, ii) {
                    if (game && teamNameMatches(game, this.loser)) {
                        validated[this.bracketData.constants.FINAL_ID].rounds[i][ii] = null;
                    }
                }, this);
            }
        }, this);
    }

    this.currentMaster = this.flatten(validated);
    return this.currentMaster;
};

module.exports = Updater;
