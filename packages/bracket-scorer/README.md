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
console.log(scorer.score());
```

### options

- `sport`: The sport you are validating. See [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#api) for more info.
- `year`: The year you are validating. See [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#api) for more info.
- `entry`: (String, required) Whether to only test the validation and not return an expanded bracket
- `master`: (String, required) Whether the validation should allow unpicked matches. This is useful for validating a bracket as a user is selecting it.
- `scoring`: (Object, optional) Scoring system that can be used. By default the scoring systems from the year/sport [`bracket-data`](https://github.com/tweetyourbracket/bracket-data) will be available. Those can be overriden here. See below for possible scoring system formats.

### methods

- `score(methods, options)`: Score the bracket. The first param is an array of scoring methods or a string can be used to call only one scoring method. Each one will be returned as a property on the response object. If only one method is called, the response will just be that value. By default, only `standard` will be used. `options` will be passed to `reset` to possible reset the `entry` or `master` brackets. Any string that can used in `methods` can also be called directly, so `score('standard')` can also be called just by `standard()`.
- `reset({entry: entry, master: master})`: Reset the internal validators used by the scorer for either the `entry`, `master` or both.

### default scoring methods

Check out [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#what-data-does-this-module-give-me) to see the specific scoring systems for each sport/year.

Also by default this modules adds the following:

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
console.log(scorer.onePointPerGame());
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
console.log(scorer.massivelyWeightedChampion());
```

## Anything else?

If this is interesting to you, I think you should follow me ([@lukekarrys](https://twitter.com/lukekarrys)) and [@tweetthebracket](https://twitter.com/tweetthebracket) on Twitter. There are also a lot of other bracket related modules on our [GitHub organization page](https://github.com/tweetyourbracket).

