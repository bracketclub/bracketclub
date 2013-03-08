var _ = require('underscore');


var helpers;

helpers = {
  array: {
    subset: function(small, big) {
      if (small.length === 0) return true;
      return _.all(small, function(n) {
        return _.include(big, n);
      });
    },
    equal: function(arr1, arr2) {
      return arr1.length === arr2.length && this.subset(arr1, arr2) && this.subset(arr2, arr1);
    }
  }
};

function allArraysAlike(arrays) {
  return _.all(arrays, function(array) {
    return array.length == arrays[0].length && _.difference(array, arrays[0]).length == 0;
  });
}

module.exports = helpers;
