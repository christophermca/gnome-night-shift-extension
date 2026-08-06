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
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const configDir = GLib.get_user_config_dir(); // $HOME/.config
const homeDir = GLib.get_home_dir(); // /$HOME
const localDir = GLib.get_user_data_dir(); // $HOME/.local/share
const cacheDir = GLib.get_user_cache_dir(); // $HOME/.cache

export default class PlainExampleExtension extends Extension {

    enable() {
      this._createAndStartServices().catch((e) => console.log(`[night-shift] ${e}`))
    }

    disable() {
      // should remove service
      log('[night-shift] goodnight world');
    }

  _removeService() {
    // clean up files
  }

  async _createAndStartServices() {
      const extensionDir = `${localDir}/gnome-shell/extensions/night-shift@christophermca.github.io`
      const appCacheDir = `${cacheDir}/night-shift/`


      GLib.mkdir_with_parents(extensionDir, 0o700);
      GLib.mkdir_with_parents(appCacheDir, 0o700);

     /**
      * TODO
      * #3
      * - Create auto-update-gnome-theme.path
      * - Create auto-update-gnome-theme.service
      **/

      //Systemd units
      try {

        async function createSymbolicLink() {
          const linkPath = `${localDir}/systemd/user/`
          const targetDir = './units'
          const units = [
            'get-sunrise-sunset.timer',
            'get-sunrise-sunset.service',
            'night-shift.timer',
            'night-shift.service',
            'auto-update-perf-mode.service',
            'auto-update-perf-mode.path'

          ]

          try {
            for(const unit of units) {
              const fullPath = GLib.build_filenamev([linkPath, unit])
              const file = Gio.File.new_for_path(fullPath)
              console.log('night-shift',  file)
              if(file.query_exists(null)) {
                file.delete(null)
              }
              await file.make_symbolic_link(`${extensionDir}/${targetDir}/${unit}`, null)
              log(`[night-shift] symlinked ${unit}`)
            }
          } catch (e) {
            console.error(e, '[night-shift]failed to create timer')
            return false
          }

        }

        await createSymbolicLink().catch((e) => console.log(`[night-shift] ${e}`))

      GLib.spawn_command_line_async('systemctl --user daemon-reload')
      log('[night-shift] EXEC systemctl --user daemon-reload')

      GLib.spawn_command_line_async('systemctl --user enable --now get-sunrise-sunset.timer')
      GLib.spawn_command_line_async('systemctl --user enable --now night-shift.timer')
      GLib.spawn_command_line_async('systemctl --user enable --now auto-update-perf-mode.path') // Do I need to also enable the path?
      GLib.spawn_command_line_async('systemctl --user enable --now auto-update-perf-mode.service')
      log('[night-shift] EXEC get-sunrise-sunset timer')

      log('~~~[night-shift] DONE~~~~')
    } catch (e) {
      console.error(e, '[night-shift] try/catch');
    }
  }


  }
