#!/bin/bash

auto_update_perf_mode() {

  CACHE_FOLDER="/home/${USER}/.cache/night-shift"
  IS_DAY_OR_NIGHT="${CACHE_FOLDER}/is-day-or-night"
  DAY_MODE='day'
  NIGHT_MODE='night'

  DAY_NIGHT=$(cat $IS_DAY_OR_NIGHT)

  if [ -z $DAY_NIGHT ]; then
    echo "missing day_night; Check provided path: $IS_DAY_OR_NIGHT"
    exit 33
  fi

echo "$DAY_NIGHT"
if [ "$DAY_NIGHT" == "$DAY_MODE" ]; then
  PREFER_MODE='prefer-light';
elif [ "$DAY_NIGHT" == "$NIGHT_MODE" ]; then
  PREFER_MODE='prefer-dark';
fi

if [[ -n $PREFER_MODE ]]; then
  gsettings set org.gnome.desktop.interface color-scheme $PREFER_MODE
fi

}

auto_update_perf_mode

