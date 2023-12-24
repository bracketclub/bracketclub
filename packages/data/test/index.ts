import t from "tap"
import { createData, data } from "../src/index.js"

t.test("basic", (t) => {
  t.matchSnapshot(createData(data.NBA), "nba")
  t.matchSnapshot(createData(data.NCAAM), "ncaam")
  t.matchSnapshot(createData(data.NCAAW), "ncaaw")
  t.matchSnapshot(createData(data.NHL), "nhl")
  t.matchSnapshot(createData(data.WCM), "wcm")
  t.matchSnapshot(createData(data.WCW), "wcw")
  t.end()
})
