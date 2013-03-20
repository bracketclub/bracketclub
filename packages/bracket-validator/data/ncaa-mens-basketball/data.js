var data = {
      '2012': {
        regions: ['South', 'West', 'East', 'MidWest'],
        teams: {
          'South': 'Kentucky,Duke,Baylor,Indiana,Wichita St,UNLV,Notre Dame,Iowa St,UConn,Xavier,Colorado,VCU,New Mexico St,S Dakota St,Lehigh,Western Kentucky',
          'West': 'Mich St,Missouri,Marquette,Louisville,New Mexico,Murray St,Florida,Memphis,Saint Louis,Virginia,Colo St,L Beach St,Davidson,BYU,Norfolk St,LIU',
          'East': 'Syracuse,Ohio St,Florida St,Wisconsin,Vanderbilt,Cincy,Gonzaga,Kansas St,So Miss,W Virginia,Texas,Harvard,Montana,St B\'nvntre,Loyola MD,UNC-Ash',
          'MidWest': 'UNC,Kansas,G\'town,Michigan,Temple,SDSU,St Mary\'s,Creighton,Alabama,Purdue,NC State,USF,Ohio,Belmont,Detroit,UVM'
        }
      },
      '2013': {
        regions: ['MidWest', 'West', 'South', 'East'],
        teams: {
          'MidWest': "Louisville,Duke,Michigan State,Saint Louis,Oklahoma State,Memphis,Creighton,Colorado State,Missouri,Cincinnati,Middle Tennessee/Saint Mary's,Oregon,New Mexico State,Valparaiso,Albany,North Carolina A&T",
          'West': "Gonzaga,Ohio State,New Mexico,Kansas State,Wisconsin,Arizona,Notre Dame,Pittsburgh,Wichita State,Iowa State,Belmont,Mississippi,Boise State/La Salle,Harvard,Iona,Southern",
          'South': "Kansas,Georgetown,Florida,Michigan,VCU,UCLA,San Diego State,North Carolina,Villanova,Oklahoma,Minnesota,Akron,South Dakota State,Northwestern State,Florida Gulf Coast,Western Kentucky",
          'East': "Indiana,Miami,Marquette,Syracuse,UNLV,Butler,Illinois,NC State,Temple,Colorado,Bucknell,California,Montana,Davidson,Pacific,James Madison/Long Island"
        }
      }
    },
    _ = require('lodash'),
    finalData = {
      'FF': {
        name: 'Final Four'
      }
    },
    currentYear = new Date().getFullYear(),
    regionNameToId = function(name) {
      return name.match(/[A-Z]/g).join('');
    };

module.exports = function(options) {

  options = options || {};

  var currentData = data[options.year] || data[currentYear] || data[currentYear-1] || data['2012'],
      exportData = {regions:{}};

  _.each(currentData.regions, function(region, index) {
    exportData.regions[regionNameToId(region)] = {
      name: region.charAt(0).toUpperCase() + region.slice(1).toLowerCase(),
      sameSideAs: regionNameToId(index % 2 ? currentData.regions[index-1] : currentData.regions[index+1]),
      teams: currentData.teams[region].split(',')
    };
  });

  _.extend(exportData, finalData);

  return exportData;
};
