bracket-generator
=================

Generate a tournament bracket.

[![NPM](https://nodei.co/npm/bracket-generator.png)](https://nodei.co/npm/bracket-generator/)

[![Build Status](https://travis-ci.org/tweetyourbracket/bracket-generator.png?branch=master)](https://travis-ci.org/tweetyourbracket/bracket-generator)


## What is this?
`bracket-generator`, well, it generates brackets! (Check out [`bracket-data`](https://github.com/tweetyourbracket/bracket-data) for more info about brackets and their data.)

More specifically, this module generates a [string representation of a bracket](https://gist.github.com/lukekarrys/2028007#explanation). That string can then be used with a whole bunch of others modules to [validate it](https://github.com/tweetyourbracket/bracket-validator), [update it](https://github.com/tweetyourbracket/bracket-updater), or [score it](https://github.com/tweetyourbracket/bracket-scorer).

This module isn't that useful for selecting brackets (unless you wanted to stage an epic robot bracket challenge, wait, that'd be awesome) but it is useful for testing other bracket modules and creating random (or not-so-random) brackets.

## API / Usage

Make a new `bracket-generator` object with an options object (the year and sport options are required and passed directly to [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#which-sports-does-it-have)):

```js
var BracketGenerator = require('bracket-generator');
var generator = new BracketGenerator({
   year: '2013',
   sport: 'ncaam',
   winners: 'random'
});
console.log(generator.generate());
```

### options

- `sport`: The sport you are generating. See [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#api) for more info.
- `year`: The year you are generating. See [`bracket-data`](https://github.com/tweetyourbracket/bracket-data#api) for more info.
- `winners`: (String, default: 'random') How the winners of the bracket should be selected. See below for the explantion of each option:

#### `winners`

The `winners` option can be a few things:

- `random`: it will generate a random bracket! (it probably won't win any office pools)
- `higher`: all higher seeds will win. If two seeds are the same, the seed on the bottom of the matchup will win (definitely wont win any office pools)
- `lower`: all lower seeds will win. If two seeds are the same, the seed on the top of the matchup will win
- A binary string (`10101110...`). The string you pass in should have a length matching the number of games in the bracket. This will generate a bracket with each matchup corresponding to a single character in the string. If the character is `0` the lower seed will win. If the character is `1` the higher seed will win. This is useful because it allows you to create every possible bracket! See [the tests](https://github.com/tweetyourbracket/bracket-generator/blob/master/test/test.js#L15-L26) for how I accomplished that.

### methods

- `generate(winners)`: Generate the bracket. The param `winners` is optional here. If you pass it in, it will reset the generator first and then generate a bracket using the `winners` option you passed in, otherwise it will use the option it was instantiated with. It will a bracket string.

#### License

MIT