bracket-scorer
==============

Find the score of a tournament bracket.

[![NPM](https://nodei.co/npm/bracket-scorer.png)](https://nodei.co/npm/bracket-scorer/)

[![Build Status](https://travis-ci.org/tweetyourbracket/bracket-scorer.png?branch=master)](https://travis-ci.org/tweetyourbracket/bracket-scorer)

![Testling CI badge](https://ci.testling.com/tweetyourbracket/bracket-scorer.png)

## What is this?

`bracket-scorer` is a module that will score or diff two brackets against each other. Usually one is the entry and one is the master. The brackets it takes are [string representation of brackets](https://gist.github.com/lukekarrys/2028007#explanation).

## API / Usage

Make a new `bracket-scorer` object with an options object (the year and sport options are required and passed directly to [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#which-sports-does-it-have)):

```js
var BracketScorer = require('bracket-scorer');
var scorer = new BracketScorer({
   year: '2013',
   sport: 'ncaa-mens-basketball',
   entry: entryBracket,
   master: masterBracket
});
scorer.score();
```

### options

- `sport`: The sport you are scoring. See [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#api) for more info.
- `year`: The year you are scoring. See [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#api) for more info.
- `entry`: (String or Array, required) The entry bracket to score. Can also be an array of strings and the result will be an array of scores.
- `master`: (String, required) The master bracket to score the entry against.
- `scoring`: (Object, optional) Scoring systems that can be used. By default the scoring systems from the year/sport [`bracket-data`](https://github.com/tweetyourbracket/bracket-data) will be available. Those can be overriden here. See [below](#scoring) for possible scoring system formats.

### methods

- `score(methods, [{entry: entry, master: master}])`: Score the bracket.
  - `methods (default: 'rounds')` is an array of scoring methods (`['rounds', 'standard']`) or a string can be used to call only one scoring method (`'rounds'`). Each one will be returned as a property on the response object. If only one method is called, the response will just be that value.
  - The second param will be passed to `reset` to optionally reset the `entry` or `master` brackets.

Examples:
```js
// Equivalent
s = scorer.score()
s = scorer.score('rounds')
s = scorer.rounds() // Convenience methods exist for each single scoring method
console.log(s); // eg [24, 12, 3, 1, 0, 0]

// Call multiple methods
// Return object will have each property
s = scorer.score(['rounds', 'standard'])
// Equivalent to
s.rounds = scorer.rounds()
s.standard = scorer.standard()
console.log(s.rounds, s.standard) // eg [24, 12, 3, 1, 0, 0], 900

// Change the master bracket before scoring
s = scorer.score('rounds', {master: newMaster})
// Can also be passed as the first param if you want to use the default 'rounds'
s = scorer.score({master: newMaster})
// Or just called with the `rounds` covenience method
s = scorer.rounds({master: newMaster})

// Can diff the brackets too
s = scorer.diff() // or s.scorer('diff')
// Was the first pick of the first round in the MW region correct?
console.log(s.MW.rounds[0][0].correct)
```

- `reset({entry: entry, master: master})`: Reset the internal validators used by the scorer for either the `entry`, `master` or both. You usually dont need to call this and can instead just call any of the scoring methods with this as an optional second parameter.

### default scoring methods

Check out [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#what-data-does-this-module-give-me) to see the specific scoring systems for each sport/year.

Also by default this module adds the following:

- `rounds`: Returns an array with a count for how many correct picks in each round.
- `diff`: Not really a scoring system, but this will return the [validated entry bracket](https://github.com/tweetyourbracket/bracket-validator) with the following properties added to each game.
  - `correct: true/false` Whether thr game is correct or not. Only applies to completed games
  - `shouldBe: team` If the pick is incorrect, this is the team that is actually in that position
  - `eliminated: true` If the game is unplayed and that team is knocked out, this will be true

### `scoring`

*Note: usually you wont need to mess with this as a few scoring systems are contained for each sport in the [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#what-data-does-this-module-give-me) module. But if you want to create your own scoring systeam, this is what you need to know.*

Scoring systems in the `scoring` option can have a few different forms. Any key in `scoring` will be created as a convenience method on the scorer. Here's an example:

```js
var scorer = new BracketScorer({
    year: '2013',
    sport: 'ncaa-mens-basketball',
    entry: entryBracket,
    master: masterBracket,
    scoring: {
        onePointPerGame: 1
    }
});
// Will give the entry one point for every correct pick
scorer.onePointPerGame();
// Or can be called like
scorer.score('onePointPerGame');
```

If a scoring system is just one number (like the example above), that value will be added to the score for each correct pick. The scoring system can also be an array. If it is an array of numbers and the array length is equal to the number of rounds, each value will be used for the appropriate round. For example:

```js
var scorer = new BracketScorer({
    year: '2013',
    sport: 'ncaa-mens-basketball',
    entry: entryBracket,
    master: masterBracket,
    scoring: {
        massivelyWeightedChampion: [1, 1, 1, 1, 1, 1000]
    }
});
// Will give the entry one point for every correct pick in the first five rounds
// And 1000 points if they get the champion correct
scorer.massivelyWeightedChampion();
// Or can be called like
scorer.score('massivelyWeightedChampion');
```

## Anything else?

If this is interesting to you, I think you should follow me ([@lukekarrys](https://twitter.com/lukekarrys)) and [@tweetthebracket](https://twitter.com/tweetthebracket) on Twitter. There are also a lot of other bracket related modules on our [GitHub organization page](https://github.com/tweetyourbracket).

