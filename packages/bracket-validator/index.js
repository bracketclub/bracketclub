var BracketData = require('bracket-data'),
    _all = require('lodash-node/modern/collections/every'),
    _include = require('lodash-node/modern/collections/contains'),
    _map = require('lodash-node/modern/collections/map'),
    _toArray = require('lodash-node/modern/collections/toArray'),
    _range = require('lodash-node/modern/arrays/range'),
    _keys = require('lodash-node/modern/objects/keys'),
    _difference = require('lodash-node/modern/arrays/difference'),
    _isArray = require('lodash-node/modern/objects/isArray'),
    _some = require('lodash-node/modern/collections/some'),
    _filter = require('lodash-node/modern/collections/filter'),
    _pluck = require('lodash-node/modern/collections/pluck'),
    _find = require('lodash-node/modern/collections/find'),
    _cloneDeep = require('lodash-node/modern/objects/cloneDeep'),
    _each = require('lodash-node/modern/collections/forEach'),
    _extend = require('lodash-node/modern/objects/assign'),
    _last = require('lodash-node/modern/arrays/last'),
    _without = require('lodash-node/modern/arrays/without'),
    _compact = require('lodash-node/modern/arrays/compact'),
    _uniq = require('lodash-node/modern/arrays/uniq'),
    _indexOf = require('lodash-node/modern/arrays/indexOf'),
    _contains = require('lodash-node/modern/collections/contains'),
    _subset = function (small, big) {
        if (small.length === 0) return true;
        return _all(small, function (n) {
            return _include(big, n);
        });
    };

function Validator(options) {
    BracketData.call(this, options, {
        testOnly: false,
        notEmpty: false
    });
    this.flatBracket = (this.flatBracket || ((this.notEmpty) ? '' : this.constants.empty)).toUpperCase();
}

Validator.prototype = Object.create(BracketData.prototype, {
    constructor: {
        value: Validator
    }
});

Validator.prototype.wrapError = function () {
    return {
        error: true,
        result: new Error(_map(_toArray(arguments), function (arg) {
            return (typeof arg.message === 'string') ? arg.message : arg.toString();
        }).join(', '))
    };
};

Validator.prototype.wrapSuccess = function (result) {
    return {
        error: null,
        result: result
    };
};

Validator.prototype.expandFlatBracket = function (flat) {
    if (this.notEmpty && flat.indexOf(this.constants.UNPICKED_MATCH) > -1) {
        return this.wrapError('Bracket has unpicked matches');
    }

    var length = this.regex.source.split('(').length,
        range = _range(1, length),
        replacer = _map(range, function (i) {
            var prepend = (i === 1) ? '{"$' : '',
                append = (i % 2) ? '":"$' : ((i < length - 1) ? '","$' : '"}');
            return prepend + i + append;
        }).join('');
    try  {
        return this.wrapSuccess(JSON.parse(flat.replace(this.regex, replacer)));
    }
    catch (e) {
        return this.wrapError('Bracket does not look like a bracket');
    }
};

Validator.prototype.hasNecessaryKeys = function (obj) {
    var hasKeys = _keys(obj),
        hasAllKeys = !!(this.constants.ALL_IDS.length === hasKeys.length && _difference(this.constants.ALL_IDS, hasKeys).length === 0);

    if (hasAllKeys) {
        return this.wrapSuccess(obj);
    }
    return this.wrapError('Bracket does not have the corret keys. Missing:', _difference(this.constants.ALL_IDS, hasKeys).join(','));
};

