var _ = require('lodash'),
    async = require('async'),

    thisData = require('../data/ncaa-mens-basketball/data')(),
    thisOrder = require('../data/ncaa-mens-basketball/order')(),
    CONSTS = require('../data/ncaa-mens-basketball/consts'),

    quickCheck = require('./quickCheck')();

_.mixin({
  subset: function(small, big) {
    if (small.length === 0) return true;
    return _.all(small, function(n) {
      return _.include(big, n);
    });
  }
});

_.mixin({
  equal: function(arr1, arr2) {
    return arr1.length === arr2.length && _.subset(arr1, arr2) && _.subset(arr2, arr1);
  }
});

function Validator(options) {
  options = options || {};
  this.data = options.data || thisData;
  this.bracketChecks = {};
  this.bracketErrors = [];
  this.firstRoundOrder = options.order || thisOrder;
  this.testOnly = options.testOnly || false;
  this.allRegions = CONSTS.REGION_IDS.concat(CONSTS.FINAL_ID);
  var emptyBracket = this.allRegions.join(new Array(CONSTS.TEAMS_PER_REGION).join(CONSTS.UNPICKED_MATCH)) + new Array(CONSTS.REGION_COUNT).join(CONSTS.UNPICKED_MATCH);
  this.flatBracket = (options.flatBracket || emptyBracket).toUpperCase();
}

Validator.prototype.wrapError = function() {
  return {
    status: false,
    result: new Error(_.map(_.toArray(arguments), function(arg) {
      return (typeof arg.message === 'string') ? arg.message : arg.toString();
    }).join(' '))
  };
};

Validator.prototype.wrapSuccess = function(result) {
  return {
    status: true,
    result: result || null
  };
};

Validator.prototype.expandFlatBracket = function(flat) {
  var length = quickCheck.source.split('(').length,
      range = _.range(1, length),
      replacer = _.map(range, function(i) {
        var prepend = (i === 1) ? '{"$' : '',
            append = (i % 2) ? '":"$' : ((i < length - 1) ? '","$' : '"}');
        return prepend + i + append;
      }).join('');
  try  {
    return this.wrapSuccess(JSON.parse(flat.replace(quickCheck, replacer)));
  }
  catch (e) {
    return this.wrapError('Bracket does not look like a bracket:', e);
  }
};

Validator.prototype.hasNecessaryKeys = function(obj) {
  var hasKeys = _.keys(obj),
      hasAllKeys = !!(this.allRegions.length === hasKeys.length && _.difference(this.allRegions, hasKeys).length === 0);

  if (hasAllKeys) {
    return this.wrapSuccess();
  }
  return this.wrapError('Bracket does not have the corret keys. Missing:', _.difference(this.allRegions, hasKeys).join(','));
};

Validator.prototype.validate = function(callback) {
  var self = this,
      findErrors = function(res) {
        return !res.status;
      },
      findSuccesses = function(res) {
        return res.status;
      };

  async.waterfall([
    // Test expansion from flat to JSON
    function(cb) {
      var result = self.expandFlatBracket(self.flatBracket);
      cb(
        result.status ? null : result.result,
        result.status ? result.result : null
      );
    },
    // Test if JSON has all the keys
    function(bracket, cb) {
      var result = self.hasNecessaryKeys(bracket);
      cb(
        result.status ? null : result.result,
        result.status ? bracket : null
      );
    },
    // Picks to arrays
    function(bracket, cb) {
      var result = _.map(bracket, self.picksToArray, self),
          errors = _.filter(result, findErrors),
          success = _.filter(result, findSuccesses);

      cb(
        errors.length ? _.pluck(errors, 'result') : null,
        success.length && !errors.length ? _.pluck(success, 'result') : null
      );
    },
    // Array to nested array
    function(picks, cb) {
      var result = _.map(picks, self.getRounds, self),
          errors = _.filter(result, findErrors),
          success = _.filter(result, findSuccesses);
      cb(
        errors.length ? errors : null,
        success.length && !errors.length ? _.pluck(success, 'result') : null
      );
    },
    // All regions have valid picks
    function(rounds, cb) {
      var result = _.map(rounds, self.validatePicks, self),
          errors = _.filter(result, findErrors),
          success = _.filter(result, findSuccesses);
      cb(
        errors.length ? errors : null,
        success.length && !errors.length ? _.pluck(success, 'result') : null
      );
    },
    // Final region has valid picks
    function(validatedRounds, cb) {
      var finalRegion = _.find(validatedRounds, function(item) { return item.id === CONSTS.FINAL_ID; }),
          result = self.validateFinal(finalRegion, validatedRounds);
      cb(
        result.status ? null : result.result,
        result.status ? validatedRounds : null
      );
    },
    // Decorate with data
    function(validatedRounds, cb) {
      var result = self.decorateValidated(validatedRounds);
      cb(
        result.status ? null : result.result,
        result.status ? ((self.testOnly) ? self.flatBracket : result.result) : null
      );
    }
  ], function(err, res) {
    callback(_.isArray(err) ? _.flatten(err)[0] : err, res);
  });
};




