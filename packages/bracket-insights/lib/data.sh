#!/usr/bin/env bash

API=https://api.tweetyourbracket.com/
MEN=ncaam
WOMEN=ncaaw
ENTRIES=entries
MASTERS=masters

curl -s ${API}${ENTRIES}/${MEN}-2012 > data/${ENTRIES}-${MEN}-2012.json
curl -s ${API}${ENTRIES}/${MEN}-2013 > data/${ENTRIES}-${MEN}-2013.json
curl -s ${API}${ENTRIES}/${MEN}-2014 > data/${ENTRIES}-${MEN}-2014.json
curl -s ${API}${ENTRIES}/${MEN}-2015 > data/${ENTRIES}-${MEN}-2015.json
curl -s ${API}${ENTRIES}/${MEN}-2016 > data/${ENTRIES}-${MEN}-2016.json
curl -s ${API}${ENTRIES}/${WOMEN}-2016 > data/${ENTRIES}-${WOMEN}-2016.json

curl -s ${API}${MASTERS}/${MEN}-2012 > data/${MASTERS}-${MEN}-2012.json
curl -s ${API}${MASTERS}/${MEN}-2013 > data/${MASTERS}-${MEN}-2013.json
curl -s ${API}${MASTERS}/${MEN}-2014 > data/${MASTERS}-${MEN}-2014.json
curl -s ${API}${MASTERS}/${MEN}-2015 > data/${MASTERS}-${MEN}-2015.json
curl -s ${API}${MASTERS}/${MEN}-2016 > data/${MASTERS}-${MEN}-2016.json
curl -s ${API}${MASTERS}/${WOMEN}-2016 > data/${MASTERS}-${WOMEN}-2016.json