Validator.prototype.validate = function () {
    var hasError = function (result) {
            return _isArray(result) ? _some(result, function (r) { return r instanceof Error; }) : result instanceof Error;
        },
        getErrors = function (result) {
            return _isArray(result) ? _filter(result, function (r) { return r instanceof Error; })[0] : result;
        },
        findResult = function (result) {
            return _isArray(result) ? _pluck(result, 'result') : result.result;
        };

    var result = this.flatBracket;

    // Test expansion from flat to JSON
    result = findResult(this.expandFlatBracket(result));
    if (hasError(result)) return getErrors(result);

    // Test if JSON has all the keys
    result = findResult(this.hasNecessaryKeys(result));
    if (hasError(result)) return getErrors(result);

    // Picks to arrays
    result = findResult(_map(result, this.picksToArray, this));
    if (hasError(result)) return getErrors(result);

    // Array to nested array
    result = findResult(_map(result, this.getRounds, this));
    if (hasError(result)) return getErrors(result);

    // All regions have valid picks
    result = findResult(_map(result, this.validatePicks, this));
    if (hasError(result)) return getErrors(result);

    // Final region has valid picks
    result = findResult(this.validateFinal(_find(result, function (item) { return item.id === this.constants.FINAL_ID; }, this), result));
    if (hasError(result)) return getErrors(result);

    // Testing only return flat bracktet
    if (this.testOnly) return this.flatBracket;

    // Decorate with data
    result = findResult(this.decorateValidated(result));
    if (hasError(result)) return getErrors(result);

    return result;
};


