import { clsx } from "clsx"
import { validate } from "./bracket-validator"
import { data, createData } from "./bracket-data"

const Match = ({ reverse }: { reverse?: boolean }) => {
  return (
    <div
      className={clsx(
        `flex flex-col w-full border bg-white shadow-sm border-black rounded-sm`,
        reverse ? "text-right" : "text-left"
      )}
    >
      <div className={clsx(`w-full`, reverse ? `pr-2` : `pl-2`)}>Team 1</div>
      <div className={`border-t-1 border-black w-full`}></div>
      <div className={clsx(`w-full`, reverse ? `pr-2` : `pl-2`)}>Team 2</div>
    </div>
  )
}

const GridMatch = ({
  className,
  round,
  bottom,
  reverse,
  final,
}: {
  className?: string
  bottom?: boolean
  round?: number
  reverse?: boolean
  final?: boolean
} = {}) => {
  const lineClass = final
    ? `h-60`
    : round === 2
    ? `h-20`
    : round === 3
    ? "h-40"
    : "h-5"

  return (
    <div
      className={`flex w-full items-center p-2 ${className ?? ""} ${
        reverse ? "flex-row-reverse" : ""
      } ${final ? "" : ""} ${final && reverse ? " justify-self-end" : ""}`}
    >
      <Match reverse={reverse}></Match>
      <div
        className={`w-full max-w-1/16 ${
          bottom ? `translate-y-[0.5px]` : `-translate-y-[0.5px]`
        }`}
      >
        <div
          className={`${
            bottom
              ? `border-b-1 -translate-y-1/2`
              : `border-t-1 translate-y-1/2`
          } ${
            reverse
              ? `border-l-1 ${bottom ? `rounded-bl-sm` : `rounded-tl-sm`}`
              : `border-r-1 ${bottom ? `rounded-br-sm` : `rounded-tr-sm`}`
          } ${lineClass} translate border-black w-full`}
        ></div>
      </div>
    </div>
  )
}

const Round = ({
  reverse,
  round = 1,
}: {
  round: number
  reverse?: boolean
}) => {
  const classes = {
    "col-start-1": !reverse,
    "col-start-2": !reverse && round === 2,
    "col-start-3": !reverse && round === 2,
    "col-start-4": reverse,
  }

  return (
    <>
      <GridMatch reverse={reverse} className={clsx(classes, "row-start-1")} />
      <GridMatch
        bottom
        reverse={reverse}
        className={clsx(classes, "row-start-2")}
      />
      <GridMatch reverse={reverse} className={clsx(classes, "row-start-3")} />
      <GridMatch
        bottom
        reverse={reverse}
        className={clsx(classes, "row-start-4")}
      />
      <GridMatch reverse={reverse} className={clsx(classes, "row-start-5")} />
      <GridMatch
        bottom
        reverse={reverse}
        className={clsx(classes, "row-start-6")}
      />
      <GridMatch reverse={reverse} className={clsx(classes, "row-start-7")} />
      <GridMatch
        bottom
        reverse={reverse}
        className={clsx(classes, "row-start-8")}
      />
    </>
  )
}

const Region = ({
  reverse,
  bottom,
}: {
  reverse?: boolean
  bottom?: boolean
} = {}) => {
  return (
    <div className={`grid grid-cols-4 grid-rows-8 `}>
      <Round reverse={reverse} />

      <GridMatch
        reverse={reverse}
        className={
          reverse
            ? `-mr-12 z-2 row-span-2 col-start-3 row-start-1`
            : `-ml-12 z-2 row-span-2 col-start-2 row-start-1`
        }
        round={2}
      />
      <GridMatch
        reverse={reverse}
        className={
          reverse
            ? `-mr-12 z-2 row-span-2 col-start-3 row-start-3`
            : `-ml-12 z-2 row-span-2 col-start-2 row-start-3`
        }
        bottom
        round={2}
      />
      <GridMatch
        reverse={reverse}
        className={
          reverse
            ? `-mr-12 z-2 row-span-2 col-start-3 row-start-5`
            : `-ml-12 z-2 row-span-2 col-start-2 row-start-5`
        }
        round={2}
      />
      <GridMatch
        reverse={reverse}
        className={
          reverse
            ? `-mr-12 z-2 row-span-2 col-start-3 row-start-7`
            : `-ml-12 z-2 row-span-2 col-start-2 row-start-7`
        }
        bottom
        round={2}
      />

      <GridMatch
        reverse={reverse}
        className={
          reverse
            ? `-mr-12 z-2 row-span-4 col-start-2 row-start-1`
            : `-ml-12 z-3 row-span-4 col-start-3 row-start-1`
        }
        bottom
      />
      <GridMatch
        reverse={reverse}
        className={
          reverse
            ? `-mr-12 z-2 row-span-4 col-start-2 row-start-5`
            : `-ml-12 z-3 row-span-4 col-start-3 row-start-5`
        }
        bottom
        round={3}
      />

      <GridMatch
        reverse={reverse}
        bottom={bottom}
        final={true}
        className={
          reverse
            ? `-mr-12 z-2 row-span-8 col-start-1 row-start-1`
            : `-ml-12 z-4 row-span-8 col-start-4 row-start-1`
        }
      />
    </div>
  )
}

const FinalRegion = () => {
  return (
    <div className={`z-10 w-1/4 flex absolute top-1/2 left-1/2 -translate-1/2`}>
      <Match />
      <Match reverse={true} />
    </div>
  )
}

function AppBracket() {
  const BRACKET =
    "A185463721432121B185463721432121C185463721432121D185463721432121ZACA"
  const bracketData = createData(data.NCAAM)
  const b = validate(BRACKET, bracketData)

  return (
    <div className="relative grid grid-cols-2 grid-rows-2">
      <div className="pb-8">
        <Region />
      </div>
      <div className="pt-8 col-start-1 row-start-2">
        <Region bottom />
      </div>
      <div className="pb-8 col-start-2 row-start-1">
        <Region reverse />
      </div>
      <div className="pt-8">
        <Region reverse bottom />
      </div>
      {/* <FinalRegion /> */}
    </div>
  )
}

export default AppBracket
