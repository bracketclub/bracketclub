import { clsx } from "clsx"
import { validate, type Region, type Round } from "./bracket-validator"
import { data, createData } from "./bracket-data"

const Match = ({
  reverse,
  team1,
  team2,
}: {
  reverse?: boolean
  team1: string
  team2?: string
}) => {
  return (
    <div
      className={clsx(
        `flex flex-col w-full border bg-gray-100 shadow-sm border-black rounded-sm`,
        reverse ? "lg:text-right" : "text-left"
      )}
    >
      <div className={clsx(`w-full`, reverse ? `lg:pr-2` : `pl-2`)}>
        {team1}
      </div>
      {team2 ? (
        <>
          <div className={`border-t-1 border-black w-full`}></div>
          <div className={clsx(`w-full`, reverse ? `lg:pr-2` : `pl-2`)}>
            {team2}
          </div>
        </>
      ) : null}
    </div>
  )
}

const GridMatch = ({
  roundIndex,
  bottom,
  reverse,
  final,
  children,
  lastRound,
}: {
  bottom?: boolean
  roundIndex: number
  reverse?: boolean
  final?: boolean
  bottomRegion?: boolean
  children?: React.ReactNode
}) => {
  // const lineClass = final
  //   ? `h-60`
  //   : round === 2
  //   ? `h-20`
  //   : round === 3
  //   ? "h-40"
  //   : "h-5"

  return (
    <div
      className={`flex w-full items-center ${
        lastRound ? `translate-y-1/3` : ``
      } ${roundIndex === 0 ? "mb-2" : ""} ${
        reverse ? "lg:flex-row-reverse" : ""
      } ${final ? "" : ""} ${final && reverse ? "lg:justify-self-end" : ""}`}
    >
      {roundIndex > 0 ? (
        <div className={`border-t-1 w-1/16 border-gray-400`}></div>
      ) : null}
      {children}

      <div
        className={clsx(
          `w-1/16`,
          bottom ? `translate-y-[0.5px]` : `-translate-y-[0.5px]`,
          {
            "h-full": roundIndex === 0,
            "h-2/1": roundIndex === 1,
            "h-4/1": roundIndex === 2,
            "h-8/1": roundIndex === 3,
            "h-16/1": roundIndex === 4,
          }
        )}
      >
        <div
          className={`${
            bottom
              ? `border-b-1 -translate-y-1/2`
              : `border-t-1 translate-y-1/2`
          } ${
            reverse
              ? `lg:border-l-1 ${
                  bottom ? `lg:rounded-bl-sm` : `lg:rounded-tl-sm`
                }`
              : `border-r-1 ${bottom ? `rounded-br-sm` : `rounded-tr-sm`}`
          } h-full border-gray-400`}
        ></div>
      </div>
    </div>
  )
}

const chunk = <T,>(arr: T[], size: number) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

const Region = ({
  reverse,
  bottom,
  region,
}: {
  reverse?: boolean
  bottom?: boolean
  region: Region
}) => {
  return (
    <div className={`flex px-2 ${reverse ? "lg:flex-row-reverse" : ""}`}>
      {region.rounds.map((round, roundIndex) => {
        const last = roundIndex === region.rounds.length - 1
        return (
          <div
            className={clsx(
              `flex flex-col justify-around w-full`,
              last && "justify-end"
            )}
          >
            {chunk(round, 2).map((match, i) => {
              return (
                <GridMatch
                  reverse={reverse}
                  bottom={last ? bottom : i % 2 !== 0}
                  roundIndex={roundIndex}
                  lastRound={last}
                >
                  <Match
                    team1={match[0][0]}
                    team2={match[1]?.[0]}
                    reverse={reverse}
                  />
                </GridMatch>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const FinalRegion = () => {
  return (
    <div
      className={`z-10 lg:w-1/4 flex lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-1/2 px-2`}
    >
      <div className="pr-2 w-full">
        <Match team1="1" team2="1" />
      </div>
      <div className="pl-2 w-full">
        <Match team1="1" team2="1" reverse={true} />
      </div>
    </div>
  )
}

function AppBracket() {
  const BRACKET =
    "A185463721432122B185463721432121C185463721432121D185463721432121ZACA"
  const bracketData = createData(data.NCAAM)
  const b = validate(BRACKET, bracketData)

  return (
    <div className="relative lg:grid grid-cols-2 grid-rows-2">
      {b.regions.map((region, i) => {
        return <Region region={region} bottom={i === 1 || i === 2} />
      })}
      {/* <div className="lg:pb-8">
        <Region region={b.regions.A!} />
      </div>
      <div className="lg:pt-8 col-start-1 row-start-2">
        <Region region={b.regions.B!} bottom />
      </div>
      <div className="lg:pb-8 col-start-2 row-start-1">
        <Region region={b.regions.C!} reverse />
      </div>
      <div className="lg:pt-8">
        <Region region={b.regions.D!} reverse bottom />
      </div> */}
      {/* <FinalRegion /> */}
    </div>
  )
}

export default AppBracket
