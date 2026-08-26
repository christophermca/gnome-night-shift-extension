import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GObject from 'gi://GObject'
import St from 'gi://St';
import Gio from 'gi://Gio';

export const NightShiftIndicator = GObject.registerClass(
  class NightShiftIndicator extends PanelMenu.Button {
    constructor(settings) {
      super(0.0, "NightShift");
      this._settings = settings;

      let icon = new St.Icon({
        icon_name: 'view-mirror-symbolic.svg',
        style_class: 'system-status-icon',
      });

      this.add_child(icon);

      this._dataItem  = new PopupMenu.PopupMenuItem('Timezone', {reactive: false, can_focus: false, activate: false  });
      this._dataItem2 = new PopupMenu.PopupImageMenuItem('Loading data...', 'daytime-sunrise-symbolic',{reactive: false, can_focus: false, activate: false  });
      this._dataItem3 = new PopupMenu.PopupImageMenuItem('Loading data...', 'daytime-sunset-symbolic',{reactive: false, can_focus: false, activate: false  });

      const tzid = this._settings.get_string('tzid')
      const [sunrise, sunset] = this._settings.get_string('times')?.split(',')

      this._settings.bind('show-indicator', this, 'visible', Gio.SettingsBindFlags.DEFAULT);
      this._settings.bind('tzid', this.header.label, 'text', Gio.SettingsBindFlags.GET);
      this._settings.bind('times', this.sunrise.label, 'text', Gio.SettingsBindFlags.GET);

      this._updateTimesId = this._settings.connect('changed::times', (set, key) => {
        let updatedTimes = set.get_string(key)
        const [sunrise, sunset] = updatedTimes.split(',')
        this.sunrise.label.text = `${sunrise}`;
        this.sunset.label.text  = `${sunset}`;
        log(`night-shift ${newvalue}`);
      });

      this.menu.addMenuItem(this._dataItem);
      this.menu.addMenuItem(this._dataItem2);
      this.menu.addMenuItem(this._dataItem3);
    }

    get header() {
      return this._dataItem
    }

    get sunrise() {
      return this._dataItem2
    }

    get sunset() {
      return this._dataItem3
    }
});
