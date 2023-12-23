/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/index.js > TAP > basic > nba 1`] = `
Object {
  "bracket": Object {
    "regions": Object {
      "E": Object {
        "fullname": "Eastern Conference",
        "id": "E",
        "name": "East",
        "sameSideAs": "W",
      },
      "F": Object {
        "fullname": "NBA Finals",
        "id": "F",
        "name": "Finals",
      },
      "W": Object {
        "fullname": "Western Conference",
        "id": "W",
        "name": "West",
        "sameSideAs": "E",
      },
    },
  },
  "constants": Object {
    "ALL_IDS": Array [
      "W",
      "E",
      "F",
    ],
    "BEST_OF": 7,
    "BEST_OF_RANGE": Array [
      4,
      5,
      6,
      7,
    ],
    "EMPTY": "WXXXXXXXEXXXXXXXFX",
    "FINAL_CHAMPIONSHIP_NAME": undefined,
    "FINAL_FULLNAME": "NBA Finals",
    "FINAL_ID": "F",
    "FINAL_NAME": "Finals",
    "ORDER": Array [
      1,
      8,
      4,
      5,
      2,
      7,
      3,
      6,
    ],
    "REGION_COUNT": 2,
    "REGION_IDS": Array [
      "W",
      "E",
    ],
    "TEAMS_PER_REGION": 8,
    "UNPICKED_MATCH": "X",
  },
  "regex": /([WE]{1,1})([\\dX]{7,14})([WE]{1,1})([\\dX]{7,14})(F)([WEX4567]{1,2})/,
}
`

exports[`test/index.js > TAP > basic > ncaam 1`] = `
Object {
  "bracket": Object {
    "regions": Object {
      "E": Object {
        "fullname": "East Region",
        "id": "E",
        "name": "East",
        "sameSideAs": "MW",
      },
      "FF": Object {
        "championshipName": "National Championship",
        "id": "FF",
        "name": "Final Four",
      },
      "MW": Object {
        "fullname": "Midwest Region",
        "id": "MW",
        "name": "Midwest",
        "sameSideAs": "E",
      },
      "S": Object {
        "fullname": "South Region",
        "id": "S",
        "name": "South",
        "sameSideAs": "W",
      },
      "W": Object {
        "fullname": "West Region",
        "id": "W",
        "name": "West",
        "sameSideAs": "S",
      },
    },
  },
  "constants": Object {
    "ALL_IDS": Array [
      "S",
      "W",
      "E",
      "MW",
      "FF",
    ],
    "BEST_OF": 1,
    "EMPTY": "SXXXXXXXXXXXXXXXWXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXMWXXXXXXXXXXXXXXXFFXXX",
    "FINAL_CHAMPIONSHIP_NAME": "National Championship",
    "FINAL_FULLNAME": "Final Four",
    "FINAL_ID": "FF",
    "FINAL_NAME": "Final Four",
    "ORDER": Array [
      1,
      16,
      8,
      9,
      5,
      12,
      4,
      13,
      6,
      11,
      3,
      14,
      7,
      10,
      2,
      15,
    ],
    "REGION_COUNT": 4,
    "REGION_IDS": Array [
      "S",
      "W",
      "E",
      "MW",
    ],
    "TEAMS_PER_REGION": 16,
    "UNPICKED_MATCH": "X",
  },
  "regex": /([SWEMW]{1,2})([\\dX]{15,30})([SWEMW]{1,2})([\\dX]{15,30})([SWEMW]{1,2})([\\dX]{15,30})([SWEMW]{1,2})([\\dX]{15,30})(FF)([SWEMWX]{3,6})/,
}
`

exports[`test/index.js > TAP > basic > ncaaw 1`] = `
Object {
  "bracket": Object {
    "regions": Object {
      "A": Object {
        "fullname": "Alamo Region",
        "id": "A",
        "name": "Alamo",
        "sameSideAs": "H",
      },
      "FF": Object {
        "championshipName": "National Championship",
        "id": "FF",
        "name": "Final Four",
      },
      "H": Object {
        "fullname": "Hemisfair Region",
        "id": "H",
        "name": "Hemisfair",
        "sameSideAs": "A",
      },
      "M": Object {
        "fullname": "Mercado Region",
        "id": "M",
        "name": "Mercado",
        "sameSideAs": "RW",
      },
      "RW": Object {
        "fullname": "River Walk Region",
        "id": "RW",
        "name": "River Walk",
        "sameSideAs": "M",
      },
    },
  },
  "constants": Object {
    "ALL_IDS": Array [
      "A",
      "H",
      "RW",
      "M",
      "FF",
    ],
    "BEST_OF": 1,
    "EMPTY": "AXXXXXXXXXXXXXXXHXXXXXXXXXXXXXXXRWXXXXXXXXXXXXXXXMXXXXXXXXXXXXXXXFFXXX",
    "FINAL_CHAMPIONSHIP_NAME": "National Championship",
    "FINAL_FULLNAME": "Final Four",
    "FINAL_ID": "FF",
    "FINAL_NAME": "Final Four",
    "ORDER": Array [
      1,
      16,
      8,
      9,
      5,
      12,
      4,
      13,
      6,
      11,
      3,
      14,
      7,
      10,
      2,
      15,
    ],
    "REGION_COUNT": 4,
    "REGION_IDS": Array [
      "A",
      "H",
      "RW",
      "M",
    ],
    "TEAMS_PER_REGION": 16,
    "UNPICKED_MATCH": "X",
  },
  "regex": /([AHRWM]{1,2})([\\dX]{15,30})([AHRWM]{1,2})([\\dX]{15,30})([AHRWM]{1,2})([\\dX]{15,30})([AHRWM]{1,2})([\\dX]{15,30})(FF)([AHRWMX]{3,6})/,
}
`

exports[`test/index.js > TAP > basic > nhl 1`] = `
Object {
  "bracket": Object {
    "regions": Object {
      "A": Object {
        "fullname": "Atlantic Division",
        "id": "A",
        "name": "Atlantic",
        "sameSideAs": "M",
      },
      "C": Object {
        "fullname": "Central Division",
        "id": "C",
        "name": "Central",
        "sameSideAs": "P",
      },
      "F": Object {
        "fullname": "Stanley Cup Final",
        "id": "F",
        "name": "Final",
      },
      "M": Object {
        "fullname": "Metropolitan Division",
        "id": "M",
        "name": "Metropolitan",
        "sameSideAs": "A",
      },
      "P": Object {
        "fullname": "Pacific Division",
        "id": "P",
        "name": "Pacific",
        "sameSideAs": "C",
      },
    },
  },
  "constants": Object {
    "ALL_IDS": Array [
      "C",
      "P",
      "A",
      "M",
      "F",
    ],
    "BEST_OF": 7,
    "BEST_OF_RANGE": Array [
      4,
      5,
      6,
      7,
    ],
    "EMPTY": "CXXXPXXXAXXXMXXXFXXX",
    "FINAL_CHAMPIONSHIP_NAME": undefined,
    "FINAL_FULLNAME": "Stanley Cup Final",
    "FINAL_ID": "F",
    "FINAL_NAME": "Final",
    "ORDER": Array [
      1,
      4,
      2,
      3,
    ],
    "REGION_COUNT": 4,
    "REGION_IDS": Array [
      "C",
      "P",
      "A",
      "M",
    ],
    "TEAMS_PER_REGION": 4,
    "UNPICKED_MATCH": "X",
  },
  "regex": /([CPAM]{1,1})([\\dX]{3,6})([CPAM]{1,1})([\\dX]{3,6})([CPAM]{1,1})([\\dX]{3,6})([CPAM]{1,1})([\\dX]{3,6})(F)([CPAMX4567]{3,6})/,
}
`

exports[`test/index.js > TAP > basic > wcm 1`] = `
Object {
  "bracket": Object {
    "regions": Object {
      "F": Object {
        "fullname": "Final",
        "id": "F",
        "name": "Final",
      },
      "L": Object {
        "fullname": "",
        "id": "L",
        "name": "",
        "sameSideAs": "R",
      },
      "R": Object {
        "fullname": "",
        "id": "R",
        "name": "",
        "sameSideAs": "L",
      },
    },
  },
  "constants": Object {
    "ALL_IDS": Array [
      "L",
      "R",
      "F",
    ],
    "BEST_OF": Array [
      "FT",
      "ET",
      "PK",
    ],
    "BEST_OF_RANGE": Array [
      1,
      2,
      3,
    ],
    "EMPTY": "LXXXXXXXRXXXXXXXFX",
    "FINAL_CHAMPIONSHIP_NAME": undefined,
    "FINAL_FULLNAME": "Final",
    "FINAL_ID": "F",
    "FINAL_NAME": "Final",
    "ORDER": Array [
      1,
      8,
      4,
      5,
      2,
      7,
      3,
      6,
    ],
    "REGION_COUNT": 2,
    "REGION_IDS": Array [
      "L",
      "R",
    ],
    "TEAMS_PER_REGION": 8,
    "UNPICKED_MATCH": "X",
  },
  "regex": /([LR]{1,1})([\\dX]{7,14})([LR]{1,1})([\\dX]{7,14})(F)([LRX123]{1,2})/,
}
`

exports[`test/index.js > TAP > with teams > ncaam 1`] = `
Object {
  "bracket": Object {
    "regions": Object {
      "E": Object {
        "fullname": "East Region",
        "id": "E",
        "name": "East",
        "sameSideAs": "MW",
        "teams": Array [
          "E Team 0",
          "E Team 1",
          "E Team 2",
          "E Team 3",
          "E Team 4",
          "E Team 5",
          "E Team 6",
          "E Team 7",
          "E Team 8",
          "E Team 9",
          "E Team 10",
          "E Team 11",
          "E Team 12",
          "E Team 13",
          "E Team 14",
          "E Team 15",
        ],
      },
      "FF": Object {
        "championshipName": "National Championship",
        "id": "FF",
        "name": "Final Four",
      },
      "MW": Object {
        "fullname": "Midwest Region",
        "id": "MW",
        "name": "Midwest",
        "sameSideAs": "E",
        "teams": Array [
          "MW Team 0",
          "MW Team 1",
          "MW Team 2",
          "MW Team 3",
          "MW Team 4",
          "MW Team 5",
          "MW Team 6",
          "MW Team 7",
          "MW Team 8",
          "MW Team 9",
          "MW Team 10",
          "MW Team 11",
          "MW Team 12",
          "MW Team 13",
          "MW Team 14",
          "MW Team 15",
        ],
      },
      "S": Object {
        "fullname": "South Region",
        "id": "S",
        "name": "South",
        "sameSideAs": "W",
        "teams": Array [
          "S Team 0",
          "S Team 1",
          "S Team 2",
          "S Team 3",
          "S Team 4",
          "S Team 5",
          "S Team 6",
          "S Team 7",
          "S Team 8",
          "S Team 9",
          "S Team 10",
          "S Team 11",
          "S Team 12",
          "S Team 13",
          "S Team 14",
          "S Team 15",
        ],
      },
      "W": Object {
        "fullname": "West Region",
        "id": "W",
        "name": "West",
        "sameSideAs": "S",
        "teams": Array [
          "W Team 0",
          "W Team 1",
          "W Team 2",
          "W Team 3",
          "W Team 4",
          "W Team 5",
          "W Team 6",
          "W Team 7",
          "W Team 8",
          "W Team 9",
          "W Team 10",
          "W Team 11",
          "W Team 12",
          "W Team 13",
          "W Team 14",
          "W Team 15",
        ],
      },
    },
  },
  "constants": Object {
    "ALL_IDS": Array [
      "S",
      "W",
      "E",
      "MW",
      "FF",
    ],
    "BEST_OF": 1,
    "EMPTY": "SXXXXXXXXXXXXXXXWXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXMWXXXXXXXXXXXXXXXFFXXX",
    "FINAL_CHAMPIONSHIP_NAME": "National Championship",
    "FINAL_FULLNAME": "Final Four",
    "FINAL_ID": "FF",
    "FINAL_NAME": "Final Four",
    "ORDER": Array [
      1,
      16,
      8,
      9,
      5,
      12,
      4,
      13,
      6,
      11,
      3,
      14,
      7,
      10,
      2,
      15,
    ],
    "REGION_COUNT": 4,
    "REGION_IDS": Array [
      "S",
      "W",
      "E",
      "MW",
    ],
    "TEAMS_PER_REGION": 16,
    "UNPICKED_MATCH": "X",
  },
  "regex": /([SWEMW]{1,2})([\\dX]{15,30})([SWEMW]{1,2})([\\dX]{15,30})([SWEMW]{1,2})([\\dX]{15,30})([SWEMW]{1,2})([\\dX]{15,30})(FF)([SWEMWX]{3,6})/,
}
`
