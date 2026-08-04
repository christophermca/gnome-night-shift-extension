import Gio from 'gi://Gio';


function setSessionVariablesNightShift() {
    // try {
    //     // GET location
    //     // collects data from gsettings

  const getLocation = Gio.Subprocess.new([
    '/usr/lib/geoclue-2.0/demos/agent',
    '&',
    '/usr/lib/geoclue-2.0/demos/where-am-i'], Gio.SubprocessFlags.NONE);

        console.log('[night-shift]', getLocation)
        // return getLocation
        // const value = subprocess.run(
        //     ["gsettings", "get", schema, key],
        //     text=True,
        //     check=True,
        //     capture_output=True,
        // )

        // val = value.stdout
        // result = ast.literal_eval(val)
        // lat, lng = result

        // GET sunrise and sunset times.
        // const noaa_url = "https://api.sunrise-sunset.org/v2"
        // const params = {"lat": lat, "lng": lng}

        // # Handle response
        // const response = requests.get(noaa_url, params).json()
        // const sunrise = datetime.fromisoformat(response["sunrise"]).strftime("%H:%M")
        // const sunset = datetime.fromisoformat(response["sunset"]).strftime("%H:%M")

        // console.log({"sunrise": sunrise, "sunset": sunset})

        // const times = [sunset, sunrise]

        // let state_file = Path.expanduser(Path(STATE_FOLDER, "times"))
        // with state_file.open("w", encoding="utf-8") as file:
        //     file.write(",".join(times))

      // }
    // catch(e) {
      // subprocess.CalledProcessError:
        // print(f"Error: Cound not retrieve {key} from {schema}")
        // return None
    // }
}
export {setSessionVariablesNightShift}
