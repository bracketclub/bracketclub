var _ = require('underscore');

module.exports = function(options) {
  var data = options.data,
      regions = _.keys(data.regions).length,
      perRegion = _.find(data.regions, function() {return true;}).teams.length,
      regionRegEx = '[a-zA-Z]{1,2}\\d{' + (perRegion - 1) + ',' + ((perRegion - 1) * 2) +  '}',
      finalRegEx = '[a-zA-Z]{' + regions + ',' + regions * 2 + '}';

  return new RegExp('^' + new Array(regions + 1).join(regionRegEx) + finalRegEx + '$');
};