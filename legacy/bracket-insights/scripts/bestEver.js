const _ = require("lodash")
const filterByUser = require("../lib/filterByUser")
const pickMaster = require("../lib/pickMaster")

module.exports = (o) => {
  const unpicked = _.last(o.masters.brackets).match(
    new RegExp(o.data.constants.UNPICKED_MATCH, "g")
  )

  if (o.finished && unpicked) {
    return new Error(`Event has ${unpicked.length} unplayed matches`)
  }

  const filtered = _.find(o.entries, filterByUser(o))
  let top

  if (o.user) {
    if (!filtered) {
      return new Error(`No entry with ${o.user} in ${o.sport}-${o.year}`)
    }
    top = {
      ...filtered,
      score: o.scorer.score(o.scoring, {
        entry: filtered.bracket,
        master: pickMaster(o),
      }),
    }
  } else {
    top = o.scoreAll()[0]
  }

  return {
    username: top.user.username,
    score: top.score,
    bracket: top.bracket,
  }
}

module.exports.after = (arr) => {
  return {
    title: "Best Ever",
    data: _.chain(arr)
      .reject((d) => d.data instanceof Error)
      .orderBy("data.score", "desc")
      .map((e) => ({
        event: `${e.sport}-${e.year}`,
        ...e.data,
      }))
      .get(0)
      .value(),
  }
}
