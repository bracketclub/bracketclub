/* eslint-env mocha */

var assert = require("assert")
var _ = require("lodash")
var BracketScorer = require("../index")

describe("NBA", function () {
  var sport = "nba"
  var year = "2016"

  it("Should score against an empty master", function () {
    var entry = "W1423121E1523131FW"
    var master = "WXXXXXXXEXXXXXXXFX"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 0)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.ok(
      _.every(s.rounds, function (s) {
        return s === 0
      })
    )
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.ok(
      _.every(s.bonus, function (s) {
        return s === 0
      })
    )
    assert.equal(s.standardPPR, 396)
  })

  it("Should score against an empty master without series scoring", function () {
    var entry = "W1423121E1523131FW"
    var master = "WXXXXXXXEXXXXXXXFX"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
      scoring: {
        standard: [10, 25, 50, 100],
      },
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 0)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.ok(
      _.every(s.rounds, function (s) {
        return s === 0
      })
    )
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.ok(
      _.every(s.bonus, function (s) {
        return s === 0
      })
    )
    assert.equal(s.standardPPR, 380)
  })

  it("Should not count a bonus if both participants are not correct", function () {
    var entry = "W17472737172717E17572737173717FE7"
    var master = "W17472737172727E17572737173717FE7"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 406)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [8, 4, 1, 1])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.deepEqual(s.bonus, [8, 4, 1, 0])
    assert.equal(s.standardPPR, 0)
  })

  it("Should not count a bonus as PPR if both teams are not remaining", function () {
    var entry = " W  17  47  27  37  17  27  17  E  17  57  27  37  17  37  17  F  E7".replace(
      /\s*/g,
      ""
    )
    var master = "W  17  47  27  37  17  27  27  E  17  57  27  37  17  37  17  F  X ".replace(
      /\s*/g,
      ""
    )
    // Best Score =  13  13  13  13  31  31  0      13  13  13  13  31  31  59     (100)

    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 306)
    assert.deepEqual(s.rounds, [8, 4, 1, 0])
    assert.deepEqual(s.bonus, [8, 4, 1, 0])
    assert.equal(s.standardPPR, 100)
  })

  it("Should not count a bonus as PPR if both teams are not remaining in semifinals", function () {
    var entry = " W  17  47  27  37  17  27   17  E  17  47  27  37  17   27    27   F  E7".replace(
      /\s*/g,
      ""
    )
    var master = "W  87  47  27  37  X   X    X   E  87  47  27  37  X    X     X    F  X ".replace(
      /\s*/g,
      ""
    )
    // Best Score =  0   13  13  13  (0) (31) (0)    0   13  13  13  (0)  (31)  (50)   (100)

    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 90)
    assert.deepEqual(s.rounds, [6, 0, 0, 0])
    assert.deepEqual(s.bonus, [6, 0, 0, 0])
    assert.equal(s.standardPPR, 212)
  })

  it("should diff without best of", function () {
    var entry = "W1423121E1523131FW"
    var master = "W1423121E1523131FW"
    var diff = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    }).diff()

    _.each(diff, (region) => {
      _.each(region.rounds, (round, index) => {
        if (index > 0) {
          _.each(round, (game) => {
            assert.ok(game.correct)
            assert.ok(typeof game.winsInCorrect, "undefined")
          })
        }
      })
    })
  })

  it("should diff with best of", function () {
    var entry = "W17472737172717E17472737172717FW7"
    var master = "W17472737172717E17472737172717FW7"
    var diff = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    }).diff()

    _.each(diff, (region) => {
      _.each(region.rounds, (round, index) => {
        if (index > 0) {
          _.each(round, (game) => {
            assert.equal(game.correct, true)
            assert.equal(game.winsInCorrect, true)
          })
        }
      })
    })
  })

  it("should diff without best of if master does not have it", function () {
    var entry = "W17472737172717E17472737172717FW7"
    var master = "W1423121E1423121FW"
    var diff = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    }).diff()

    _.each(diff, (region) => {
      _.each(region.rounds, (round, index) => {
        if (index > 0) {
          _.each(round, (game) => {
            assert.equal(game.correct, true)
            assert.equal(game.winsInCorrect, void 0)
          })
        }
      })
    })
  })
})

