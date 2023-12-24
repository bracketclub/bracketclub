import t from "tap"
import { validate } from "../src/index.js"
import { createData, data } from "@bracketclub/data"

const generateNCAAMData = () => createData(data.NCAAM)

//   S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i}`) },
//   W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i}`) },
//   E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i}`) },
//   MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i}`) },
// })

t.test("basic", (t) => {
  const validated = validate(
    "A1812463XXXXXXXXXB19XX614XXXXXXXXXCXX54XXXXXXXXXXXDXX12463XXXXXXXXXZXXX",
    generateNCAAMData()
  )
  console.log(validated)
  // t.matchSnapshot(validated)
})