Validator.prototype.decorateValidated = function(bracket) {
  var originalData = _.cloneDeep(this.data),
      decorated = {};

  _.each(bracket, function(region) {
    decorated[region.id] = _.extend({}, region, originalData.regions[region.id] || originalData[CONSTS.FINAL_ID]);
    decorated[region.id].rounds = _.map(region.rounds, function(round) {
      var returnRound = [];
      _.each(round, function(seed, index) {
        if (seed === CONSTS.UNPICKED_MATCH) {
          returnRound[index] = null;
        } else if (region.id === CONSTS.FINAL_ID) {

          var winningTeam = this.winningTeamFromRegion(bracket, seed);

          if (winningTeam === CONSTS.UNPICKED_MATCH) {
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

Validator.prototype.winningTeamFromRegion = function(bracket, regionName) {
  return _.last(_.find(bracket, function(b) { return b.id === regionName;}).rounds)[0];
};

Validator.prototype.teamNameFromRegion = function(regionName, seed) {
  return this.data.regions[regionName].teams[seed-1];
};

// Takes an array of picks and a regionName
// Validates picks to make sure that all the individual picks are valid
// including each round having the correct number of games
// and each pick being a team that has not been eliminated yet
Validator.prototype.validatePicks = function(options) {

  options = options || {};

  var rounds = options.rounds || [],
      regionName = options.id,
      length = rounds.length,
      regionPicks = {},
      errors = [];

  _.each(rounds, function(round, i) {

    var requiredLength = (Math.pow(2, length - 1) / Math.pow(2, i)),
        nextRound = rounds[i + 1],
        correctLength = (round.length === requiredLength),
        lastItem = (i === length - 1),
        thisRoundPickedGames = _.without(round, CONSTS.UNPICKED_MATCH),
        nextRoundPickedGames = (nextRound) ? _.without(nextRound, CONSTS.UNPICKED_MATCH) : [],
        nextRoundIsSubset = (!lastItem && _.subset(nextRoundPickedGames, thisRoundPickedGames)),
        ncaaRegion = this.data.regions[regionName] || this.data[regionName];

    if (correctLength && (lastItem || nextRoundIsSubset)) {
      regionPicks.id = options.id;
      regionPicks.rounds = rounds;
    } else if (!correctLength) {
      errors.push('Incorrect number of pick in:', regionName, i+1);
    } else if (!nextRoundIsSubset) {
      errors.push('Round is not a subset of previous:', regionName, i+2);
    }
  }, this);

  return (!errors.length) ? this.wrapSuccess(regionPicks) : this.wrapError.apply(this, errors);

};

  // Takes an array of values and removes all invalids
  // return an array or arrays where each subarray is one round
Validator.prototype.getRounds = function(options) {

  options = options || {};

  var rounds = options.picks || [],
      regionName = options.id || '',
      length = rounds.length + 1,
      retRounds = [(regionName === CONSTS.FINAL_ID) ? CONSTS.REGION_IDS : this.firstRoundOrder],
      verify = function(arr, keep) {
        // Compacts the array and remove all duplicates that are not "X"
        return _.compact(_.uniq(arr, false, function(n){ return (_.indexOf(keep, n) > -1) ? n+Math.random() : n; }));
      },
      checkVal = function(val) {
        var num = parseInt(val, 10);
        if (num >= 1 && num <= CONSTS.TEAMS_PER_REGION) {
          return num;
        } else if (val === CONSTS.UNPICKED_MATCH) {
          return val;
        } else if (_.include(CONSTS.REGION_IDS, val)) {
          return val;
        } else {
          return 0;
        }
      },
      count = retRounds.length;

  while (length > 1) {
    length = length / 2;
    var roundGames = verify(_.map(rounds.splice(0, Math.floor(length)), checkVal, this), [CONSTS.UNPICKED_MATCH]);
    retRounds.push(roundGames);
    count++;
  }

  return retRounds.length ? this.wrapSuccess({rounds: retRounds, id: regionName}) : this.wrapError('Could not get rounds from:', regionName);
};

// Takes a string of the picks for a region and validates them
// Return an array of picks if valid or false if invalid
Validator.prototype.picksToArray = function(picks, regionName) {

  var rTestRegionPicks = null,
      regExpStr = '',
      firstRoundLength = (regionName === CONSTS.FINAL_ID) ? CONSTS.REGION_COUNT : CONSTS.TEAMS_PER_REGION,
      replacement = '$' + _.range(1, firstRoundLength).join(',$'),
      seeds = (regionName === CONSTS.FINAL_ID) ? CONSTS.REGION_IDS : this.firstRoundOrder,
      regExpJoiner = function(arr, reverse) {
        var newArr = (reverse) ? arr.reverse() : arr;
        return '(' + newArr.join('|') + '|' + CONSTS.UNPICKED_MATCH + ')';
      },
      backref = function(i) {
        return regExpJoiner.call(this, _.map(_.range(i, i+2), function(n) { return "\\"+n; }), true);
      };

  if (regionName === CONSTS.FINAL_ID) {
    // Allow order independent final picks, we'll validate against matchups later
    regExpStr += regExpJoiner.call(this, seeds.slice(0, CONSTS.REGION_COUNT));
    regExpStr += regExpJoiner.call(this, seeds.slice(0, CONSTS.REGION_COUNT));
    regExpStr += backref.call(this, 1);
  } else {
    // Create capture groups for the first round of the region
    for (var i = 0; i < firstRoundLength; i += 2) {
      regExpStr += regExpJoiner.call(this, seeds.slice(i, i+2));
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

Validator.prototype.validateFinal = function(finalPicks, validatedRounds) {

  var semifinal = finalPicks.rounds[1];

  if (_.contains(semifinal, CONSTS.UNPICKED_MATCH)) {
    return this.wrapSuccess();
  }

  for (var i = 0, m = validatedRounds.length; i < m; i++) {
    if (validatedRounds[i].id !== CONSTS.FINAL_ID && _.last(validatedRounds[i].rounds)[0] === CONSTS.UNPICKED_MATCH) {
      return this.wrapError('Final teams are selected without all regions finished');
    }
  }

  var playingItself = (semifinal[0] === semifinal[1]),
      playingWrongSide = (this.data.regions[semifinal[0]].sameSideAs === semifinal[1]);

  if (!_.subset(semifinal, CONSTS.REGION_IDS)) {
    return this.wrapError('The championship game participants are invalid.');
  } else if (playingItself || playingWrongSide) {
    return this.wrapError('The championship game participants are from the same side of the bracket.');
  } else {
    return this.wrapSuccess();
  }
};


module.exports = Validator;
