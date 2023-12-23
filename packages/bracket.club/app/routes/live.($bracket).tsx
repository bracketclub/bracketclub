import type { MetaFunction, ActionFunctionArgs } from "@remix-run/cloudflare"
import { Form, useNavigation, useParams } from "@remix-run/react"
import { redirect } from "@remix-run/cloudflare"
import { validate } from "@bracketclub/validator"
import { update } from "@bracketclub/updater"
import makeData from "@bracketclub/data"
import NCAAM from "@bracketclub/data/ncaam"

const bracketData = makeData(NCAAM, {
  S: { teams: new Array(16).fill(0).map((_, i) => `S Team ${i + 1}`) },
  W: { teams: new Array(16).fill(0).map((_, i) => `W Team ${i + 1}`) },
  E: { teams: new Array(16).fill(0).map((_, i) => `E Team ${i + 1}`) },
  MW: { teams: new Array(16).fill(0).map((_, i) => `MW Team ${i + 1}`) },
})

const emptyBracket = bracketData.constants.EMPTY

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const { bracket = emptyBracket } = params
  const { winner, fromRegion } = Object.fromEntries(formData)

  return redirect(
    `/live/${update(bracket, { winner, fromRegion }, bracketData)}`
  )
}

const Team = ({ team }) =>
  team ? (
    <Form method="post" replace>
      <input type="hidden" name="fromRegion" value={team.fromRegion} />
      <input type="hidden" name="winner" value={team.seed} />
      <button type="submit">{team.name}</button>
    </Form>
  ) : (
    "Empty"
  )

const Matchup = ({ matchup }) => (
  <div>
    <Team team={matchup[0]} /> vs <Team team={matchup[1]} />
  </div>
)

const Round = ({ round }) => (
  <div>
    {round
      .reduce(
        (acc, team) => {
          if (acc[acc.length - 1].length < 2) {
            acc[acc.length - 1].push(team)
          } else {
            acc.push([team])
          }
          return acc
        },
        [[]]
      )
      .map((matchup, index) => (
        <Matchup key={index} matchup={matchup} />
      ))}
  </div>
)

const Region = ({ region }) => (
  <div>
    <h2>{region.name}</h2>
    {region.rounds.map((round, index) => (
      <Round key={index} round={round} />
    ))}
  </div>
)

export default function Index() {
  const { bracket = bracketData.constants.EMPTY } = useParams()
  const { FF, ...regions } = validate(bracket, bracketData)

  return (
    <div>
      {Object.values(regions).map((region) => (
        <Region key={region.id} region={region} />
      ))}
    </div>
  )
}
