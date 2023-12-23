# @bracketclub/validator

Validate a tournament bracket.

## What is this?

`@bracketclub/validator` is a module that takes a [string representation of a bracket](https://gist.github.com/lukekarrys/2028007#explanation) and validates it against the real data for that bracket's sport and year.

The main use case for this is to validate a user's entry against the actual data in order to score it or display it showing correct/incorrect picks. There are other modules which rely on `@bracketclub/validator` such as [`@bracketclub/scorer`](../scorer) and [`@bracketclub/updater`](../updater).

## API / Usage

```js
const validate = require("@bracketclub/validator")
const makeBracketData = require("@bracketclub/data")
const ncaam = require("@bracketclub/data/ncaam")
const result = validate(
  "MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX",
  makeBracketData(ncaam),
  { testOnly: false, allowEmpty: true }
})
console.log(result)
```

### options

- `testOnly`: (Boolean, default: false) Whether to only test the validation and not return an expanded bracket
- `allowEmpty`: (Boolean, default: true) Whether the validation should allow unpicked matches. This is useful for validating a bracket as a user is selecting it.
