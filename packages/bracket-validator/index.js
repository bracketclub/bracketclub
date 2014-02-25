var BracketData = require('bracket-data');
var _all = require('lodash-node/modern/collections/every');
var _include = require('lodash-node/modern/collections/contains');
var _map = require('lodash-node/modern/collections/map');
var _toArray = require('lodash-node/modern/collections/toArray');
var _range = require('lodash-node/modern/arrays/range');
var _keys = require('lodash-node/modern/objects/keys');
var _defaults = require('lodash-node/modern/objects/defaults');
var _omit = require('lodash-node/modern/objects/omit');
var _difference = require('lodash-node/modern/arrays/difference');
var _isArray = require('lodash-node/modern/objects/isArray');
var _some = require('lodash-node/modern/collections/some');
var _filter = require('lodash-node/modern/collections/filter');
var _pluck = require('lodash-node/modern/collections/pluck');
var _find = require('lodash-node/modern/collections/find');
var _each = require('lodash-node/modern/collections/forEach');
var _extend = require('lodash-node/modern/objects/assign');
var _last = require('lodash-node/modern/arrays/last');
var _without = require('lodash-node/modern/arrays/without');
var _compact = require('lodash-node/modern/arrays/compact');
var _uniq = require('lodash-node/modern/arrays/uniq');
var _indexOf = require('lodash-node/modern/arrays/indexOf');
var _contains = require('lodash-node/modern/collections/contains');
var _subset = function (small, big) {
    if (small.length === 0) return true;
    return _all(small, function (n) {
        return _include(big, n);
    });
};

var hasError = function (result) {
    return _isArray(result) ? _some(result, function (r) { return r instanceof Error; }) : result instanceof Error;
},
getErrors = function (result) {
    return _isArray(result) ? _filter(result, function (r) { return r instanceof Error; })[0] : result;
},
findResult = function (result) {
    return _isArray(result) ? _pluck(result, 'result') : result.result;
};

var bracketData;

function Validator(options) {
    _defaults(options, {
        testOnly: false,
        notEmpty: false,
        flatBracket: ''
    });

    this.options = _omit(options, 'flatBracket');

    bracketData = new BracketData({
        year: options.year,
        sport: options.sport,
        props: ['bracket', 'constants', 'regex', 'order']
    });

    if (typeof options.flatBracket !== 'string') options.flatBracket = '';
    return this.reset(options.flatBracket);
}


Validator.prototype.reset = function (flatBracket) {
    if (!flatBracket && !this.options.notEmpty) {
        flatBracket = bracketData.constants.EMPTY;
    }

    this.flatBracket = flatBracket.toUpperCase();
    return this;
};

Validator.prototype.validate = function (flatBracket) {
    this.reset(flatBracket || this.flatBracket);

    var result = this.flatBracket;

    // Test expansion from flat to JSON
    result = findResult(expandFlatBracket(result, this.options.notEmpty));
    if (hasError(result)) return getErrors(result);

    // Test if JSON has all the keys
    result = findResult(hasNecessaryKeys(result));
    if (hasError(result)) return getErrors(result);

    // Picks to arrays
    result = findResult(_map(result, picksToArray));
    if (hasError(result)) return getErrors(result);

    // Array to nested array
    result = findResult(_map(result, getRounds));
    if (hasError(result)) return getErrors(result);

    // All regions have valid picks
    result = findResult(_map(result, validatePicks));
    if (hasError(result)) return getErrors(result);

    // Final region has valid picks
    result = findResult(validateFinal(_find(result, function (item) { return item.id === bracketData.constants.FINAL_ID; }), result));
    if (hasError(result)) return getErrors(result);

    // Testing only return flat bracktet
    if (this.options.testOnly) return this.flatBracket;

    // Decorate with data
    result = findResult(decorateValidated(result));
    if (hasError(result)) return getErrors(result);

    return result;
};

var wrapError = function () {
    return {
        error: true,
        result: new Error(_map(_toArray(arguments), function (arg) {
            return (typeof arg.message === 'string') ? arg.message : arg.toString();
        }).join(', '))
    };
};

