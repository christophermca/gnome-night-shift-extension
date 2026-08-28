#!/bin/python
import argparse
import os
import requests
import re
import gi
import subprocess

from pathlib import Path
from datetime import datetime

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

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


def save(coords, override=False):
    settings = _settings()
    previous_coordinates = settings.get_value("last-known-coordinates")
    print(coords, previous_coordinates)

    if override:
        print(f"Override: {override}")

    if override or (coords_string != previous_coordinates):
        last_known_coordinates = GLib.Variant("(dd)", coords)
        settings.set_value("last-known-coordinates", last_known_coordinates)
        return coords
    else:
        print(
            f"Locations are the same (old/new) '{previous_coordinates}'/'{coords_string}'"
        )


def _get_location(override):
    try:
        settings = _settings()
        useGeoclue = settings.get_boolean("use-geoclue")
        if not useGeoclue:
            coords = get_static_location()
        else:
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

            for line in iter(geoclue_data.stdout.readline, ""):
                match = re.match(regex, line)

                if match:
                    coords.append(match.group().split()[1])

                if len(coords) == 2:
                    geoclue_data.terminate()
                    break

            if not coords:
                raise TypeError(
                    "Could not determine location. Please check your geoclue configuration"
                )

            # did location update?
            # save(coords, override)
        return coords

    except subprocess.TimeoutExpired as e:
        print(f"TimeoutExpired: {e.timeout} seconds\n\n {e.stdout}")
        return None

    except subprocess.CalledProcessError as e:
        print(f"Error: {e.returncode} \n\n {e.stderr}")
        return None

    finally:
        try:
            if agent.poll():
                print("Terminating geoclue agent")
                agent.terminate()  # Gracefully exits
                agent.wait()  # Prevents zombie processes
        except NameError:
            pass


def _get_sunrise_sunset(lat, lng):
    try:
        params = {"lat": lat, "lng": lng}

        # Handle response
        response = requests.get(NOAA, params)
        response.raise_for_status()

        data = response.json()

        # print(f"night-shift data: {data}")
        tzid = data["tzid"]
        sunrise = datetime.fromisoformat(data["sunrise"]).strftime("%H:%M")
        sunset = datetime.fromisoformat(data["sunset"]).strftime("%H:%M")

        times = (sunrise, sunset)

        # update settings
        settings = _settings()
        settings.set_string(
            "timestamp", f"{datetime.now().astimezone().isoformat()}"
        )
        print(
            f"night-shift {data.get('sunrise'), data.get('sunset'), data.get('tzid')}"
        )
        settings.set_string("tzid", tzid)
        print(f"{times}")
        times_tuple = GLib.Variant("(ss)", times)

        settings.set_value("times", times_tuple)

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred (e.g., 404, 500): {http_err}")

    finally:
        print("Done")


def _settings():
    # initialize gsettings obj
    schemaObj = schema_source.lookup(SCHEMA_ID, True)
    settings = Gio.Settings.new_full(schemaObj, None, None)

    return settings


def get_static_location():
    settings = _settings()

    lat = settings.get_string("static-latitude")
    lng = settings.get_string("static-longitude")
    static_location = (float(lat), float(lng))

    if lat and lng:
        last_known_coordinates = GLib.Variant("(dd)", static_location)
        settings.set_value("last-known-coordinates", last_known_coordinates)
        return [lat, lng]

    else:
        print("Missing required keys")


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
    coords = _get_location(override)
    print(f"find-me {coords}")
    if coords:
        _get_sunrise_sunset(*coords)


if __name__ == "__main__":
    main()
