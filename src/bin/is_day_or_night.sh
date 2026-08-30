#!/bin/bash

is_day_or_night() {

  GSETTINGS_SCHEMA_DIR="/home/${USER}/.local/share/gnome-shell/extensions/night-shift@christophermca.github.io/schemas/"
  SCHEMA_ID="org.gnome.shell.extensions.night-shift"

  useGeoclue=$(export GSETTINGS_SCHEMA_DIR=$GSETTINGS_SCHEMA_DIR; gsettings get $SCHEMA_ID 'use-geoclue');

  # GET times
  times=$(export GSETTINGS_SCHEMA_DIR=$GSETTINGS_SCHEMA_DIR; gsettings get $SCHEMA_ID times);

  IFS="," read -r sunrise sunset <<< "$times"
  current_time=`date '+%H:%M'` # 24hr format

  # Calculate day-or-night
  if [[ "$current_time" > "$sunrise" ]]; then
    DAY_NIGHT='day'
  fi

  if [[ "$current_time" > "$sunset" ]]; then
    DAY_NIGHT='night'
  fi

  # set day-or-night
  $(export GSETTINGS_SCHEMA_DIR=$GSETTINGS_SCHEMA_DIR; gsettings set $SCHEMA_ID "day-or-night" $DAY_NIGHT)

}

is_day_or_night

