#!/bin/bash

update_colorscheme() {

  CACHE_FOLDER="/home/${USER}/.cache/night-shift"
  IS_DAY_OR_NIGHT="${CACHE_FOLDER}/is-day-or-night"
  DAY_MODE='day'
  NIGHT_MODE='night'


  GSETTINGS_SCHEMA_DIR="/home/${USER}/.local/share/gnome-shell/extensions/night-shift@christophermca.github.io/schemas/"
  SCHEMA_ID="org.gnome.shell.extensions.night-shift"
  DAY_NIGHT=$(export GSETTINGS_SCHEMA_DIR=$GSETTINGS_SCHEMA_DIR; gsettings get $SCHEMA_ID times)

  if [ -z $DAY_NIGHT ]; then
    echo "missing day_night"
    exit 33
 fi

  if [ "$DAY_NIGHT" == "$DAY_MODE" ]; then
    PREFER_MODE='prefer-light';
  elif [ "$DAY_NIGHT" == "$NIGHT_MODE" ]; then
    PREFER_MODE='prefer-dark';
  fi

  if [[ -n $PREFER_MODE ]]; then
    gsettings set org.gnome.desktop.interface color-scheme $PREFER_MODE
  fi

}

update_colorscheme

