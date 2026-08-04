/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
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
import {setSessionVariablesNightShift} from './getSunriseSunset.js';

// const STATE_FOLDER = "~/.local/state/gnome-night-shift/"
// const SCHEMA = "org.gnome.settings-daemon.plugins.color"
// const KEY = "night-light-last-coordinates"

export default class PlainExampleExtension extends Extension {
    enable() {
      // enable get-sunrise-sunset.timer gnome-night-shift.timer
      // auto-update-gnome-theme
      log('[night-shift] hello world');
      this._createAndStartServices();
    }

    disable() {
      // should remove service
      log('[night-shift] goodnight world');
    // this._runSystemdCommand(['systemctl', '--user', 'disable', '--now', 'get-sunrise-sunset.timer'])
    }

  _createAndStartServices() {
    let configDir = GLib.get_user_config_dir();
    let localDir = GLib.get_user_data_dir();

    let stateDir = GLib.build_filenamev([localDir, 'state', 'gnome-night-shift'])
    let systemDir = GLib.build_filenamev([configDir, 'systemd', 'user'])

    GLib.mkdir_with_parents(systemDir, 0o700);
    GLib.mkdir_with_parents(stateDir, 0o700);

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



    let service = `[Unit]
    Description=Gets local sunrise and sunset times
    Wants=display-manager.service
    After=geoclue.service network-online.target graphical-session.target

    [Service]
    Type=oneshot
    StateDirectory=gnome-night-shift
    ExecStart=/usr/bin/echo "mark me"

    Restart=no`;

    let timer = `[Unit]
    Description=timer gnome-night-shift
    Wants=network-online.target geoclue.service
    After=network-online.target

    [Timer]
    OnCalendar=*-*-* *:*:00
    OnActiveSec=0
    Persistent=true
    Unit=test.service

    [Install]
    WantedBy=timers.target`;



    //Build services
    let getSunriseSunsetService = GLib.build_filenamev([systemDir, 'test.service']);
    GLib.file_set_contents(getSunriseSunsetService, service.replace(/^\/s+/gm,'').trim());

    let getSunriseSunsetTimer = GLib.build_filenamev([systemDir, 'get-sunrise-sunset.timer']);
    GLib.file_set_contents(getSunriseSunsetTimer, timer.replace(/^\/s+/gm,'').trim());


    this._runSystemdCommand(['systemctl', '--user', 'daemon-reload'])
    this._runSystemdCommand(['systemctl', '--user', 'enable', 'get-sunrise-sunset.timer'])
    this._runSystemdCommand(['systemctl', '--user', 'start',  'get-sunrise-sunset.timer'])

    // setSessionVariablesNightShift()
    console.log('[night-shift] find me')
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
