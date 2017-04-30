bracket-validator
==============

[![Greenkeeper badge](https://badges.greenkeeper.io/bracketclub/bracket-validator.svg)](https://greenkeeper.io/)

Validate a tournament bracket.

[![NPM](https://nodei.co/npm/bracket-validator.png)](https://nodei.co/npm/bracket-validator/)

[![Build Status](https://travis-ci.org/bracketclub/bracket-validator.png?branch=master)](https://travis-ci.org/bracketclub/bracket-validator)

*To see the data this repo is built on, check out [bracket-data](https://github.com/bracketclub/bracket-data).*

## What is this?

`bracket-validator` is a module that takes a [string representation of a bracket](https://gist.github.com/lukekarrys/2028007#explanation) and validates it against the real data for that bracket's sport and year.

The main use case for this is to validate a user's entry against the actual data in order to score it or display it showing correct/incorrect picks. There are other modules which rely on `bracket-validator` such as [`bracket-scorer`](https://github.com/bracketclub/bracket-scorer) and [`bracket-updater`](https://github.com/bracketclub/bracket-updater).

## API / Usage

Make a new `bracket-validator` object with an options object (the year and sport options are required and passed directly to [`bracket-data`](https://github.com/bracketclub/bracket-data#which-sports-does-it-have)):

```js
var BracketValidator = require('bracket-validator');
var validator = new BracketValidator({
   year: '2013',
   sport: 'ncaam',
   /* User bracket string */
   flatBracket: 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX'
});
console.log(validator.validate());
```

### options

- `sport`: The sport you are validating. See [`bracket-data`](https://github.com/bracketclub/bracket-data#api) for more info.
- `year`: The year you are validating. See [`bracket-data`](https://github.com/bracketclub/bracket-data#api) for more info.
- `testOnly`: (Boolean, default: false) Whether to only test the validation and not return an expanded bracket
- `allowEmpty`: (Boolean, default: true) Whether the validation should allow unpicked matches. This is useful for validating a bracket as a user is selecting it.
- `flatBracket`: (String, default: '') The user's bracket to validate

### methods

- `validate(flatBracket)`: Validate the bracket. The param `flatBracket` is optional here. If you pass it in, it will call `reset` first and then validate, otherwise it will use the option it was instantiated with. It will return one of the following:
  - An `Error` with the `message` set to why the validation failed
  - The `flatBracket` if validation is successfull and `testOnly` is set to `true`
  - An expanded bracket object created from `flatBracket` if validation is successful. It will have each region containing a multidimensional array: `rounds`. This is ordered by round and picks, where if a pick is made it will contain the team `seed` and `name` and if a pick is not made it will be `null`.
- `reset(flatBracket)`: Reset the validator to use a new `flatBracket`.


## Anything else?

If this is interesting to you, I think you should follow me ([@lukekarrys](https://twitter.com/lukekarrys)) and [@tweetthebracket](https://twitter.com/tweetthebracket) on Twitter. There are also a lot of other bracket related modules on our [GitHub organization page](https://github.com/bracketclub).