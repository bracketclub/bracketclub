var BracketData = require('bracket-data'),
    BracketValidator = require('bracket-validator'),
    _find = require('lodash-node/modern/collections/find'),
    _each = require('lodash-node/modern/collections/forEach'),
    _map = require('lodash-node/modern/collections/map'),
    _isNumber = require('lodash-node/modern/objects/isNumber'),
    _values = require('lodash-node/modern/objects/values');

function Updater(options) {
    BracketData.call(this, options, {
        currentMaster: null,
        fromRegion: '',
        winner: {},
        loser: {},
    });
    if (typeof this.winner === 'number' || !isNaN(this.winner)) this.winner = {seed: parseInt(this.winner, 10)};
    if (typeof this.loser === 'number' || !isNaN(this.loser)) this.loser = {seed: parseInt(this.loser, 10)};
    if (typeof this.winner === 'string' && isNaN(this.winner)) this.winner = {name: this.winner};
    if (typeof this.loser === 'string' && isNaN(this.loser)) this.loser = {name: this.loser};

    if (!this.winner.name) this.winner.name = '';
    if (!this.loser.name) this.loser.name = '';
}

Updater.prototype = Object.create(BracketData.prototype, {
    constructor: {
        value: Updater
    }
});

Updater.prototype.isFinal = function () {
    var finalName = this.constants.FINAL_NAME.toLowerCase(),
        finalId = this.constants.FINAL_ID.toLowerCase(),
        region = this.fromRegion.toLowerCase();

    return region === finalName || region === finalId;
};

Updater.prototype.isChampionship = function () {
    return (/((National )?Championship( Game)?|NCG)/i).test(this.fromRegion);
};

Updater.prototype.teamNameMatches = function (team1, team2) {
    return team1.name.toLowerCase() === team2.name.toLowerCase();
};

Updater.prototype.seedMatches = function (team1, team2) {
    return parseInt(team1.seed) === parseInt(team2.seed);
};

Updater.prototype.teamMatches = function (team1, team2) {
    if (this.isFinal()) {
        return this.teamNameMatches(team1, team2);
    } else {
        return this.seedMatches(team1, team2);
    }
};

Updater.prototype.gameMatches = function (winner, loser) {
    return this.teamMatches(winner, this.winner) && this.teamMatches(loser, this.loser);
};

Updater.prototype.getSeed = function (winner) {
    if (this.isFinal()) {
        var finalTeams = this.bracketData[this.constants.FINAL_ID].rounds[0];
        var finalTeam = _find(finalTeams, function (team) {
            return this.teamNameMatches(team, winner);
        }, this);
        return {fromRegion: finalTeam.fromRegion};
    } else {
        return {seed: winner.seed};
    }
};

Updater.prototype.update = function () {
    var bracketData = new BracketValidator({flatBracket: this.currentMaster, year: this.year}).validate();
    if (bracketData instanceof Error) return bracketData;
    this.bracketData = bracketData;

    if (this.isChampionship()) {
        this.fromRegion = this.constants.FINAL_ID;
    }

    var region = bracketData[this.fromRegion] || _find(bracketData, function (item) {
        return item.name.toLowerCase() === this.fromRegion.toLowerCase();
    }, this);

    if (!region) return new Error('No region');

    var regionRoundIndex = null;
    var nextRoundGameIndex = null;

    roundLoop:
    for (var i = 0, m = region.rounds.length; i < m; i++) {
        var round = region.rounds[i];
        for (var ii = 0, mm = round.length; ii < mm; ii++) {
            var roundGame = round[ii],
                otherTeam = round[(ii % 2 === 0) ? ii + 1 : ii - 1];

            if (roundGame !== null) {
                if (otherTeam && this.gameMatches(roundGame, otherTeam)) {
                    region.rounds[i + 1][Math.floor(ii / 2)] = this.getSeed(this.winner);
                    break roundLoop;
                } else {
                    // If there is no other team, it means we are updating an incomplete bracket
                    // So if a user is picking a bracket, a winner can be picked without and opponent
                    // We dont break from the loop since we want to find the latest round that the team appears
                    if (this.teamMatches(roundGame, this.winner)) {
                        regionRoundIndex = i + 1;
                        nextRoundGameIndex = Math.floor(ii / 2);
                    }
                }
            }
        }
    }

    // This means we found our winner but there is no oppnent, but still set the next round
    if (regionRoundIndex !== null && nextRoundGameIndex !== null) {
        region.rounds[regionRoundIndex][nextRoundGameIndex] = this.getSeed(this.winner);
    }

    return this.flatten(bracketData);

};

Updater.prototype.flatten = function (bracket) {
    var flattenedBracket = '';
    _each(bracket, function (bracketRegion) {
        var regionString = _map(bracketRegion.rounds, function (round, roundIndex) {
            if (roundIndex === 0) return '';
            return _map(round, function (roundGame) {
                if (roundGame === null) return this.constants.UNPICKED_MATCH;
                if (_isNumber(roundGame) || !isNaN(roundGame)) return roundGame;
                if (bracketRegion.id === this.constants.FINAL_ID) return roundGame.fromRegion;
                return roundGame.seed;
            }, this).join('');
        }, this).join('')
        .replace(new RegExp(this.order.join(''), 'g'), '')
        .replace(new RegExp(_values(this.constants.REGION_IDS).join(''), 'g'), '');
        flattenedBracket += bracketRegion.id + regionString;
    }, this);
    return flattenedBracket;
};

module.exports = Updater;
