import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { redirect } from "@remix-run/cloudflare"
import { update } from "@bracketclub/updater"
import makeData from "@bracketclub/data"
import NCAAM from "@bracketclub/data/ncaam"
import Bracket from "../components/bracket"

const bracketData = makeData(NCAAM, {
  S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i + 1}`) },
  W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i + 1}`) },
  E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i + 1}`) },
  MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i + 1}`) },
})

const emptyBracket = bracketData.constants.EMPTY

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  return redirect(
    `/live/${update(
      params.bracket ?? emptyBracket,
      Object.fromEntries(formData),
      bracketData
    )}`
  )
}

export default function Index() {
  const { bracket = bracketData.constants.EMPTY } = useParams()
  return <Bracket bracket={bracket} bracketData={bracketData} />
}
