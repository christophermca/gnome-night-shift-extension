#!/bin/bash


is_day_or_night() {

  STATE_FOLDER="/home/${USER}/.cache/night-shift"
  IS_DAY_OR_NIGHT="${STATE_FOLDER}/is-day-or-night"

  IFS="," read -r stop start <<< "$(cat ${STATE_FOLDER}/times)"
  current_time=`date '+%H:%M'`

  if [[ "$current_time" > "$stop" ]]; then
    DAY_NIGHT='day'
  fi

  if [[ "$current_time" > "$start" ]]; then
    DAY_NIGHT='night'
  fi

  echo "its ${DAY_NIGHT}time"

  save_configuration() {
    echo "save_configuration: is cache up-to-date?"
    local -r day_night_mode=$(cat $IS_DAY_OR_NIGHT)

    if [[ -n $DAY_NIGHT && $day_night_mode != $DAY_NIGHT ]]; then

      if [[ ! -f  $IS_DAY_OR_NIGHT ]]; then
        touch $IS_DAY_OR_NIGHT
      fi

      echo "Updating cache"

      echo $DAY_NIGHT > $IS_DAY_OR_NIGHT

      export DAY_NIGHT=$DAY_NIGHT

    else
      # does nothing
      echo "The current state is the same"
    fi
  }

save_configuration

}

is_day_or_night

