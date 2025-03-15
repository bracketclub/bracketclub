import { clsx } from "clsx"
import { use, useEffect, useMemo, useRef, useState } from "react"
import { validate } from "./bracket-validator"
import { data, createData } from "./bracket-data"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react"

// https://stackoverflow.com/questions/65952068/determine-if-a-snap-scroll-elements-snap-scrolling-event-is-complete

const Match = ({ champion, reverse, team1, team2 }: { reverse?: boolean }) => {
  return (
    <div
      className={clsx(
        `flex min-w-0 flex-col border bg-white shadow-sm border-black rounded-sm`,
        champion ? `w-1/2 text-xl px-4 py-2` : `w-full`,
        reverse ? "lg:text-right" : "text-left",
        champion ? "lg:text-center" : ""
      )}
    >
      <div className={clsx("max-w-full", reverse ? `pr-2` : `pl-2`)}>
        <p className="truncate">{team1}</p>
      </div>
      {team2 ? (
        <>
          <div className={`max-w-full border-t-1 border-black`}></div>
          <div className={clsx("max-w-full", reverse ? `pr-2` : `pl-2`)}>
            <p className="truncate">{team2}</p>
          </div>
        </>
      ) : null}
    </div>
  )
}

const getRowStart = (rowStart: number) => ({
  "row-start-1": rowStart === 1,
  "row-start-2": rowStart === 2,
  "row-start-3": rowStart === 3,
  "row-start-4": rowStart === 4,
  "row-start-5": rowStart === 5,
  "row-start-6": rowStart === 6,
  "row-start-7": rowStart === 7,
  "row-start-8": rowStart === 8,
  "row-start-9": rowStart === 9,
  "row-start-10": rowStart === 10,
  "row-start-11": rowStart === 11,
  "row-start-12": rowStart === 12,
  "row-start-13": rowStart === 13,
  "row-start-14": rowStart === 14,
  "row-start-15": rowStart === 15,
  "row-start-16": rowStart === 16,
  "row-start-17": rowStart === 17,
  "row-start-18": rowStart === 18,
  "row-start-19": rowStart === 19,
  "row-start-20": rowStart === 20,
  "row-start-21": rowStart === 21,
  "row-start-22": rowStart === 22,
  "row-start-23": rowStart === 23,
  "row-start-24": rowStart === 24,
  "row-start-25": rowStart === 25,
  "row-start-26": rowStart === 26,
  "row-start-27": rowStart === 27,
  "row-start-28": rowStart === 28,
  "row-start-29": rowStart === 29,
  "row-start-30": rowStart === 30,
  "row-start-31": rowStart === 31,
  "row-start-32": rowStart === 32,
})

const getRowStartLg = (rowStart: number) => ({
  "lg:row-start-1": rowStart === 1,
  "lg:row-start-2": rowStart === 2,
  "lg:row-start-3": rowStart === 3,
  "lg:row-start-4": rowStart === 4,
  "lg:row-start-5": rowStart === 5,
  "lg:row-start-6": rowStart === 6,
  "lg:row-start-7": rowStart === 7,
  "lg:row-start-8": rowStart === 8,
  "lg:row-start-9": rowStart === 9,
  "lg:row-start-10": rowStart === 10,
  "lg:row-start-11": rowStart === 11,
  "lg:row-start-12": rowStart === 12,
  "lg:row-start-13": rowStart === 13,
  "lg:row-start-14": rowStart === 14,
  "lg:row-start-15": rowStart === 15,
  "lg:row-start-16": rowStart === 16,
  "lg:row-start-17": rowStart === 17,
  "lg:row-start-18": rowStart === 18,
  "lg:row-start-19": rowStart === 19,
  "lg:row-start-20": rowStart === 20,
  "lg:row-start-21": rowStart === 21,
  "lg:row-start-22": rowStart === 22,
  "lg:row-start-23": rowStart === 23,
  "lg:row-start-24": rowStart === 24,
  "lg:row-start-25": rowStart === 25,
  "lg:row-start-26": rowStart === 26,
  "lg:row-start-27": rowStart === 27,
  "lg:row-start-28": rowStart === 28,
  "lg:row-start-29": rowStart === 29,
  "lg:row-start-30": rowStart === 30,
  "lg:row-start-31": rowStart === 31,
  "lg:row-start-32": rowStart === 32,
})

const getRowSpan = (offset: number) => ({
  "row-span-1": offset === 1,
  "row-span-2": offset === 2,
  "row-span-4": offset === 4,
  "row-span-8": offset === 8,
  "row-span-16": offset === 16,
  "row-span-32": offset === 32,
})

const getRound = (round: number) => {}

