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
        fromRegion: null,
        winningSeed: null,
        losingSeed: null,
    });
}

Updater.prototype = Object.create(BracketData.prototype, {
    constructor: {
        value: Updater
    }
});

Updater.prototype.update = function () {
    var bv = new BracketValidator({flatBracket: this.currentMaster, year: this.year}),
            validated = bv.validate(),
            bracketData = validated;

    if (bracketData instanceof Error) return bracketData;

    var region = bracketData[this.fromRegion] || _find(bracketData, function (item) {
        return item.name.toLowerCase() === this.fromRegion.toLowerCase();
    }, this);

    if (!region) return new Error('No region');

    roundLoop:
    for (var i = 0, m = region.rounds.length; i < m; i++) {
        if (i > 0) {
            var round = region.rounds[i];
            gameLoop:
            for (var ii = 0, mm = round.length; ii < mm; ii++) {
                var roundGame = round[ii],
                    otherTeam = round[(ii % 2 === 0) ? ii + 1 : ii - 1];
                if (roundGame !== null && roundGame.seed === this.winningSeed && otherTeam.seed === this.losingSeed) {
                    region.rounds[i + 1][Math.floor(ii / 2)] = {seed: this.winningSeed};
                    break roundLoop;
                }
            }
        }
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
                if (_isNumber(roundGame)) return roundGame;
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
