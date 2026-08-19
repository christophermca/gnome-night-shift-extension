import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class NightShiftPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: gettext('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: gettext('Appearance'),
            description: gettext('Configure the appearance of the extension'),
        });
        page.add(group);

        // Create a new preferences row
        const row = new Adw.SwitchRow({
            title: gettext('Show Indicator'),
            subtitle: gettext('Whether to show the panel indicator'),
        });
        group.add(row);

        // Create a settings object and bind the row to the `show-indicator` key
        window._settings = this.getSettings();
        window._settings.bind('show-indicator', row, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
