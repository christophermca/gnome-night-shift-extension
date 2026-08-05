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

// const STATE_FOLDER = "~/.local/state/gnome-night-shift/"
// const SCHEMA = "org.gnome.settings-daemon.plugins.color"
// const KEY = "night-light-last-coordinates"

let configDir = GLib.get_user_config_dir(); // $HOME/.config
let homeDir = GLib.get_home_dir(); // /$HOME
let localDir = GLib.get_user_data_dir(); // $HOME/.local/share

export default class PlainExampleExtension extends Extension {
    constructor(metadata) {
      super(metadata)

      this.systemDir = GLib.build_filenamev([localDir, 'systemd', 'user'])
    }

    enable() {
      // enable get-sunrise-sunset.timer gnome-night-shift.timer
      // auto-update-gnome-theme
      log('[night-shift] hello world');
      this._createAndStartServices().then(() => true)
    }

    disable() {
      // should remove service
      log('[night-shift] goodnight world');
    }

  _removeService() {
    // this._runSystemdCommand(['systemctl', '--user', 'disable', '--now', 'get-sunrise-sunset.timer'])


  }

  async _createAndStartServices() {
      let extensionDir = `${localDir}/gnome-shell/extensions/night-shift@christophermca.github.io`

      let stateDir = GLib.build_filenamev([localDir, 'state', 'gnome-night-shift'])

      // log('[night-shift] creating folders');
      GLib.mkdir_with_parents(this.systemDir, 0o700);
      GLib.mkdir_with_parents(stateDir, 0o700);
      // log('[night-shift] DONE creating folders~~~~');

     /**
      * TODO
      *
      * # 1
      * - Create a get-sunrise-sunset timer
      * - Create a get-sunrise-sunset service
      * #2
      * - Create gnome night-shift timer
      * - Create gnome night-shift timer
      * #3
      * - Create auto-update-gnome-theme.path
      * - Create auto-update-gnome-theme.service
      **/



      // let service = `[Unit]
      // Description=Gets local sunrise and sunset times
      // Wants=display-manager.service
      // After=geoclue.service network-online.target graphical-session.target

      // [Service]
      // Type=oneshot
      // StateDirectory=gnome-night-shift
      // ExecStart=/usr/bin/echo "mark me"

      // Restart=no`;

      // let timer = `[Unit]
      // Description=timer gnome-night-shift
      // Wants=network-online.target geoclue.service
      // After=network-online.target

      // [Timer]
      // OnCalendar=*-*-* *:*:00
      // OnActiveSec=0
      // Persistent=true
      // Unit=test.service

      // [Install]
      // WantedBy=timers.target`;



      //Build services
      try {

        // let getSunriseSunsetService = GLib.build_filenamev([this.systemDir, 'test.service']);
        // GLib.file_set_contents(getSunriseSunsetService, service.replace(/^\/s+/gm,'').trim());

        // let getSunriseSunsetTimer = GLib.build_filenamev([this.systemDir, 'get-sunrise-sunset.timer']);
        // GLib.file_set_contents(getSunriseSunsetTimer, timer.replace(/^\/s+/gm,'').trim());
        /*
         * Check if file already exists
         */

        async function createSymbolicLink() {
          let linkPath = `${localDir}/systemd/user/`
          let units = ['get-sunrise-sunset.timer', 'get-sunrise-sunset.service']
          let targetDir = './units'

          try {
            for(const unit of units) {
              console.log(`[night-shift] ${unit}`)
              let fullPath = GLib.build_filenamev([linkPath, unit])
              const file = Gio.File.new_for_path(fullPath)
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

      await createSymbolicLink()

      GLib.spawn_command_line_async('systemctl --user daemon-reload')
      log('[night-shift] RAN systemctl --user daemon-reload')
      GLib.spawn_command_line_async('systemctl --user enable get-sunrise-sunset.timer')
      GLib.spawn_command_line_async('systemctl --user start get-sunrise-sunset.timer')
      log('[night-shift] started get-sunrise-sunset timer')

      // setSessionVariablesNightShift()
      log('~~~[night-shift] done~~~~')
    } catch (e) {
      console.error(e, '[night-shift] try/catch');
    }
  }


    _runSystemdCommand(argv) {
      try {
        let proc = Gio.Subprocess.new(
          argv,
          Gio.SubprocessFlags.NONE
        );
        proc.init(null)
        log(`Successfully ran: ${argv.join(' ')}`);
      } catch (e) {
        console.error(e, 'Failed to run systemd command: `${argv.join(\' \')}`');
      }
    }
  }
