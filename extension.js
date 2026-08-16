/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { NightShiftIndicator } from './indicator.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
const configDir = GLib.get_user_config_dir(); // $HOME/.config
const homeDir = GLib.get_home_dir(); // /$HOME

const localDir = GLib.get_user_data_dir(); // $HOME/.local/share
const cacheDir = GLib.get_user_cache_dir(); // $HOME/.cache
const systemdUserDir = GLib.build_filenamev([localDir, 'systemd', 'user']);

const units = [
  'get-sunrise-sunset.timer',
  'get-sunrise-sunset.service',
  'night-shift.timer',
  'night-shift.service',
  'auto-update-perf-mode.service',
  'auto-update-perf-mode.path'
]

// Gio required to be wrapped in promisify for async/await to work https://gjs.guide/guides/gio/file-operations.html
Gio._promisify(
  Gio.File.prototype,
  'make_symbolic_link_async',
  'make_symbolic_link_finish',
  'delete_async',
  'delete_finish'
);

export default class NightShiftExtension extends Extension {

    enable() {
      this._createAndStartServices()
      this._indicator = new NightShiftIndicator()
      this._settings = this.getSettings()

      Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'right');
      this._settings.bind('show-indicator', this._indicator, 'visible', Gio.SettingsBindFlags.DEFAULT);
    }

    disable() {
      if(this._indicator) {
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
      }

      this.disableServices()

    }

    async disableServices() {
      try {
        for(const unit of units) {
          const pathToUnit = GLib.build_filenamev([systemdUserDir, unit]);
          const linkFile = Gio.File.new_for_path(pathToUnit);
          await this.removeFile(linkFile)
        }

          //Stop and disable services
          log('[night-shift] EXEC systemctl --user daemon-reload')
          GLib.spawn_command_line_async('systemctl --user daemon-reload')

          log('[night-shift] EXEC get-sunrise-sunset.timer')
          GLib.spawn_command_line_async('systemctl --user disable --now get-sunrise-sunset.timer')

          log('[night-shift] EXEC night-shift.timer')
          GLib.spawn_command_line_async('systemctl --user disable--now night-shift.timer')

          log('[night-shift] EXEC auto-update-perf-mode.service')
          GLib.spawn_command_line_async('systemctl --user disable --now auto-update-perf-mode.path') // Do I need to also enable the path?
          GLib.spawn_command_line_async('systemctl --user disable --now auto-update-perf-mode.service')
        } catch (e) {
          console.error(`Error: [night-shift] disableServices ${e}`)
        }
      }

    async removeFile(file) {
      if(file.query_exists(null)) {
        await file.delete_async(GLib.PRIORITY_DEFAULT, null)
        const basename = file.get_basename();
        log(`[night-shift] DELETED ${basename}`)
        };
    }


    async _createAndStartServices() {
        const extensionDir = `${localDir}/gnome-shell/extensions/night-shift@christophermca.github.io`
        const appCacheDir = `${cacheDir}/night-shift/`


        GLib.mkdir_with_parents(extensionDir, 0o700);
        GLib.mkdir_with_parents(appCacheDir, 0o700);
        GLib.mkdir_with_parents(systemdUserDir, 0o700);


        //Systemd units
        try {
          async function createSymbolicLink() {
            for(const unit of units) {
              const pathToUnit = GLib.build_filenamev([systemdUserDir, unit]);
              const linkFile = Gio.File.new_for_path(pathToUnit);
              const target = `${extensionDir}/units/${unit}`;
              const fileName = linkFile.get_basename();

              await this.removeFile(linkFile);
              await linkFile.make_symbolic_link_async(
                target,
                GLib.PRIORITY_DEFAULT,
                null, // Cancellable
                (source, result) => {
                  const success = linkFile.make_symbolic_link_finish(result)
                  console.log(`[night-shift] SYMLINK ${fileName}`)
                });
            }
          }

        await createSymbolicLink.call(this).then(() => {

          log('[night-shift] EXEC systemctl --user daemon-reload')
          GLib.spawn_command_line_async('systemctl --user daemon-reload')

          log('[night-shift] EXEC get-sunrise-sunset.timer')
          GLib.spawn_command_line_async('systemctl --user enable --now get-sunrise-sunset.timer')

          log('[night-shift] EXEC night-shift.timer')
          GLib.spawn_command_line_async('systemctl --user enable --now night-shift.timer')

          log('[night-shift] EXEC auto-update-perf-mode.path')
          GLib.spawn_command_line_async('systemctl --user enable --now auto-update-perf-mode.path') // Do I need to also enable the path?
          log('[night-shift] EXEC auto-update-perf-mode.service')
          GLib.spawn_command_line_async('systemctl --user enable --now auto-update-perf-mode.service')

          log('~~~[night-shift] DONE~~~~')
        });

      } catch (e) {
        console.error(e, '[night-shift] Failed to create and start services');
      }
    }

  }
