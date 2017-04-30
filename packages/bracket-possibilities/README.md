bracket-possibilities
==================

[![Greenkeeper badge](https://badges.greenkeeper.io/bracketclub/bracket-possibilities.svg)](https://greenkeeper.io/)

Get the best possible outcomes for a bracket based on a partially complete master bracket.

[![NPM](https://nodei.co/npm/bracket-possibilities.png)](https://nodei.co/npm/bracket-possibilities/)
[![Build Status](https://travis-ci.org/bracketclub/bracket-possibilities.png?branch=master)](https://travis-ci.org/bracketclub/bracket-possibilities)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Install

```sh
npm install bracket-possibilities --save
```


## API / Usage

Make a new `bracket-possibilities` instance with an options object (the year and sport options are required and passed directly to [`bracket-data`](https://github.com/bracketclub/bracket-data#which-sports-does-it-have)):

```js
import P from 'bracket-possibilities'

const p = new P({ sport: 'ncaam', year: '2016' })

// Hey its my entry from 2016 and the actual completed games through the Sweet 16
const entries = require('./all-entries.json')
const findEntry = ({ user }) => user.username === 'lukekarrys'
const entry = entries.find(findEntry).bracket
const master = 'S19513113721532XXXW181241131021432XXXE1954614721567XXXMW191241131015141110XXXFFXXX'

// This will return the best possible future bracket for 'entry' with any unwinnable
// games (meaning the entry has an eliminated team winning) replaced with 'X'
p.best({ entry, master })
// S195131137215321X1W181241131021432X22E19546147215671X1MW191241131015141110XXXFFSXS

// If 'entry' gets every game correct that it can, this would be its score
p.bestScrore({ entry, master })
// 1240

// This will return an array of all possible bracket combinations based on the entry's best possible
// bracket. In this instance the entry had 7 unwinnable games, so there will be 128 (2^7)
// possibilities. Warning: the more incorrect picks the longer this will take
p.possibilities({ entry, master })
// [ ... ] (128 different brackets)

// This will return the first possible winning outcome for the entry matched by `findEntry`
// Unfortunately, for me this will return null in this case because I was eliminated by the Sweet 16
p.canWin({ entries, master, findEntry })
// null or something like { rank: 1, bracket: 'SOME WINNING BRACKET' }

// This will return some of the `possibilities` where the entry matched by `findEntry`
// will finish in 1st place (tied or not)
p.winners({ entries, master, findEntry })
// [{ rank: 1,  bracket: 'OUTCOME1' }, { rank: 1, bracket: 'OUTCOME2' }, ...]

// This will return all of the `possibilities` where the entry matched by `findEntry`
// will finish in 1st place (tied or not). The difference between `winners` is that
// method will short circuit some outcomes by only trying games where the entry
// does not have an elimiated team winning
p.allWinners({ entries, master, findEntry })
// [{ rank: 1,  bracket: 'OUTCOME1' }, { rank: 1, bracket: 'OUTCOME2' }, ...]

// Find all top 5 finishes for the entry matched by `findEntry`
p.finishes({ entries, master, findEntry, rank: 5 })
// [{ rank: 3, behind: 100,  bracket: 'OUTCOME1' }, { rank: 4, behind: 120, bracket: 'OUTCOME2' }, ...]
// behind is how many points the entry would be behind the eventual winner

// Pass `scoreType` to any method involving scoring to use a different scoring
// system for the end result. Eg, find the best possible score using the gooley
// scoring system
p.bestScore({ entry, master, scoreType: 'gooley' })
```

### LICENSE

MIT