const Color = ({ index, scrollXProgress, visibleColumns }) => {
  // if (index >= 60) return null
  const TOTAL_ROUNDS = 6
  const TOTAL_REGIONS = 4

  const [realRound, roundGame, gamesInRound, firstGameOfRound] =
    index < 32
      ? [0, index, 32, 0]
      : index < 48
      ? [1, index - 32, 16, 32]
      : index < 56
      ? [2, index - 48, 8, 48]
      : index < 60
      ? [3, index - 56, 4, 56]
      : index < 62
      ? [4, index - 60, 2, 60]
      : [5, index - 62, 1, 62]

  const leftOrRightIndex = Math.floor(
    ((index - firstGameOfRound) / gamesInRound) * 4
  )
  const regionIndex = index >= 60 ? 4 : leftOrRightIndex
  const left = leftOrRightIndex === 0 || leftOrRightIndex === 1
  const right = leftOrRightIndex === 2 || leftOrRightIndex === 3
  const champion = index === 62

  // const stops = TOTAL_ROUNDS - visibleColumns

  const round = Math.max(0, realRound)
  const rowSpan = Math.pow(2, round)
  const rowStart = roundGame * rowSpan + 1
  const rowSpanClass = champion ? {} : getRowSpan(rowSpan)
  const rowStartClass = getRowStart(rowStart)
  const rowStartLgClass = champion
    ? {}
    : getRowStartLg(rowStart - (left ? 0 : 16))

  // const scrollSpan = (round + 1)/

  // const round = realRound === 2 && scrollRound === 2 ? 1 : realRound

  // const rowStartNum = (roundGame + 1) * 2 - 1

  // champion

  // flex snap-start snap-end col-start-4 col-span-3 row-start-1 lg:row-start-7

  const classes = {
    "col-start-1": realRound === 0,
    "col-start-2": realRound === 1,
    "col-start-3": realRound === 2,
    "col-start-4": realRound === 3,
    "col-start-5": realRound === 4,
    "col-start-6": realRound === 5,

    "lg:col-start-1": realRound === 0 && left,
    "lg:col-start-8": realRound === 0 && right,
    "lg:col-start-2": realRound === 1 && left,
    "lg:col-start-7": realRound === 1 && right,
    "lg:col-start-3": realRound === 2 && left,
    "lg:col-start-6": realRound === 2 && right,
    "lg:col-start-4":
      champion || ((realRound === 3 || realRound === 4) && left),
    "lg:col-start-5": (realRound === 3 || realRound === 4) && right,

    "lg:col-span-2": champion,
    "lg:row-start-7": champion,

    ...rowSpanClass,
    ...rowStartClass,
    ...rowStartLgClass,
    // "lg:row-start-1": realRound === 5,
    // "bg-red-100": round === 0,
    // "bg-blue-100": round === 1,
    // "row-start-1": roundGame === 0,
    // "row-start-3": round === 2 && roundGame === 1,
    // "row-start-5":
    //   (round === 2 && roundGame === 2) || (round === 3 && roundGame === 1),
    // "row-start-7": round === 2 && roundGame === 3,
    // "row-start-9":
    //   (round === 2 && roundGame === 4) ||
    //   (round === 3 && roundGame === 2) ||
    //   (round === 4 && roundGame === 1),
    // "row-start-11": round === 2 && roundGame === 5,
    // "row-start-13":
    //   (round === 2 && roundGame === 6) || (round === 3 && roundGame === 3),
    // "row-start-15": round === 2 && roundGame === 7,
    // "row-start-17":
    //   (round === 2 && roundGame === 8) ||
    //   (round === 3 && roundGame === 4) ||
    //   (round === 4 && roundGame === 2) ||
    //   (round === 5 && roundGame === 1),
    // "row-start-19": round === 2 && roundGame === 9,
    // "row-start-21":
    //   (round === 2 && roundGame === 10) || (round === 3 && roundGame === 5),
    // "row-start-23": round === 2 && roundGame === 11,
    // "row-start-25":
    //   (round === 2 && roundGame === 12) ||
    //   (round === 3 && roundGame === 6) ||
    //   (round === 4 && roundGame === 3),
    // "row-start-27": round === 2 && roundGame === 13,
    // "row-start-29":
    //   (round === 2 && roundGame === 14) || (round === 3 && roundGame === 7),
    // "row-start-31": round === 2 && roundGame === 15,
  }

  // const ref = useRef(null)
  // const { scrollXProgress } = useScroll({
  //   target: ref,
  //   offset: ["start end", "end end"],
  //   axis: "x",
  // })

  // useMotionValueEvent(scrollXProgress, "change", (current) => {
  //   console.log(current)
  // })

  // const factor = [100, 100, 75][round] ?? 100
  // const yStop = `-${(roundGame + 0.5) * factor}%`

  // const translateY = useTransform(scrollXProgress, [0, 1], ["0%", yStop])

  // const [translateYValue, setTranslateYValue] = useState(translateY.get())

  // useMotionValueEvent(translateY, "change", (current) => {
  //   setTranslateYValue(current)
  // })

  const bottom = index % 2 === 1

  return (
    <motion.div
      // ref={ref}
      className={clsx(`flex min-w-0 snap-start snap-end`, classes)}
      // layout
      style={
        {
          // translateY,
          // gridRow: `${rowStart} / span ${rowSpan}`,
          // gridRow: `span ${rowSpan} / span ${rowSpan}`,
        }
      }
    >
      <div className={clsx(`flex min-w-0 w-full items-center justify-center`)}>
        {champion || round === 0 || round === 4 ? null : (
          <div
            className={`w-3 ${
              bottom ? `translate-y-[0.5px]` : `-translate-y-[0.5px]`
            }`}
          >
            <div
              className={`${
                bottom
                  ? `border-b-1 -translate-y-1/2`
                  : `border-t-1 translate-y-1/2`
              } ${
                right
                  ? `border-l-1 ${bottom ? `rounded-bl-sm` : `rounded-tl-sm`}`
                  : `border-r-1 ${bottom ? `rounded-br-sm` : `rounded-tr-sm`}`
              }  border-gray-400 translate  w-full`}
            ></div>
          </div>
        )}
        <Match
          team1={`R:${realRound} I:${index} G:${roundGame}`}
          team2={
            champion
              ? false
              : `Region: ${regionIndex} Span:${rowSpan} Start:${rowStart}`
          }
          reverse={right}
          champion={champion}
        />
        {champion || round === 4 || round === 3 ? null : (
          <div
            className={clsx(
              `w-3`,
              bottom ? `translate-y-[0.5px]` : `-translate-y-[0.5px]`,
              {
                "h-[75%]": true,
                // "h-2/1": realRound === 1,
                // "h-4/1": realRound === 2,
                // "h-8/1": realRound === 3,
                // "h-16/1": realRound === 4,
              }
            )}
          >
            <div
              className={`${
                bottom
                  ? `border-b-1 -translate-y-1/2`
                  : `border-t-1 translate-y-1/2`
              } ${
                right
                  ? `lg:border-l-1 ${
                      bottom ? `lg:rounded-bl-sm` : `lg:rounded-tl-sm`
                    }`
                  : `border-r-1 ${bottom ? `rounded-br-sm` : `rounded-tr-sm`}`
              } h-full border-gray-400`}
            ></div>
          </div>
          // <div
          //   className={`w-full h-full max-w-1/16 ${
          //     bottom ? `translate-y-[0.5px]` : `-translate-y-[0.5px]`
          //   }`}
          // >
          //   <div
          //     className={`${
          //       bottom
          //         ? `border-b-1 -translate-y-1/2`
          //         : `border-t-1 translate-y-1/2`
          //     } ${
          //       right
          //         ? `border-l-1 ${bottom ? `rounded-bl-sm` : `rounded-tl-sm`}`
          //         : `border-r-1 ${bottom ? `rounded-br-sm` : `rounded-tr-sm`}`
          //     } h-1/2 translate border-black w-full`}
          //   ></div>
          // </div>
        )}
      </div>
    </motion.div>
  )
}

