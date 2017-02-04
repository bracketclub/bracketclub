#!/usr/bin/env bash

API=https://bc-api.now.sh/
MEN=ncaam
WOMEN=ncaaw
ENTRIES=entries
MASTERS=masters
DATA_DIR=".data"

mkdir -p $DATA_DIR

curl -s ${API}${ENTRIES}/${MEN}-2012 > ${DATA_DIR}/${ENTRIES}-${MEN}-2012.json
curl -s ${API}${ENTRIES}/${MEN}-2013 > ${DATA_DIR}/${ENTRIES}-${MEN}-2013.json
curl -s ${API}${ENTRIES}/${MEN}-2014 > ${DATA_DIR}/${ENTRIES}-${MEN}-2014.json
curl -s ${API}${ENTRIES}/${MEN}-2015 > ${DATA_DIR}/${ENTRIES}-${MEN}-2015.json
curl -s ${API}${ENTRIES}/${MEN}-2016 > ${DATA_DIR}/${ENTRIES}-${MEN}-2016.json
curl -s ${API}${ENTRIES}/${MEN}-2017 > ${DATA_DIR}/${ENTRIES}-${MEN}-2017.json

curl -s ${API}${ENTRIES}/${WOMEN}-2016 > ${DATA_DIR}/${ENTRIES}-${WOMEN}-2016.json
curl -s ${API}${ENTRIES}/${WOMEN}-2017 > ${DATA_DIR}/${ENTRIES}-${WOMEN}-2017.json

curl -s ${API}${MASTERS}/${MEN}-2012 > ${DATA_DIR}/${MASTERS}-${MEN}-2012.json
curl -s ${API}${MASTERS}/${MEN}-2013 > ${DATA_DIR}/${MASTERS}-${MEN}-2013.json
curl -s ${API}${MASTERS}/${MEN}-2014 > ${DATA_DIR}/${MASTERS}-${MEN}-2014.json
curl -s ${API}${MASTERS}/${MEN}-2015 > ${DATA_DIR}/${MASTERS}-${MEN}-2015.json
curl -s ${API}${MASTERS}/${MEN}-2016 > ${DATA_DIR}/${MASTERS}-${MEN}-2016.json
curl -s ${API}${MASTERS}/${MEN}-2017 > ${DATA_DIR}/${MASTERS}-${MEN}-2017.json

curl -s ${API}${MASTERS}/${WOMEN}-2016 > ${DATA_DIR}/${MASTERS}-${WOMEN}-2016.json
curl -s ${API}${MASTERS}/${WOMEN}-2017 > ${DATA_DIR}/${MASTERS}-${WOMEN}-2017.json
