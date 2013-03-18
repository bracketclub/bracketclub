var DATA_DIR = './data/ncaa-mens-basketball/',
    LIB_DIR = './lib/',
    data = require(DATA_DIR + 'data'),
    order = require(DATA_DIR + 'order'),
    consts = require(DATA_DIR + 'consts'),
    finder = require(LIB_DIR + 'finder'),
    generator = require(LIB_DIR + 'generator'),
    validator = require(LIB_DIR + 'validator'),
    quickCheck = require(LIB_DIR + 'quickCheck'),
    score = require(LIB_DIR + 'score'),
    _ = require('lodash');

module.exports = function(options) {
  options = _.defaults(options || {}, {
    year: '',
    props: 'data order consts finder generator validator quickCheck score'.split(' ')
  });
  var thisData = data(options.year),
      thisOrder = order(options.year),
      returnVal = _.pick({
        data: thisData,
        order: thisOrder,
        consts: consts,
        finder: finder,
        generator: generator,
        validator: validator,
        quickCheck: quickCheck
      }, options.props);

  return returnVal;
};