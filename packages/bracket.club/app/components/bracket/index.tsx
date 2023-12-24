import { Form } from "@remix-run/react"
import { validate } from "@bracketclub/validator"
import styles from "./styles.module.css"
import cx from "classnames"

const chunk = (arr) =>
  arr.reduce(
    (acc, item) => {
      if (acc[acc.length - 1].length < 2) {
        acc[acc.length - 1].push(item)
      } else {
        acc.push([item])
      }
      return acc
    },
    [[]]
  )

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
  <div className={styles.round}>
    {round.map((matchup, index) => (
      <Matchup key={index} matchup={matchup} />
    ))}
  </div>

  // <div key={matchupIndex} className={styles.matchup}>
  //       {matchup.map((team, teamIndex) => {
  //         // Whether this team is on the top half of its region when it is cut
  //         // in half horizontally
  //         const verticalIndex = matchupIndex * 2 + teamIndex
  //         const top = verticalIndex < round.length / 2

  //         const opponent = lastRound
  //           ? regionOpponent
  //           : matchup[teamIndex === 0 ? 1 : 0]
  //         const winner = lastRound
  //           ? regionWinner
  //           : rounds[roundIndex + 1][matchupIndex]

  //         // If its the final or the last round of a region that game is now being picked
  //         // as a finalRegion game, so reassign the regions. This only affects live brackets
  //         if (finalId && (final || lastRound)) {
  //           if (team) team.fromRegion = finalId
  //           if (opponent) opponent.fromRegion = finalId
  //         }

  //         return (
  //           <div key={teamIndex} className={styles.teamBox}>
  //             {team ? (
  //               this.renderTeam(team, { opponent, winner, top })
  //             ) : (
  //               <Team />
  //             )}
  //           </div>
  //         )
  //       })}
  //     </div>
)

const Region = ({ top, bottom, left, right, region }) => {
  const regionClass = cx(
    styles.region,
    /*roundsClass,*/ {
      [styles.regionTop]: top,
      [styles.regionBottom]: bottom,
    }
  )

  return (
    <div className={regionClass}>
      <h2 className={styles.title}>{region.name}</h2>
      <div className={styles.roundsScroll}>
        <div className={styles.rounds}>
          {region.rounds.map((round, roundIndex) => (
            <Round key={roundIndex} round={chunk(round)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Bracket({ bracket, bracketData }) {
  const { FF, ...regions } = validate(bracket, bracketData)
  const { REGION_IDS } = bracketData.constants
  const topLeft = regions[REGION_IDS[0]]
  const bottomLeft = regions[topLeft.sameSideAs]
  const topRight =
    regions[REGION_IDS.find((id) => id !== topLeft.id && id !== bottomLeft.id)]
  const bottomRight = regions[topRight.sameSideAs]

  return (
    <div className={styles.bracket}>
      <div className={cx(styles.regions, styles.regionsLeft)}>
        <Region top left region={topLeft} />
        <Region bottom left region={bottomLeft} />
      </div>
      <div className={cx(styles.regions, styles.regionsRight)}>
        <Region top right region={topRight} />
        <Region bottom right region={bottomRight} />
      </div>
      <div className={cx(styles.regions, styles.regionsFinal)}>
        <Region region={FF} />
      </div>
    </div>
  )
}
