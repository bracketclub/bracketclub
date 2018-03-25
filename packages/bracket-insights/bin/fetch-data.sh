#!/usr/bin/env bash

set -x

API="https://bc-api.now.sh/"
ENTRIES="entries"
MASTERS="masters"
SPORTS=("ncaam" "ncaaw" "nba" "nhl")
YEARS=("2012" "2013" "2014" "2015" "2016" "2017", "2018")
DATA_DIR=".data"

mkdir -p $DATA_DIR

for SPORT in "${SPORTS[@]}"; do for YEAR in "${YEARS[@]}"; do
  if [ -a "node_modules/bracket-data/data/${SPORT}/${YEAR}.json" ]; then
    CODE=$(curl --write-out %{http_code} --silent --output /dev/null ${API}${MASTERS}/${SPORT}-${YEAR})
    if [ "$CODE" == "200" ]; then
      curl -s ${API}${MASTERS}/${SPORT}-${YEAR} > ${DATA_DIR}/${MASTERS}-${SPORT}-${YEAR}.json
      curl -s ${API}${ENTRIES}/${SPORT}-${YEAR} > ${DATA_DIR}/${ENTRIES}-${SPORT}-${YEAR}.json
    fi
  fi
done; done