describe("NHL", function () {
  var sport = "nhl"
  var year = "2016"

  it("Should score against an empty master", function () {
    var entry = "C133P122M122A122FPMM"
    var master = "CXXXPXXXMXXXAXXXFXXX"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 0)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.ok(
      _.every(s.rounds, function (s) {
        return s === 0
      })
    )
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.ok(
      _.every(s.bonus, function (s) {
        return s === 0
      })
    )
    assert.equal(s.standardPPR, 396)
  })

  it("Should score against an empty master without series scoring", function () {
    var entry = "C133P122M122A122FPMM"
    var master = "CXXXPXXXMXXXAXXXFXXX"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
      scoring: {
        standard: [10, 25, 50, 100],
      },
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 0)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.ok(
      _.every(s.rounds, function (s) {
        return s === 0
      })
    )
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.ok(
      _.every(s.bonus, function (s) {
        return s === 0
      })
    )
    assert.equal(s.standardPPR, 380)
  })

  it("Should score an entry without series predictions against a master with them", function () {
    var entry = "C133P122M122A122FPMM"
    var master = "C143537P142527M142527A142527FP7M7M7"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 396)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [8, 4, 2, 1])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.ok(
      _.every(s.bonus, function (s) {
        return s === 0
      })
    )
    assert.equal(s.standardPPR, 0)
  })

  it("Should score an entry with series predictions against a master without them", function () {
    var entry = "C143537P142527M142527A142527FP7M7M7"
    var master = "C133P122M122A122FPMM"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 396)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [8, 4, 2, 1])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.ok(
      _.every(s.bonus, function (s) {
        return s === 0
      })
    )
    assert.equal(s.standardPPR, 0)
  })

  it("Should score with perfect series predictions", function () {
    var entry = "C143537P142527M142527A142527FP7M7M7"
    var master = "C143537P142527M142527A142527FP7M7M7"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 492)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [8, 4, 2, 1])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.deepEqual(s.bonus, [8, 4, 2, 1])
    assert.equal(s.standardPPR, 0)
  })

  it("Should score with perfect predictions but mismatched series in each round", function () {
    var entry = "C143537P142527M142527A142527FP7M7M7"
    var master = "C143736P142527M142527A142527FP5M7M5"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 447)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [8, 4, 2, 1])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.deepEqual(s.bonus, [7, 3, 1, 0])
    assert.equal(s.standardPPR, 0)
  })

  it("Should count series for PPR", function () {
    var entry = "C143537P142527M142527A142527FP7M7M7"
    var master = "C1435XP1425XM1425XA1425XFXXX"
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 120)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [8, 0, 0, 0])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.deepEqual(s.bonus, [8, 0, 0, 0])
    assert.equal(s.standardPPR, 372)
  })

  it("Should count series for PPR with eliminated teams", function () {
    var entry = " C14 35 37 P 14 25 27 M 14 25 27 A 14 25 27    F C7 M7    C7".replace(
      /\s*/g,
      ""
    )
    var master = "C14 25 X  P 14 25 X  M 14 25 X  A 14 25 X     F X  X     X".replace(
      /\s*/g,
      ""
    )
    //           PPR     0          25+6       25+6       25+6    0  50+9  0
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 105)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [7, 0, 0, 0])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.deepEqual(s.bonus, [7, 0, 0, 0])
    assert.equal(s.standardPPR, 155)
  })

  it("Should count series for PPR with eliminated teams into final four", function () {
    var entry = " C14 35 37 P 14 25 27 M 14 25 27 A 14 25 27   F C7 M7    C7".replace(
      /\s*/g,
      ""
    )
    var master = "C14 25 X  P 14 25 X  M 14 25 X  A 14 25 17   F X  X     X".replace(
      /\s*/g,
      ""
    )
    //           PPR     0          25+6       25+6       0+0    0  50+0  0
    var scorer = new BracketScorer({
      entry: entry,
      master: master,
      sport: sport,
      year: year,
    })

    var s = scorer.score(["standard", "standardPPR", "rounds", "bonus"])

    assert.equal(s.standard, 105)
    assert.equal(true, _.isArray(s.rounds))
    assert.equal(s.rounds.length, 4)
    assert.deepEqual(s.rounds, [7, 0, 0, 0])
    assert.equal(true, _.isArray(s.bonus))
    assert.equal(s.bonus.length, 4)
    assert.deepEqual(s.bonus, [7, 0, 0, 0])
    assert.equal(s.standardPPR, 112)
  })
})
