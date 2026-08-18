#!/bin/python

import json
import os
import requests
import ast
import re
import gi
import subprocess

from pathlib import Path
from datetime import datetime

gi.require_version("Gio", "2.0")
from gi.repository import Gio

CACHE_FOLDER = Path.home() / ".cache" / "night-shift"
NOAA = "https://api.sunrise-sunset.org/v2"
SCHEMA_ID = "org.gnome.shell.extensions.night-shift"

schema_dir = os.path.expanduser(
    Path.home()
    / ".local"
    / "share"
    / "gnome-shell"
    / "extensions"
    / "night-shift@christophermca.github.io"
    / "schemas"
)


def _get_location():
    try:
        # GET location
        agent = subprocess.Popen(["/usr/lib/geoclue-2.0/demos/agent"])
        geoclue_data = subprocess.run(
            [
                "/usr/lib/geoclue-2.0/demos/where-am-i",
                "--accuracy-level=4",
                "--timeout=9",
            ],  # `run /usr/lib/geoclue-2.0/demo/where-am-i -h` for more information about options
            capture_output=True,
            text=True,
            check=True,
            timeout=10,
        )

        regex = r"^(Lat.*:|Long.*:).*([\.\-\d+]+)"

        coords = []

        for line in geoclue_data.stdout.splitlines():
            match = re.match(regex, line)
            if match:
                coords.append(match.group().split()[1])

        # GET sunrise and sunset times.
        if not coords:
            raise TypeError("Could not determine coordinates")

        return coords

    except subprocess.TimeoutExpired as e:
        print(f"TimeoutExpired: {e.timeout} seconds\n\n {e.stdout}")
        return None

    except subprocess.CalledProcessError as e:
        print(f"Error: {e.returncode} \n\n {e.stderr}")
        return None

    finally:
        print("Terminating geoclue agent")
        agent.terminate()  # Gracefully exits
        agent.wait()  # Prevents zombie processes


def _get_sunrise_sunset(lat, lng):
    try:
        # Load schema
        schema_source = Gio.SettingsSchemaSource.new_from_directory(
            schema_dir, Gio.SettingsSchemaSource.get_default(), False
        )
        params = {"lat": lat, "lng": lng}

        # Handle response
        response = requests.get(NOAA, params)
        response.raise_for_status()

        data = response.json()

        sunrise = datetime.fromisoformat(data["sunrise"]).strftime("%H:%M")
        sunset = datetime.fromisoformat(data["sunset"]).strftime("%H:%M")

        times = [sunrise, sunset]
        time_string = ",".join(times)

        schemaObj = schema_source.lookup(SCHEMA_ID, True)
        settings = Gio.Settings.new_full(schemaObj, None, None)
        value = settings.get_string("times")
        print(f"[night-shift] Value: {value}")

        print(f"[night-shift] Times: {time_string}")
        settings.set_string("times", time_string)
        # subprocess.run(
        #     [
        #         "gsettings",
        #         "set",
        #         SCHEMA_ID,
        #         "times",
        #         time_string,
        #     ],
        # )

        # update cache
        # state_file = Path(CACHE_FOLDER, "times")

        # with state_file.open("w", encoding="utf-8") as file:
        #     file.write(time_string)

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred (e.g., 404, 500): {http_err}")

    finally:
        print("Done")


def main():
    coords = _get_location()
    _get_sunrise_sunset(*coords)


if __name__ == "__main__":
    main()
