const _ = require("lodash")
const filterByUser = require("../lib/filterByUser")

module.exports = (o) =>
  o.entries.filter(filterByUser(o)).map((entry) => {
    return o.validator.validate(entry.bracket).FF.rounds[2][0].seed
  })

module.exports.after = (arr) => ({
  title: "Total",
  data: _.chain(arr).map("data").flatten().countBy(),
})