var wrapSuccess = function (result) {
    return {
        error: null,
        result: result
    };
};

var expandFlatBracket = function (flat, notEmpty) {
    if (notEmpty && flat.indexOf(bracketData.constants.UNPICKED_MATCH) > -1) {
        return wrapError('Bracket has unpicked matches');
    }

    var length = bracketData.regex.source.split('(').length,
        range = _range(1, length),
        replacer = _map(range, function (i) {
            var prepend = (i === 1) ? '{"$' : '',
                append = (i % 2) ? '":"$' : ((i < length - 1) ? '","$' : '"}');
            return prepend + i + append;
        }).join('');
    try  {
        return wrapSuccess(JSON.parse(flat.replace(bracketData.regex, replacer)));
    }
    catch (e) {
        return wrapError('Bracket does not look like a bracket');
    }
};

var hasNecessaryKeys = function (obj) {
    var hasKeys = _keys(obj),
        hasAllKeys = !!(bracketData.constants.ALL_IDS.length === hasKeys.length && _difference(bracketData.constants.ALL_IDS, hasKeys).length === 0);

    if (hasAllKeys) {
        return wrapSuccess(obj);
    }
    return wrapError('Bracket does not have the corret keys. Missing:', _difference(bracketData.constants.ALL_IDS, hasKeys).join(','));
};

var decorateValidated = function (bracket) {
    var decorated = {};

    _each(bracket, function (region) {
        decorated[region.id] = _extend({}, region, bracketData.bracket.regions[region.id] || bracketData.bracket[bracketData.constants.FINAL_ID]);
        decorated[region.id].rounds = _map(region.rounds, function (round) {
            var returnRound = [];
            _each(round, function (seed, index) {
                if (seed === bracketData.constants.UNPICKED_MATCH) {
                    returnRound[index] = null;
                } else if (region.id === bracketData.constants.FINAL_ID) {

                    var winningTeam = winningTeamFromRegion(bracket, seed);

                    if (winningTeam === bracketData.constants.UNPICKED_MATCH) {
                        returnRound[index] = null;
                    } else {
                        returnRound[index] = {
                            fromRegion: seed,
                            seed: winningTeam,
                            name: teamNameFromRegion(seed, winningTeam)
                        };
                    }

                } else {
                    returnRound[index] = {
                        fromRegion: region.id,
                        seed: seed,
                        name: teamNameFromRegion(region.id, seed)
                    };
                }
            });
            return returnRound;
        });
    });

    return wrapSuccess(decorated);
};

var winningTeamFromRegion = function (bracket, regionName) {
    return _last(_find(bracket, function (b) { return b.id === regionName; }).rounds)[0];
};

var teamNameFromRegion = function (regionName, seed) {
    return bracketData.bracket.regions[regionName].teams[seed - 1];
};

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
var validatePicks = function (options) {

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
            thisRoundPickedGames = _without(round, bracketData.constants.UNPICKED_MATCH),
            nextRoundPickedGames = (nextRound) ? _without(nextRound, bracketData.constants.UNPICKED_MATCH) : [],
            nextRoundIsSubset = (!lastItem && _subset(nextRoundPickedGames, thisRoundPickedGames));

        if (correctLength && (lastItem || nextRoundIsSubset)) {
            regionPicks.id = options.id;
            regionPicks.rounds = rounds;
        } else if (!correctLength) {
            errors.push('Incorrect number of pick in:', regionName, i + 1);
        } else if (!nextRoundIsSubset) {
            errors.push('Round is not a subset of previous:', regionName, i + 2);
        }
    });

    return (!errors.length) ? wrapSuccess(regionPicks) : wrapError(errors);

};

    // Takes an array of values and removes all invalids
    // return an array or arrays where each subarray is one round