// const useWindowWidth = () => {
//   const [width, setWidth] = useState(window.innerWidth)
//   useEffect(() => {
//     const handleResize = () => setWidth(window.innerWidth)
//     window.addEventListener("resize", handleResize)
//     return () => window.removeEventListener("resize", handleResize)
//   }, [])
//   return width
// }

function AppBracket() {
  // const windowWidth = useWindowWidth()
  // const columns = useMemo(() => (windowWidth / 3), [windowWidth])
  // const [scrollLeft, setScrollLeft] = useState(0)
  // const [round, setRound] = useState(0)

  // useEffect(() => {
  //   const columns = (windowWidth / 3) * 0.9
  //   const rounded = Math.floor(scrollLeft / columns)
  //   const r = Math.max(0, rounded)
  //   setRound(Math.max(0, rounded))
  //   // console.log({ round: r, windowWidth, scrollLeft, columns })
  // }, [scrollLeft, windowWidth])

  const scrollContainer = useRef(null)
  const { scrollX, scrollXProgress } = useScroll({
    container: scrollContainer,
  })
  // const col1 = useTransform(scrollXProgress, [0, 1 / 3], [0, 100])
  // const col2 = useTransform(scrollXProgress, [0, 2 / 3], [0, 100])
  // const [scrollDirection, setScrollDirection] = useState("left")

  // useMotionValueEvent(scrollX, "change", (current) => {
  //   const diff = current - scrollX.getPrevious()
  //   // console.log({ current, diff })
  //   setScrollDirection(diff > 0 ? "left" : "right")
  // })

  // useMotionValueEvent(scrollXProgress, "change", (current) => {
  //   console.log(current)
  // })

  // useEffect(() => {
  //   console.log(scrollDirection)
  // }, [scrollDirection])

  return (
    <div
      className="overflow-x-auto snap-x snap-proximity"
      // onScroll={(e) => {
      //   const target = e.target as HTMLDivElement
      //   setScrollLeft(target.scrollLeft)
      // }}
      ref={scrollContainer}
    >
      <div
        className={clsx(
          // "transition duration-150 ease-in-out",
          "relative grid grid-cols-[repeat(6,50%)] md:grid-cols-[repeat(6,25%)] lg:grid-cols-[repeat(8,1fr)]"
        )}
      >
        {Array(63)
          .fill(null)
          .map((_, i) => {
            return (
              <Color
                key={i}
                index={i}
                scrollXProgress={scrollXProgress}
                visibleColumns={4}
              />
            )
          })}
      </div>
    </div>
  )
}

export default AppBracket
