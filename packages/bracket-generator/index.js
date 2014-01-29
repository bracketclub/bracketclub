var BracketData = require('bracket-data'),
    _isString = require('lodash-node/modern/objects/isString'),
    _map = require('lodash-node/modern/collections/map'),
    _random = require('lodash-node/modern/utilities/random'),
    _uniq = require('lodash-node/modern/arrays/uniq'),
    _toArray = require('lodash-node/modern/collections/toArray'),
    _keys = require('lodash-node/modern/objects/keys'),
    _difference = require('lodash-node/modern/arrays/difference'),
    _flatten = require('lodash-node/modern/arrays/flatten'),
    _last = require('lodash-node/modern/arrays/last'),
    _find = require('lodash-node/modern/collections/find'),
    _cloneDeep = require('lodash-node/modern/objects/cloneDeep'),
    _each = require('lodash-node/modern/collections/forEach'),
    _has = require('lodash-node/modern/objects/has'),
    _omit = require('lodash-node/modern/objects/omit');


function Generator(options) {
    BracketData.call(this, options, {
        winners: '',
        generatedBracket: null,
        winnerCounter: 0,
        regionCounter: 0,
        finishedRegions: null,
    });
}

Generator.prototype = Object.create(BracketData.prototype, {
    constructor: {
        value: Generator
    }
});

Generator.prototype.reset = function (arg) {
    this.generatedBracket = null;
    this.finishedRegions = null;
    this.winners = arg;
    return this;
};

Generator.prototype.generateWinner = function (matchup) {

    if (_isString(matchup[0]) && _isString(matchup[1])) {
        matchup = _map(matchup, function (region) {
            return this.winningTeamFromRegion(region);
        }, this);
    }

    var possible = {
            random: _random(matchup.length - 1),
            // Higher means higher seed OR if seeds are the same 2nd team
            higher: function () {
                if (_uniq(matchup, true).length < 2) return 1;
                return matchup.indexOf(Math.max.apply(Math, matchup));
            },
            // Lower means lower seed OR if seeds are the same 1st team
            lower: function () {
                if (_uniq(matchup, true).length < 2) return 0;
                return matchup.indexOf(Math.min.apply(Math, matchup));
            }
        },
        pickIndex = (this.winners.length >= this.order.length) ?
                                    this.regionCounter * (this.order.length - 1) + (this.winnerCounter + 1) - 1 :
                                    this.winnerCounter,
        pick = this.winners.charAt(pickIndex),
        winner;

    if (pick === '1') {
        winner = possible.higher();
    } else if (pick === '0') {
        winner = possible.lower();
    } else if (typeof possible[this.winners] === 'function') {
        winner = possible[this.winners]();
    } else if (typeof possible[this.winners] !== 'undefined') {
        winner = possible[this.winners];
    }

    return (winner >= 0 && winner < matchup.length) ? winner : possible.random;
};

Generator.prototype.generateRound = function (opts) {
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

Generator.prototype.generateRounds = function (opts) {
    var optRound = _toArray(opts.round),
            round = this.generateRound({seeds: opts.round}),
            rounds = (opts.rounds || []);

    if (rounds.length === 0) {
        rounds.push(optRound);
    }
    rounds.push(_toArray(round));

    if (round.length === 1) {
        this.regionCounter++;
        return rounds;
    } else {
        return this.generateRounds({round: round,  rounds: rounds});
    }
};

Generator.prototype.generateRegion = function (region, key) {
    this.winnerCounter = 0;
    return {id: key, rounds: this.generateRounds({round: this.order.slice()})};
};

Generator.prototype.generateRegions = function () {
    this.regionCounter = 0;
    var regions = _map(this.bracket.regions, this.generateRegion, this);
    this.finishedRegions = regions;
    return regions;
};

Generator.prototype.generateBracket = function () {
    if (this.generatedBracket === null) {
        this.generatedBracket = this.generateRegions().concat(this.generateFinal());
    }
    return this.generatedBracket;
};

Generator.prototype.generateFinalFour = function () {
    var regions = _keys(this.bracket.regions),
            firstTeam = regions[0],
            matchup1 = [firstTeam, this.bracket.regions[firstTeam].sameSideAs],
            matchup2 = _difference(regions, matchup1);
    return _flatten([matchup1, matchup2]);
};

Generator.prototype.generateFinal = function () {
    this.winnerCounter = 0;
    return {id: this.constants.FINAL_ID, name: this.constants.FINAL_NAME, rounds: this.generateRounds({round: this.generateFinalFour()})};
};

Generator.prototype.winningTeamFromRegion = function (fromRegion) {
    var hasFinishedRegions = !!(this.finishedRegions.length),
            regions = (hasFinishedRegions) ? this.finishedRegions : this.generateBracket();
    return _last(_find(regions, function (region) {
        return region.id === fromRegion;
    }).rounds)[0];
};

Generator.prototype.teamNameFromRegion = function (regionName, seed) {
    return this.bracket.regions[regionName].teams[seed - 1];
};

Generator.prototype.teamNameFromRegion = function (regionName, seed) {
    return this.data.regions[regionName].teams[seed - 1];
};

Generator.prototype.bracketWithTeamInfo = function () {
    var bracket = _toArray(this.generateBracket()),
            originalData = _cloneDeep(this.bracket.regions);

    _each(bracket, function (region) {
        if (!_has(originalData, region.id)) originalData[region.id] = _omit(region, 'rounds');
        originalData[region.id].id = region.id;
        originalData[region.id].rounds = _map(region.rounds, function (round) {
            var returnRound = [];
            _each(round, function (seed, index) {
                if (region.id === this.constants.FINAL_ID) {
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

Generator.prototype.flatBracket = function () {
    return _map(_flatten(_toArray(this.generateBracket())), function (region) {
        return region.id + _flatten(region.rounds).join('');
    }).join('')
    .replace(new RegExp(this.order.join(''), 'g'), '')
    .replace(new RegExp(this.generateFinalFour().join(''), 'g'), '');
};

module.exports = Generator;
