bracket-updater
===============

Update a tournament bracket after the completion of a game.

[![NPM](https://nodei.co/npm/bracket-updater.png)](https://nodei.co/npm/bracket-updater/)
[![Build Status](https://travis-ci.org/bracketclub/bracket-updater.png?branch=master)](https://travis-ci.org/bracketclub/bracket-updater)
[![Greenkeeper badge](https://badges.greenkeeper.io/bracketclub/bracket-updater.svg)](https://greenkeeper.io/)

## API / Usage

Make a new `bracket-updater` object with an options object (the year and sport options are required and passed directly to [`bracket-data`](https://github.com/bracketclub/bracket-data#which-sports-does-it-have)):

```js
var BracketUpdater = require('bracket-updater');
var updater = new BracketUpdater({
   year: '2013',
   sport: 'ncaam',
   currentMaster: 'MWX812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX'
});

updater.update({
    winner: 2,
    loser: 15,
    fromRegion: 'MW'
});

updater.update({
    winner: 1,
    loser: 16,
    fromRegion: 'MW'
});

// 'MW1812463X2XXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX'
console.log(updater.currentMaster);
```

### options

These options are required when creating a new updater. They can't be changed.

- `sport`: The sport you are validating. See [`bracket-data`](https://github.com/bracketclub/bracket-data#api) for more info.
- `year`: The year you are validating. See [`bracket-data`](https://github.com/bracketclub/bracket-data#api) for more info.

These options can be passed in when creating a new updater or passed to `update` later.

- `winner`: The winning team. Can be a `seed (Integer)`, `name (String)` or an object with those properties.
- `loser`: The losing team. Can be a `seed (Integer)`, `name (String)` or an object with those properties.
- `fromRegion`: The region the match was played in.
- `currentMaster`: The current master bracket. This is required the first time you call update.

### methods

- `update(options)`: Update the bracket. Options can include all the above options except `sport` and `year`.  Returns the new `currentMaster`.
