const argv = require('yargs')
  .string('year')
  .string('sport')
  .default('year', new Date().getFullYear().toString())
  .default('sport', 'ncaam')
  .array('years')
  .array('sports')
  .array('events')
  .argv

module.exports = () => {
  if (Array.isArray(argv.events) && argv.events.length) {
    return argv.events.map((event) => ({
      sport: event.split('-')[0],
      year: event.split('-')[1]
    }))
  }

  if (Array.isArray(argv.sports) && argv.sports.length) {
    return argv.sports.map((sport) => ({
      sport,
      year: argv.year
    }))
  }

  if (Array.isArray(argv.years) && argv.years.length) {
    return argv.years.map((year) => ({
      year,
      sport: argv.sport
    }))
  }

  return {
    sport: argv.sport,
    year: argv.year
  }
}
