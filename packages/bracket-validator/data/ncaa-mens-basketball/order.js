var startYear = 2012,
    order = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15],
    currentYear = new Date().getFullYear(),
    exportData = {};

for (var i = startYear, m = currentYear; i <= m; i++) {
  exportData[i.toString()] = order;
}

module.exports = function(options) {
  options = options || {};
  return exportData[options.year || currentYear];
};