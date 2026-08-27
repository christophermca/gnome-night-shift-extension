import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import GObject from 'gi://GObject'

import {
  ExtensionPreferences,
  gettext
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const staticLocationRegex = /^-?\d{1,3}\.\d+$/

export default class NightShiftPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // Create a preferences page, with a single group
    const page = new Adw.PreferencesPage({
      title: gettext('General'),
      icon_name: 'dialog-information-symbolic',
    });

    // GROUPS
    const group = new Adw.PreferencesGroup({
      title: gettext('Preferences'),
      description: gettext('Configure the extension'),
    });

    const locationSettings = new Adw.PreferencesGroup({
      title: gettext('Location Settings'),
      description: gettext('Configure how Night shift determines user\'s location.'),
    });

    const locationSettingsSubgroup = new Adw.PreferencesGroup({
      title: gettext('Static Location (Manual)'),
      margin_top: 2
    });

    // TOGGLE OPTIONS
    const showIndicator = new Adw.SwitchRow({
      title: gettext('Show Indicator'),
      subtitle: gettext('Whether to show the panel indicator'),
    });

    // Create a new preferences row
    const useGeoclue = new Adw.SwitchRow({
      title: gettext('Automatically determine User\'s Location (geoclue2)'),
      subtitle: gettext('Requires "geoclue configuration" `/etc/geoclue/geoclue.conf`'),
    });

    group.add(showIndicator);

    locationSettings.add(useGeoclue);
    locationSettings.add(locationSettingsSubgroup);

    const latitude = new Adw.EntryRow({title: 'Latitude', showApplyButton: true});
    const longitude = new Adw.EntryRow({title: 'Longitude', showApplyButton: true});
    locationSettingsSubgroup.add(latitude);
    locationSettingsSubgroup.add(longitude);

    // Create page
    window.add(page);
    page.add(group);
    page.add(locationSettings);

    // Create a settings object and bind the row to the `show-indicator` key
    window._settings = this.getSettings();
    window._settings.bind('show-indicator', showIndicator, 'active',
      Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('use-geoclue', useGeoclue, 'active',
      Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('static-latitude', latitude, 'text',
      Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('static-longitude', longitude, 'text',
      Gio.SettingsBindFlags.DEFAULT);

    useGeoclue.connect('notify::active', (row) => {
      const switchRowIsDisabled = !row.get_active();
      locationSettingsSubgroup.set_sensitive(switchRowIsDisabled);
    });

    latitude.connect('changed', (row) => {
      log(`[night-shift] inside static latitude connect ${row.get_text()}`)
      const coord = row.get_text()
      const isValid = staticLocationRegex.test(coord)
      if (isValid) {
        // if error is present
        clearError(latitude)
        // save string
        window._settings.set_string('static-latitude', coord)
      } else {
        displayError(latitude)
      }
    });

    longitude.connect('changed', (row) => {
      log(`[night-shift] inside static longitude connect ${row.get_text()}`)
      const coord = row.get_text()
      const isValid = staticLocationRegex.test(coord)
      if (isValid) {
        // if error is present
        clearError(longitude)
        // save string
        window._settings.set_string('static-longitude', coord)
      } else {
        displayError(longitude)
      }
    });


    const useGeoclueDisabled = !useGeoclue.get_active();
    locationSettingsSubgroup.set_sensitive(useGeoclueDisabled);

    function clearError(row) {
        row.remove_css_class('error');
        locationSettingsSubgroup.set_description("");
    }

    function displayError(row) {
      locationSettingsSubgroup.set_description("invalid format, Coordinates are formatted as a double i.e ('40.231')");
      row.add_css_class('error');
    }
  }
}
