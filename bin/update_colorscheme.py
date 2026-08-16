#!/bin/python

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio

settings = Gio.Settings.new("org.gnome.shell.extensions.night-shift")
show_indicator = settings.get_value("show-indicator")
print(f"returned value: {show_indicator}")
