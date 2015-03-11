var BracketValidator = require('bracket-validator');
var BracketData = require('bracket-data');
var _bind = require('lodash/function/bind');
var _each = require('lodash/collection/forEach');
var _map = require('lodash/collection/map');
var _uniq = require('lodash/array/uniq');
var _some = require('lodash/collection/some');
var _contains = require('lodash/collection/contains');
var _isArray = require('lodash/lang/isArray');
var _cloneDeep = require('lodash/lang/cloneDeep');
var _extend = require('lodash/object/assign');
var _isPlainObject = require('lodash/lang/isPlainObject');


var getResult = {
    totalScore: function (bd, result) {
        if (result.status !== 'correct') return 0;

        var scoringSystem = bd.scoring[result.type];

        if (typeof scoringSystem === 'undefined') throw new Error('There is no scoring system: ' + result.type);

        if (_isArray(scoringSystem) && typeof scoringSystem[0] === 'number' && scoringSystem.length === initialValues.rounds(bd).length) {
            // The scoring system is an array of numbers that is equal to the number of rounds
            // So we return the value for the current round
            return scoringSystem[result.roundIndex] * 10;
        } else if (_isArray(scoringSystem) && _isArray(scoringSystem[0]) && scoringSystem.length === initialValues.rounds(bd).length && scoringSystem[0].length === bd.constants.TEAMS_PER_REGION) {
            // The scoring system is an array of arrays. There is one array for each round
            // and each sub-array has one value for each seed. So we return the value for the current round+seed
            return scoringSystem[result.roundIndex][result.seed - 1] * 10;
        } else if (typeof scoringSystem === 'number') {
            return scoringSystem * 10;
        }

        throw new Error('Cant do anything with scoring system: ' + result.type);
    },
    diff: function (bd, options) {
        if (options.status === 'incorrect') {
            if (options.diff) {
                options.diff[options.regionId].rounds[options.roundIndex][options.gameIndex].correct = false;
                options.diff[options.regionId].rounds[options.roundIndex][options.gameIndex].shouldBe = options.masterGame;
            }
            options.eliminated.push(options.game.fromRegion + options.game.seed);
        } else if (options.status === 'correct') {
            if (options.diff) {
                options.diff[options.regionId].rounds[options.roundIndex][options.gameIndex].correct = true;
            }
        } else if (options.status === 'unplayed' && _contains(options.eliminated, options.game.fromRegion + options.game.seed)) {
            if (options.diff) {
                options.diff[options.regionId].rounds[options.roundIndex][options.gameIndex].eliminated = true;
            }
        } else if (options.status === 'unplayed' && options.pprMethods.length && options.getScoreResult) {
            _each(options.pprMethods, function (pprMethod) {
                options.results[pprMethod] += this.totalScore(bd, {
                    roundIndex: options.trueRoundIndex,
                    status: 'correct',
                    seed: options.game.seed,
                    type: pprMethod.replace('PPR', '')
                });
            }, this);
        }
    },
    rounds: function (options) {
        options.rounds[options.roundIndex] += (options.status === 'correct' ? 1 : 0);
    }
};

var initialValues = {
    rounds: function (bd) {
        var teamCount = bd.constants.TEAMS_PER_REGION * bd.constants.REGION_COUNT;
        var rounds = [];
        while (teamCount > 1) {
            rounds.push(0);
            teamCount = teamCount / 2;
        }
        return rounds;
    },
    diff: function (entry) { return _cloneDeep(entry); },
};


function Scorer(options) {
    this.bracketData = new BracketData({
        sport: options.sport,
        year: options.year,
        props: ['constants', 'scoring', 'bracket']
    });

    // Create convenience methods
    _each(_extend(this.bracketData.scoring, options.scoring || {}), function (system, key) {
        this[key + 'PPR'] = _bind(this.score, this, [key + 'PPR']);
        this[key] = _bind(this.score, this, [key]);
    }, this);

    this.entryValidator = new BracketValidator({year: options.year, sport: options.sport});
    this.masterValidator = new BracketValidator({year: options.year, sport: options.sport});

    return this.reset(options);
}

