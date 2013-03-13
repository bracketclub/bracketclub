var data = {
      '2012': {
        regions: ['South', 'West', 'East', 'MidWest'],
        teams: {
          'South': 'Kentucky,Duke,Baylor,Indiana,Wichita St,UNLV,Notre Dame,Iowa St,UConn,Colorado,VCU,New Mexico St,S Dakota St,Lehigh,Western Kentucky',
          'West': 'Mich St,Missouri,Marquette,Louisville,New Mexico,Murray St,Florida,Memphis,Saint Louis,Virginia,Colo St,L Beach St,Davidson,BYU,Norfolk St,LIU',
          'East': 'Syracuse,Ohio St,Florida St,Wisconsin,Vanderbilt,Cincy,Gonzaga,Kansas St,So Miss,W Virginia,Texas,Harvard,Montana,St B\'nvntre,Loyola MD,UNC-Ash',
          'MidWest': 'UNC,Kansas,G\'town,Michigan,Temple,SDSU,St Mary\'s,Creighton,Alabama,Purdue,NC State,USF,Ohio,Belmont,Detroit,UVM'
        }
      }
    },
    _ = require('underscore'),
    finalData = {
      name: 'Final Four'
    },
    currentYear = new Date().getFullYear(),
    regionNameToId = function(name) {
      return name.match(/[A-Z]/g).join('');
    };

module.exports = function(year) {
  var currentData = data[year] || data[currentYear] || data[currentYear-1],
      exportData = {};

  _.each(currentData.regions, function(region, index) {
    exportData.regions[regionNameToId(region)] = {
      name: region,
      sameSideAs: regionNameToId(index % 2 ? currentData.regions[index-1] : currentData.regions[index+1]),
      teams: currentData.teams[region].split(',')
    };
  });

  exportData[regionNameToId(finalData.name)] = finalData;

  return exportData;
};