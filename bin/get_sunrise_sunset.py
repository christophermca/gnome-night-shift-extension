#!/bin/python

import json
import requests
import ast

from pathlib import Path
from datetime import datetime
import subprocess

CACHE_FOLDER = "~/.cache/night-shift/"
SCHEMA = "org.gnome.settings-daemon.plugins.color"
KEY = "night-light-last-coordinates"


def set_session_variables_night_shift(schema, key):
    try:
        # GET location
        ## collects data from gsettings
        value = subprocess.run(
            ["gsettings", "get", schema, key],
            text=True,
            check=True,
            capture_output=True,
        )

        val = value.stdout
        result = ast.literal_eval(val)
        lat, lng = result

        # GET sunrise and sunset times.
        noaa_url = "https://api.sunrise-sunset.org/v2"
        params = {"lat": lat, "lng": lng}

        # Handle response
        response = requests.get(noaa_url, params).json()
        sunrise = datetime.fromisoformat(response["sunrise"]).strftime("%H:%M")
        sunset = datetime.fromisoformat(response["sunset"]).strftime("%H:%M")

        print({"sunrise": sunrise, "sunset": sunset})

        times = [sunrise, sunset]

        state_file = Path.expanduser(Path(CACHE_FOLDER, "times"))

        print(state_file)
        if state_file.exists():
            with state_file.open("w", encoding="utf-8") as file:
                file.write(",".join(times))
        else:
            with state_file.open("x", encoding="utf-8") as file:
                file.write(",".join(times))

    except subprocess.CalledProcessError:
        print(f"Error: Cound not retrieve {key} from {schema}")
        return None


if __name__ == "__main__":
    set_session_variables_night_shift(SCHEMA, KEY)