Scorer.prototype.reset = function (options) {
    if (options.entry) {
        if (Array.isArray(options.entry)) {
            this.validatedEntry = options.entry.map(function (entry) {
                if (typeof entry === 'string') {
                    return this.entryValidator.validate(entry);
                } else {
                    return _extend({}, entry, {
                        score: this.entryValidator.validate(entry.bracket),
                    });
                }
            }, this);
        } else {
            this.validatedEntry = this.entryValidator.validate(options.entry);
        }
    }
    if (options.master) {
        this.validatedMaster = this.masterValidator.validate(options.master);
    }
    return this;
};

// Default convenience methods
Scorer.prototype.diff = function (options) {
    return this.score(['diff'], options);
};

Scorer.prototype.rounds = function (options) {
    return this.score(['rounds'], options);
};

// Generic score method
Scorer.prototype.score = function (methods, options) {
    if (_isPlainObject(methods) && (methods.entry || methods.master) && !options) {
        options = methods;
    }

    options && this.reset(options);

    if (typeof methods === 'string') {
        methods = [methods];
    } else if (!methods || !_isArray(methods)) {
        methods = ['rounds'];
    }

    if (Array.isArray(this.validatedEntry)) {
        return this.validatedEntry.map(function (entry) {
            if (entry.score) {
                return _extend({}, entry, {
                    score: this._roundLoop(entry.score, methods)
                });
            } else {
                return this._roundLoop(entry, methods);
            }
        }, this);
    } else {
        return this._roundLoop(this.validatedEntry, methods);
    }
};

Scorer.prototype._roundLoop = function (entry, methods) {
    var results = {};
    var self = this;
    var eliminatedTeams = [];
    var pprMethods = [];
    _each(methods, function (method) {
        if (method.indexOf('PPR') > -1) pprMethods.push(method);
        if (method === 'rounds') {
            results[method] = initialValues.rounds(self.bracketData);
        } else {
            results[method] = initialValues[method] ? initialValues[method](entry) : 0;
        }
    }, this);

    _each(entry, function (region, regionId) {
        var isFinal = regionId === self.bracketData.constants.FINAL_ID;
        _each(region.rounds, function (games, roundIndex) {
            var trueRoundIndex = (isFinal ? self.bracketData.constants.REGION_COUNT + roundIndex : roundIndex) - 1;
            var getScoreResult = roundIndex > 0;
            var getDiffResult = getScoreResult || isFinal;
            if (getScoreResult || getDiffResult) {
                _each(games, function (game, gameIndex) {
                    var masterGame = this.validatedMaster[regionId].rounds[roundIndex][gameIndex];
                    var status;

                    // Set the status of the result
                    if (masterGame === null) {
                        status = 'unplayed';
                    } else if (game.name === masterGame.name) {
                        status = 'correct';
                    } else {
                        status = 'incorrect';
                    }

                    // The diff methods needs to be called to get the diff result or any PPR results
                    var callableMethods;
                    var hasDiff = _contains(methods, 'diff');
                    var hasPPR = _some(methods, function (m) { return m.indexOf('PPR') > -1; });
                    // But we should only call it once
                    if (hasDiff || hasPPR) {
                        callableMethods = _uniq(_map(methods, function (m) {
                            return m.indexOf('PPR') > -1 ? 'diff' : m;
                        }));
                    }
                    // Process method for each result
                    _each(callableMethods || methods, function (method) {
                        if (method === 'rounds' && getScoreResult) {
                            getResult[method]({
                                rounds: results.rounds,
                                roundIndex: trueRoundIndex,
                                status: status
                            });
                        } else if (method === 'diff') {
                            getResult.diff(self.bracketData, {
                                diff: results.diff,
                                regionId: regionId,
                                roundIndex: roundIndex,
                                trueRoundIndex: trueRoundIndex,
                                gameIndex: gameIndex,
                                game: game,
                                status: status,
                                eliminated: eliminatedTeams,
                                masterGame: masterGame,
                                pprMethods: pprMethods,
                                results: results,
                                getScoreResult: getScoreResult
                            });
                        } else if (getScoreResult) {
                            results[method] += getResult.totalScore(self.bracketData, {
                                roundIndex: trueRoundIndex,
                                status: status,
                                seed: game.seed,
                                type: method
                            });
                        }
                    }, this);
                }, this);
            }
        }, this);
    }, this);

    // Any total score is a number and we multipled by 10 originally to support tenth place decimals
    _each(results, function (val, key, list) {
        if (typeof val === 'number') {
            list[key] = val / 10;
        }
    });

    return methods.length === 1 ? results[methods[0]] : results;
};

module.exports = Scorer;
