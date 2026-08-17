import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GObject from 'gi://GObject'
import St from 'gi://St';
import Gio from 'gi://Gio';

export const NightShiftIndicator = GObject.registerClass(
  class NightShiftIndicator extends PanelMenu.Button {
    constructor() {
      super(1.5, "NightShiftIndicator");

      let icon = new St.Icon({
        icon_name: 'view-mirror-symbolic.svg',
        style_class: 'system-status-icon',
      });

      this.add_child(icon);

      this._dataItem = new PopupMenu.PopupMenuItem('Loading data...', {
        activate:false,
        reactive:true,
        hover:true,
      });

      this.menu.addMenuItem(this._dataItem);
  }
});