var getRounds = function (options) {

    options = options || {};

    var rounds = options.picks || [],
        regionName = options.id || '',
        length = rounds.length + 1,
        retRounds = [(regionName === bracketData.constants.FINAL_ID) ? bracketData.constants.REGION_IDS : bracketData.order],
        verify = function (arr, keep) {
            // Compacts the array and remove all duplicates that are not "X"
            return _compact(_uniq(arr, false, function (n) { return (_indexOf(keep, n) > -1) ? n + Math.random() : n; }));
        },
        checkVal = function (val) {
            var num = parseInt(val, 10);
            if (num >= 1 && num <= bracketData.constants.TEAMS_PER_REGION) {
                return num;
            } else if (val === bracketData.constants.UNPICKED_MATCH) {
                return val;
            } else if (_include(bracketData.constants.REGION_IDS, val)) {
                return val;
            } else {
                return 0;
            }
        },
        count = retRounds.length;

    while (length > 1) {
        length = length / 2;
        var roundGames = verify(_map(rounds.splice(0, Math.floor(length)), checkVal), [bracketData.constants.UNPICKED_MATCH]);
        retRounds.push(roundGames);
        count++;
    }

    return retRounds.length ? wrapSuccess({rounds: retRounds, id: regionName}) : wrapError('Could not get rounds from:', regionName);
};

// Takes a string of the picks for a region and validates them
// Return an array of picks if valid or false if invalid
var picksToArray = function (picks, regionName) {

    var rTestRegionPicks = null,
        regExpStr = '',
        firstRoundLength = (regionName === bracketData.constants.FINAL_ID) ? bracketData.constants.REGION_COUNT : bracketData.constants.TEAMS_PER_REGION,
        replacement = '$' + _range(1, firstRoundLength).join(',$'),
        seeds = (regionName === bracketData.constants.FINAL_ID) ? bracketData.constants.REGION_IDS : bracketData.order,
        regExpJoiner = function (arr, reverse) {
            var newArr = (reverse) ? arr.reverse() : arr;
            return '(' + newArr.join('|') + '|' + bracketData.constants.UNPICKED_MATCH + ')';
        },
        backref = function (i) {
            return regExpJoiner(_map(_range(i, i + 2), function (n) { return '\\' + n; }), true);
        };

    if (regionName === bracketData.constants.FINAL_ID) {
        // Allow order independent final picks, we'll validate against matchups later
        regExpStr += regExpJoiner(seeds.slice(0, bracketData.constants.REGION_COUNT));
        regExpStr += regExpJoiner(seeds.slice(0, bracketData.constants.REGION_COUNT));
        regExpStr += backref(1);
    } else {
        // Create capture groups for the first round of the region
        for (var i = 0; i < firstRoundLength; i += 2) {
            regExpStr += regExpJoiner(seeds.slice(i, i + 2));
        }
        // Create capture groups using backreferences for the capture groups above
        for (i = 1; i < firstRoundLength - 2; i += 2) {
            regExpStr += backref(i);
        }
    }

    rTestRegionPicks = new RegExp(regExpStr);

    if (rTestRegionPicks.test(picks)) {
        return wrapSuccess({picks: picks.replace(rTestRegionPicks, replacement).split(','), id: regionName});
    } else {
        return wrapError('Unable to parse picks in region:', regionName);
    }

};

var validateFinal = function (finalPicks, validatedRounds) {

    var semifinal = finalPicks.rounds[1];

    if (_contains(semifinal, bracketData.constants.UNPICKED_MATCH)) {
        return wrapSuccess(validatedRounds);
    }

    for (var i = 0, m = validatedRounds.length; i < m; i++) {
        var regionId = validatedRounds[i].id;
        var regionWinner = _last(validatedRounds[i].rounds)[0];
        if (regionId !== bracketData.constants.FINAL_ID && regionWinner === bracketData.constants.UNPICKED_MATCH && _contains(semifinal, regionId)) {
            return wrapError('Final teams are selected without all regions finished');
        }
    }

    var playingItself = (semifinal[0] === semifinal[1]),
        playingWrongSide = (bracketData.bracket.regions[semifinal[0]].sameSideAs === semifinal[1]);

    if (!_subset(semifinal, bracketData.constants.REGION_IDS)) {
        return wrapError('The championship game participants are invalid.');
    } else if (playingItself || playingWrongSide) {
        return wrapError('The championship game participants are from the same side of the bracket.');
    } else {
        return wrapSuccess(validatedRounds);
    }
};


module.exports = Validator;
