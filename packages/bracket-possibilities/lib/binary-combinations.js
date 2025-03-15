"use strict"

Object.defineProperty(exports, "__esModule", {
  value: true,
})

var _lodash = require("lodash")

exports.default = function (n) {
  var yes =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1
  var no = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0
  return (0, _lodash.times)(Math.pow(2, n)).map(function (i) {
    return (0, _lodash.times)(n).map(function (ii) {
      return (i >> ii) & 1 ? yes : no
    })
  })
}

module.exports = exports["default"]
