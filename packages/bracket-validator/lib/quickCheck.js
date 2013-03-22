var _ = require('lodash'),

    thisData = require('../data/ncaa-mens-basketball/data')(),
    CONSTS = require('../data/ncaa-mens-basketball/consts'),
    regionAlphas = CONSTS.REGION_IDS.join('');

module.exports = function(options) {

  options = options || {};

  var data = options.data || thisData,
      regionRegEx = '([' + regionAlphas + ']{1,2})([\\d' + CONSTS.UNPICKED_MATCH + ']{' + (CONSTS.TEAMS_PER_REGION - 1) + ',' + ((CONSTS.TEAMS_PER_REGION - 1) * 2) +  '})',
      finalRegEx = '(' + CONSTS.FINAL_ID + ')([' + regionAlphas + 'X]{' + (CONSTS.REGION_COUNT - 1) + ',' + ((CONSTS.REGION_COUNT - 1) * 2) + '})';

  return new RegExp(new Array(CONSTS.REGION_COUNT + 1).join(regionRegEx) + finalRegEx);
};