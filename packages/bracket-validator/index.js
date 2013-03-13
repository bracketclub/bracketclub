var data = require('./data/ncaa-mens-basketball/data'),
    order = require('./data/ncaa-mens-basketball/order'),
    finder = require('./lib/finder')(),
    generator = require('./lib/generator'),
    validator = require('./lib/validator'),
    quickCheck = require('./lib/quickCheck');

module.exports = function(year) {
  return {
    data: data(year),
    order: order(year),
    finder: finder,
    generator: generator,
    validator: validator,
    quickCheck: quickCheck
  };
};