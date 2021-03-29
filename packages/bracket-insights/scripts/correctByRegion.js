const _ = require("lodash")
const filterByUser = require("../lib/filterByUser")
const pickMaster = require("../lib/pickMaster")

module.exports = (o) =>
  _.chain(o.entries)
    .filter(filterByUser(o))
    .map((entry) => {
      const scored = o.scorer.diff({
        entry: entry.bracket,
        master: pickMaster(o),
      })

      const correctByRegion = _.chain(scored)
        .map(
          (value) =>
            _(value.rounds).drop().flatten().filter("correct", true).value()
              .length
        )
        .sortBy()
        .reverse()
        .value()

      return {
        username: entry.user.username,
        correctByRegion,
        total: _.reduce(correctByRegion, (memo, num) => memo + num, 0),
      }
    })
    .value()

module.exports.after = (arr) => {
  const withEvent = arr.flatMap((e) => {
    return e.data.map((b) => {
      return { ...b, event: `${e.sport}-${e.year}` }
    })
  })
  return {
    title: "Best Ever",
    data: {
      total: _.chain(withEvent).maxBy("total"),
      correctByRegion: _.chain(withEvent).maxBy((d) => d.correctByRegion[0]),
    },
  }
}