Validator.prototype.decorateValidated = function (bracket) {
    var originalData = _cloneDeep(this.bracket),
        decorated = {};

    _each(bracket, function (region) {
        decorated[region.id] = _extend({}, region, originalData.regions[region.id] || originalData[this.constants.FINAL_ID]);
        decorated[region.id].rounds = _map(region.rounds, function (round) {
            var returnRound = [];
            _each(round, function (seed, index) {
                if (seed === this.constants.UNPICKED_MATCH) {
                    returnRound[index] = null;
                } else if (region.id === this.constants.FINAL_ID) {

                    var winningTeam = this.winningTeamFromRegion(bracket, seed);

                    if (winningTeam === this.constants.UNPICKED_MATCH) {
                        returnRound[index] = null;
                    } else {
                        returnRound[index] = {
                            fromRegion: seed,
                            seed: winningTeam,
                            name: this.teamNameFromRegion(seed, winningTeam)
                        };
                    }

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

    return this.wrapSuccess(decorated);
};

Validator.prototype.winningTeamFromRegion = function (bracket, regionName) {
    return _last(_find(bracket, function (b) { return b.id === regionName; }).rounds)[0];
};

Validator.prototype.teamNameFromRegion = function (regionName, seed) {
    return this.bracket.regions[regionName].teams[seed - 1];
};

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
Validator.prototype.validatePicks = function (options) {

    options = options || {};

    var rounds = options.rounds || [],
        regionName = options.id,
        length = rounds.length,
        regionPicks = {},
        errors = [];

    _each(rounds, function (round, i) {

        var requiredLength = (Math.pow(2, length - 1) / Math.pow(2, i)),
            nextRound = rounds[i + 1],
            correctLength = (round.length === requiredLength),
            lastItem = (i === length - 1),
            thisRoundPickedGames = _without(round, this.constants.UNPICKED_MATCH),
            nextRoundPickedGames = (nextRound) ? _without(nextRound, this.constants.UNPICKED_MATCH) : [],
            nextRoundIsSubset = (!lastItem && _subset(nextRoundPickedGames, thisRoundPickedGames));

        if (correctLength && (lastItem || nextRoundIsSubset)) {
            regionPicks.id = options.id;
            regionPicks.rounds = rounds;
        } else if (!correctLength) {
            errors.push('Incorrect number of pick in:', regionName, i + 1);
        } else if (!nextRoundIsSubset) {
            errors.push('Round is not a subset of previous:', regionName, i + 2);
        }
    }, this);

    return (!errors.length) ? this.wrapSuccess(regionPicks) : this.wrapError.apply(this, errors);

};

    // Takes an array of values and removes all invalids
    // return an array or arrays where each subarray is one round
Validator.prototype.getRounds = function (options) {

    options = options || {};

    var rounds = options.picks || [],
        regionName = options.id || '',
        length = rounds.length + 1,
        retRounds = [(regionName === this.constants.FINAL_ID) ? this.constants.REGION_IDS : this.order],
        verify = function (arr, keep) {
            // Compacts the array and remove all duplicates that are not "X"
            return _compact(_uniq(arr, false, function (n) { return (_indexOf(keep, n) > -1) ? n + Math.random() : n; }));
        },
        checkVal = function (val) {
            var num = parseInt(val, 10);
            if (num >= 1 && num <= this.constants.TEAMS_PER_REGION) {
                return num;
            } else if (val === this.constants.UNPICKED_MATCH) {
                return val;
            } else if (_include(this.constants.REGION_IDS, val)) {
                return val;
            } else {
                return 0;
            }
        },
        count = retRounds.length;

    while (length > 1) {
        length = length / 2;
        var roundGames = verify(_map(rounds.splice(0, Math.floor(length)), checkVal, this), [this.constants.UNPICKED_MATCH]);
        retRounds.push(roundGames);
        count++;
    }

    return retRounds.length ? this.wrapSuccess({rounds: retRounds, id: regionName}) : this.wrapError('Could not get rounds from:', regionName);
};

// Takes a string of the picks for a region and validates them
// Return an array of picks if valid or false if invalid
Validator.prototype.picksToArray = function (picks, regionName) {

    var rTestRegionPicks = null,
        regExpStr = '',
        firstRoundLength = (regionName === this.constants.FINAL_ID) ? this.constants.REGION_COUNT : this.constants.TEAMS_PER_REGION,
        replacement = '$' + _range(1, firstRoundLength).join(',$'),
        seeds = (regionName === this.constants.FINAL_ID) ? this.constants.REGION_IDS : this.order,
        regExpJoiner = function (arr, reverse) {
            var newArr = (reverse) ? arr.reverse() : arr;
            return '(' + newArr.join('|') + '|' + this.constants.UNPICKED_MATCH + ')';
        },
        backref = function (i) {
            return regExpJoiner.call(this, _map(_range(i, i + 2), function (n) { return '\\' + n; }), true);
        };

    if (regionName === this.constants.FINAL_ID) {
        // Allow order independent final picks, we'll validate against matchups later
        regExpStr += regExpJoiner.call(this, seeds.slice(0, this.constants.REGION_COUNT));
        regExpStr += regExpJoiner.call(this, seeds.slice(0, this.constants.REGION_COUNT));
        regExpStr += backref.call(this, 1);
    } else {
        // Create capture groups for the first round of the region
        for (var i = 0; i < firstRoundLength; i += 2) {
            regExpStr += regExpJoiner.call(this, seeds.slice(i, i + 2));
        }
        // Create capture groups using backreferences for the capture groups above
        for (i = 1; i < firstRoundLength - 2; i += 2) {
            regExpStr += backref.call(this, i);
        }
    }

    rTestRegionPicks = new RegExp(regExpStr);

    if (rTestRegionPicks.test(picks)) {
        return this.wrapSuccess({picks: picks.replace(rTestRegionPicks, replacement).split(','), id: regionName});
    } else {
        return this.wrapError('Unable to parse picks in region:', regionName);
    }

};

Validator.prototype.validateFinal = function (finalPicks, validatedRounds) {

    var semifinal = finalPicks.rounds[1];

    if (_contains(semifinal, this.constants.UNPICKED_MATCH)) {
        return this.wrapSuccess(validatedRounds);
    }

    for (var i = 0, m = validatedRounds.length; i < m; i++) {
        if (validatedRounds[i].id !== this.constants.FINAL_ID && _last(validatedRounds[i].rounds)[0] === this.constants.UNPICKED_MATCH) {
            return this.wrapError('Final teams are selected without all regions finished');
        }
    }

    var playingItself = (semifinal[0] === semifinal[1]),
        playingWrongSide = (this.bracket.regions[semifinal[0]].sameSideAs === semifinal[1]);

    if (!_subset(semifinal, this.constants.REGION_IDS)) {
        return this.wrapError('The championship game participants are invalid.');
    } else if (playingItself || playingWrongSide) {
        return this.wrapError('The championship game participants are from the same side of the bracket.');
    } else {
        return this.wrapSuccess(validatedRounds);
    }
};


module.exports = Validator;
