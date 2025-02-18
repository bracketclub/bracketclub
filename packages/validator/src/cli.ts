import { validate } from "./index.ts"
import { createData, data } from "@bracketclub/data"
import { formatWithOptions } from "node:util"

console.log(
  formatWithOptions(
    { colors: true, depth: Infinity },
    validate(process.argv[2], createData(data.NCAAM))
  )
)
