#!/bin/python
import argparse
import json
import os
import requests
import re
import gi
import subprocess

from pathlib import Path
from datetime import datetime, timezone, date

gi.require_version("Gio", "2.0")
from gi.repository import Gio

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

# Load schema
schema_source = Gio.SettingsSchemaSource.new_from_directory(
    schema_dir, Gio.SettingsSchemaSource.get_default(), False
)


def _get_location(override):
    try:
        # Get location data from Geoclue
        agent = subprocess.Popen(["/usr/lib/geoclue-2.0/demos/agent"])
        geoclue_data = subprocess.Popen(
            [
                "/usr/lib/geoclue-2.0/demos/where-am-i",
                "--accuracy-level=8",
                "--time-threshold=3",
                # "--timeout=9",
            ],  # `run /usr/lib/geoclue-2.0/demo/where-am-i -h` for more information about options
            text=True,
            stdout=subprocess.PIPE,
        )

        regex = r"^(Lat.*:|Long.*:).*([\.\-\d+]+)"
        timestamp = r"^(Timestamp:).*([\.\-\d+]+)"

        coords = []

        # READS response for LAT and LNG

        print(f"findme: {geoclue_data.stdout}")
        for line in iter(geoclue_data.stdout.readline, ""):
            match = re.match(regex, line)

            if match:
                print(f"[night-shift] {match.group()}")
                coords.append(match.group().split()[1])

            if len(coords) == 2:
                geoclue_data.terminate()
                break

        if not coords:
            raise TypeError(
                "Could not determine location. Please check your geoclue configuration"
            )

        settings = _settings()

        # did location update?
        previous_coordinates = settings.get_string("last-known-coordinates")
        coords_string = ",".join(coords)

        if override:
            print(f"Override: {override}")

        print(f"coords: {coords_string}")
        if override or (coords_string != previous_coordinates):
            settings.set_string("last-known-coordinates", coords_string)
            return coords
        else:
            print(
                f"Locations are the same (old/new) '{previous_coordinates}'/'{coords_string}'"
            )

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
        params = {"lat": lat, "lng": lng}

        # Handle response
        response = requests.get(NOAA, params)
        response.raise_for_status()

        data = response.json()

        tzid = data["tzid"]
        sunrise = datetime.fromisoformat(data["sunrise"]).strftime("%H:%M")
        sunset = datetime.fromisoformat(data["sunset"]).strftime("%H:%M")

        times = [sunrise, sunset]
        time_string = ",".join(times)

        # update settings

        settings = _settings()
        settings.set_string(
            "timestamp", f"{datetime.now().astimezone().isoformat()}"
        )
        print(
            f"night-shift {data.get('sunrise'), data.get('sunset'), data.get('tzid')}"
        )
        settings.set_string("tzid", tzid)
        settings.set_string("times", time_string)

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred (e.g., 404, 500): {http_err}")

    finally:
        print("Done")


def _settings():
    # initialize gsettings obj
    schemaObj = schema_source.lookup(SCHEMA_ID, True)
    settings = Gio.Settings.new_full(schemaObj, None, None)

    return settings


def getStaticLocation():
    settings = _settings()

    lat = settings.get_string("static-latitude")
    lng = settings.get_string("static-longitude")
    if lat and lng:
        static_location = [lat, lng]
        lat_lng = ",".join(static_location)
        print(f"[night-shift] lat_lng: {lat_lng}")
        return static_location

    else:
        pass


def main():
    # Parse commendline arguments
    parser = argparse.ArgumentParser(
        description="Get the times for the sunrise/sunset"
    )
    parser.add_argument("-f", action="store_true")
    args = parser.parse_args()
    override = args.f

    # GET data from GObject
    settings = _settings()
    useGeoclue = settings.get_boolean("use-geoclue")

    # Run
    coords = _get_location(override) if useGeoclue else getStaticLocation()
    if coords:
        print(*coords)
        _get_sunrise_sunset(*coords)
    else:
        print("coords not defined")


if __name__ == "__main__":
    main()
