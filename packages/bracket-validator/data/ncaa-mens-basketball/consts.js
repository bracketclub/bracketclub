var data = require('./data')(),
    _ = require('lodash'),

    noRegions = _.omit(data, 'regions');

module.exports = {
  REGION_COUNT: _.keys(data.regions).length,
  REGION_IDS: _.keys(data.regions),
  FINAL_ID: _.keys(noRegions)[0],
  FINAL_NAME: noRegions[_.keys(noRegions)[0]].name,
  UNPICKED_MATCH: 'X',
  TEAMS_PER_REGION: _.find(data.regions, function() {return true;}).teams.length
};