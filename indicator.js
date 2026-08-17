import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import GObject from 'gi://GObject'
import St from 'gi://St';

export const NightShiftIndicator = GObject.registerClass(
  class NightShiftIndicator extends PanelMenu.Button {
    constructor() {
      super(1.5, "NightShiftIndicator");

      let icon = new St.Icon({
        icon_name: 'system-run-symbolic',
        style_class: 'system-status-icon'
      });

      this.add_child(icon);
  }
});
