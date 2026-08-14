#!/bin/python

import json
import requests
import ast
import re

from pathlib import Path
from datetime import datetime
import subprocess

CACHE_FOLDER = "~/.cache/night-shift/"
SCHEMA = "org.gnome.settings-daemon.plugins.color"
KEY = "night-light-last-coordinates"


def get_sunrise_sunset(schema, key):
    try:
        # GET location
        agent = subprocess.Popen(["/usr/lib/geoclue-2.0/demos/agent"])
        geoclue_data = subprocess.run(
            [
                "/usr/lib/geoclue-2.0/demos/where-am-i",
                "--timeout=4",
                "--accuracy-level=4",
            ],  # `run /usr/lib/geoclue-2.0/demo/where-am-i -h` for more information about options
            capture_output=True,
            text=True,
            check=True,
        )
        if geoclue_data:
            print("Cleaning up subprocess...")
            agent.terminate()

        regex = r"^(Lat.*:|Long.*:).*([\.\-\d+]+)"
        lines = geoclue_data.stdout.splitlines()
        if not lines:
            raise Exception("Could not connect to geoclue")
            return None

        coords = []

        for line in lines:
            match = re.match(regex, line)
            if match:
                coords.append(match.group().split()[1])

        # GET sunrise and sunset times.
        if coords:
            lat, lng = coords
        else:
            raise TypeError("coordinates returned empty")

        noaa_url = "https://api.sunrise-sunset.org/v2"
        params = {"lat": lat, "lng": lng}

        # Handle response
        response = requests.get(noaa_url, params).json()
        sunrise = datetime.fromisoformat(response["sunrise"]).strftime("%H:%M")
        sunset = datetime.fromisoformat(response["sunset"]).strftime("%H:%M")

        print({"sunrise": sunrise, "sunset": sunset})

        times = [sunrise, sunset]

        state_file = Path.expanduser(Path(CACHE_FOLDER, "times"))

        if state_file.exists():
            with state_file.open("w", encoding="utf-8") as file:
                file.write(",".join(times))
        else:
            with state_file.open("x", encoding="utf-8") as file:
                file.write(",".join(times))

    except FileNotFoundError:
        print(f"Error: could not find {executable}")
        return None

    except subprocess.TimeoutExpired as e:
        print(f"Timeout: {e.timeout} seconds\n\n {e.stdout}")
        return None

    except subprocess.CalledProcessError as e:
        print(f"Error: {e.returncode} \n\n {e.stderr}")
        return None


if __name__ == "__main__":
    get_sunrise_sunset(SCHEMA, KEY)
