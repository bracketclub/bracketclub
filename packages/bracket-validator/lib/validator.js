var _ = require('underscore'),
    helpers = require('./helpers'),
    NCAA = require('../data/ncaa-mens-basketball/2012.json');

module.exports = {
  errorMessages: [],
  logError: function() {
    this.errorMessages.push(_.toArray(arguments).join(" "));
  },
  unpickedGame: 'X',
  finalFourRegionName: 'FF',
  regions: _.keys(NCAA.regions),
  allRegions: _.keys(NCAA.regions).concat('FF'),
  pickOrder: [0, 7, 5, 3, 2, 4, 6, 1],
  seedOrder: [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15],
  regionClasses: ['round1', 'round2', 'sweet-sixteen', 'elite-eight', 'region-final-four'],
  regionNames: ['Round of 64', 'Round of 32', 'Sweet Sixteen', 'Elite Eight', 'Final Four'],
  finalFourClasses: ['final-four', 'national-championship', 'national-champion'],
  finalFourNames: ['Final Four', 'National Championship', 'National Champion'],
  
  // Takes a string of the picks for a region and validates them
  // Return an array of picks if valid or false if invalid
  picksToArray: function(picks, finalFour, regionName) {

    var regexp,
        replacement = '',
        regExpStr = '',
        seeds = (finalFour) ? this.regions : this.seedOrder,
        seedLength = seeds.length,
        regExpJoiner = function(arr, reverse) {
          var newArr = (reverse) ? arr.reverse() : arr;
          return '(' + newArr.join('|') + '|' + this.unpickedGame + ')';
        },
        backref = function(i) {
          return regExpJoiner.call(this, _.map(_.range(i, i+2), function(n) { return "\\"+n; }), true);
        };

    // Create capture groups for the first round of the region
    for (var i = 0; i < seedLength; i += 2) {
      regExpStr += regExpJoiner.call(this, seeds.slice(i, i+2));
    }
    
    // Create capture groups using backreferences for the capture groups above
    for (i = 1; i < seedLength - 2; i += 2) {
      regExpStr += backref.call(this, i);
    }
    
    regexp = new RegExp(regExpStr);
    replacement = _.map(_.range(1, seedLength), function(num) { return '$'+num; }).join();

    if (regexp.test(picks)) {
      return picks.replace(regexp, replacement).split(',');
    } else {
      this.logError((NCAA.regions[regionName] || NCAA[regionName]).name, 'region was unable to parse the picks');
      return false;
    }
    
  },
  
  // Takes an array of values and removes all invalids
  // return an array or arrays where each subarray is one round
  getRounds: function(rounds, regionName) {

    var length = rounds.length + 1,
        games = (regionName === this.finalFourRegionName) ? this.regions : this.seedOrder,
        retRounds = [_.extend(this.getRoundInfo(0, regionName), { games: games })],
        verify = function(arr, keep) {
          // Compacts the array and remove all duplicates that are not "X"
          return _.compact(_.uniq(arr, false, function(n){ return (_.indexOf(keep, n) > -1) ? n+Math.random() : n; }));
        },
        checkVal = function(val) {
          var num = parseInt(val, 10);
          if (num >= 1 && num <= 16) {
            return num;
          } else if (val === this.unpickedGame) {
            return val;
          } else if (_.include(this.regions, val)) {
            return val;
          } else {
            return 0;
          }
        },
        count = retRounds.length;
        
    while (length > 1) {
      length = length / 2;
      var roundGames = verify(_.map(rounds.splice(0, Math.floor(length)), checkVal, this), [this.unpickedGame]);
      retRounds.push(_.extend(this.getRoundInfo(count, regionName), { games: roundGames }));
      count++;
    }

    return retRounds;
    
a
  },
  
  // Get classes and titles for each round of each region
  getRoundInfo: function(index, region) {
    var roundClasses = (region === this.finalFourRegionName) ? this.finalFourClasses : this.regionClasses,
        roundNames = (region === this.finalFourRegionName) ? this.finalFourNames : this.regionNames;
    
    return {
      "class": roundClasses[index] + ((index > 0) ? ' winners' : ''),
      "title": roundNames[index]
    };
  },
  
  // Takes an array of picks and a regionName
  // Validates picks to make sure that all the individual picks are valid
  // including each round having the correct number of games
  // and each pick being a team that has not been eliminated yet
  validatePicks: function(picks, regionName, editable) {

    var rounds = this.getRounds(picks, regionName),
      length = rounds.length,
      trueRounds = [],
      regionPicks = {};

    _.each(rounds, function(round, i) {
      
      var requiredLength = (Math.pow(2, length - 1) / Math.pow(2, i)),
        nextRound = rounds[i + 1],
        correctLength = (round.games.length === requiredLength),
        lastItem = (i === length - 1),
        thisRoundPickedGames = _.without(round.games, this.unpickedGame),
        nextRoundPickedGames = (nextRound) ? _.without(nextRound.games, this.unpickedGame) : [],
        nextRoundIsSubset = (!lastItem && helpers.array.subset(nextRoundPickedGames, thisRoundPickedGames)),
        ncaaRegion = NCAA.regions[regionName] || NCAA[regionName];
if (typeof ncaaRegion === 'undefined')console.log('x', regionName, ncaaRegion)
      if (correctLength && (lastItem || nextRoundIsSubset)) {
        regionPicks.id = regionName;
        regionPicks.name = ncaaRegion.name;
        regionPicks.rounds = rounds;
        trueRounds.push(i);
        if (_.indexOf(_.flatten(_.pluck(rounds, 'games')), this.unpickedGame) === -1 && editable) regionPicks.classes = "completed";
      } else if (!correctLength) {
        this.logError(regionName, 'has the incorrect number of picks in', this.getRoundInfo(i, regionName).title);
      } else if (!nextRoundIsSubset) {
        this.logError(regionName, 'round', this.getRoundInfo(i+1, regionName).title, 'is not a subset of the previous round');
      }
    }, this);
    
    return (length === trueRounds.length) ? regionPicks : false;
    
  },
  
  // Takes two arrays of region names (one from the user, one from valid keys)
  // And checks if they are the same
  validateRegionNames: function(userRegions, bracketRegions) {
    if (helpers.array.equal(userRegions, bracketRegions)) {
      return userRegions;
    } else {
      this.logError('The region names are not correct. Must be', bracketRegions, '. Yours are', userRegions);
      return false;
    }
  },
  
  // Make sure the special rules for the final four work
  validateFinalFour: function(finalFourPicks) {

    if (finalFourPicks === false) return finalFourPicks;
    
    var finalFourWinners = finalFourPicks.rounds[1].games;

    if (finalFourWinners[0] === this.unpickedGame || finalFourWinners[1] === this.unpickedGame) {
      return finalFourPicks;
    } 
    
    var playingItself = (finalFourWinners[0] === finalFourWinners[1]),
        playingWrongSide = (NCAA.regions[finalFourWinners[0]].sameSideAs === finalFourWinners[1]);
    
    if (!helpers.array.subset(finalFourWinners, this.regions)) {
      this.logError('The championship games participants are invalid.');
      return false;
    } else if ((playingItself || playingWrongSide)) {
      this.logError('The championship game participants are from the same side of the bracket.');
      return false;
    } else {
      return finalFourPicks;
    }

  },
  
  // Take validated tournament and add necessary content so it is ready for Handlebars
  addTeamContent: function(validatedPicks, editable, master) {
    
    var ncaaRegions = NCAA.regions,
        validatedMaster;
        
    if (master) validatedMaster = this.validateTournament(master, false, false);
    
    _.each(validatedPicks.regions, function(region, regionIndex) {
      
      var regionTeams = (typeof NCAA.regions[region.id] !== 'undefined') ? NCAA.regions[region.id].teams : [];
      
      _.each(region.rounds, function(round, roundIndex) {

        _.each(round.games, function(game, gameIndex) {

          if (typeof round.teams === 'undefined') round.teams = [];
          
          var team = {
                seed: '',
                name: ''
              },
              isTop = (gameIndex % 2 === 0),
              lastRound = (roundIndex === region.rounds.length-1),
              classes = ['top', 'bottom'],
              resultClass, masterGame;
          
          
              
          if (region.id !== this.finalFourRegionName) {
            
            if (!editable && validatedMaster && roundIndex > 0 && game !== this.unpickedGame) {
              masterGame = validatedMaster.regions[regionIndex].rounds[roundIndex].games[gameIndex];
              if (masterGame !== this.unpickedGame) {
                resultClass = (game === masterGame) ? ' correct' : ' incorrect';
              }
            }

            team.seed = parseInt(game, 10);
            team.name = regionTeams[team.seed - 1];
            team.fromRegion = region.id;
            
          } else {
            
            if (!editable && validatedMaster && roundIndex > 0 && game !== this.unpickedGame) {
              masterGame = validatedMaster.regions[regionIndex].rounds[roundIndex].games[gameIndex];
              if (masterGame !== this.unpickedGame) {
                var uRegionWinningTeam = _.last(_.find(validatedPicks.regions, function(r) { return r.id === game; }).rounds).games[0],
                    mRegionWinningTeam = _.last(_.find(validatedMaster.regions, function(r) { return r.id === masterGame; }).rounds).games[0];
              
                resultClass = (game === masterGame && uRegionWinningTeam === mRegionWinningTeam) ? ' correct' : ' incorrect';
              }
            }
            
            // These are selected winners in the final four
            var fromRegion = _.find(validatedPicks.regions, function(reg) { return reg.id === game; });
            
            if (fromRegion) {
              var finalFourTeam = _.first(_.last(fromRegion.rounds).teams);
              team.seed = finalFourTeam.seed;
              team.name = finalFourTeam.name;
              team.fromRegion = game;
            }
          }
          
          round.teams[gameIndex] = _.extend(team, {
            editable: editable,
            startMatchup: isTop,
            endMatchup: !isTop,
            classes: (lastRound) ? '' : classes[~~!isTop],
            resultClass: resultClass
          });
          
        }, this);
      }, this);
    }, this);

    return validatedPicks;
  },
  
  score: function(user, master, name) {
    
    var validatedUser = this.validateTournament(user, false, false),
        validatedMaster = this.validateTournament(master, false, false),
        total = 0,
        firstRoundScore = 10,
        roundScores = [];
        
    _.each(validatedUser.regions, function(region, region_i) {
      _.each(region.rounds, function(round, round_i) {
        _.each(round.games, function(game, game_i) {
          var masterGame, gameScore, scoreIndex, correct, uWinningTeam, mWinningTeam;
          
          if (round_i > 0) {
            if (region.id !== this.finalFourRegionName) {
              masterGame = validatedMaster.regions[region_i].rounds[round_i].games[game_i];
              scoreIndex = round_i - 1;
              correct = (game === masterGame);
            } else {
              masterGame = validatedMaster.regions[region_i].rounds[round_i].games[game_i];
              scoreIndex = _.first(validatedMaster.regions).rounds.length + round_i - 2;
              if (masterGame !== this.unpickedGame) {
                uWinningTeam = _.last(_.find(validatedUser.regions, function(r) { return r.id === game; }).rounds).games[0];
                mWinningTeam = _.last(_.find(validatedMaster.regions, function(r) { return r.id === masterGame; }).rounds).games[0];
                correct = (game === masterGame && uWinningTeam === mWinningTeam);
              } else {
                correct = false;
              }
              
            }
            if (typeof roundScores[scoreIndex] === 'undefined') roundScores[scoreIndex] = 0;
            gameScore = Math.pow(2, scoreIndex) * firstRoundScore;
            roundScores[scoreIndex] += (masterGame !== this.unpickedGame && correct) ? gameScore : 0;
          }
          
        }, this);
      }, this);
    }, this);

    _.each(roundScores, function(score) {
      total += score;
    });
    return {
      roundScores: roundScores,
      total: total
    };
  },
  
  // Make sure the tournament is all validated
  // by running all the other checks
  validateTournament: function(picks, editable, justValidate, master) {

    var uPicks = picks.toUpperCase(),
        uPicksSplit = uPicks.split(this.finalFourRegionName),
        regionPicks = uPicksSplit[0],
        finalFourPicks = uPicksSplit[1],
        uRegionNames = _.compact(regionPicks.split(new RegExp('[0-9'+this.unpickedGame+']+'))),
        uRegionPicks = _.compact(regionPicks.split(/[A-WYZ]+/)),
        validatedTournament = {
          regions: []
        },
        error = false;
        
    this.errorMessages = [];
    
    if (finalFourPicks && finalFourPicks.length > 0) {
      uRegionNames = uRegionNames.concat(this.finalFourRegionName);
    }
    
    _.each(uRegionNames, function(regionName, i) {
      var regionPicks = uRegionPicks[i] || finalFourPicks,
          validatedPicks,
          isFinalFour = (regionName === this.finalFourRegionName),
          picksArray = this.picksToArray(regionPicks, isFinalFour, regionName);

      if (picksArray === false) {
        error = true;
      } else if (isFinalFour) {
        validatedPicks = this.validateFinalFour(this.validatePicks(picksArray, regionName, editable));
      } else {
        validatedPicks = this.validatePicks(picksArray, regionName, editable);
      }
      
      if (validatedPicks !== false) {
        validatedTournament.regions.push(validatedPicks);
      } else {
        error = true;
      }
    }, this);

    if (this.validateRegionNames(uRegionNames, this.allRegions) === false) {
      error = true;
    }
    
    if (!error) {
      if (justValidate) return validatedTournament;
      return this.addTeamContent(validatedTournament, editable, master);
    } else {
      if (justValidate) return false;
      return {messages: this.errorMessages, error: true};
    }
  }
};