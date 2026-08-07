# 🌙 Night Shift - GNOME Extension

Night Shift is a GNOME Shell extension that automatically switches your desktop between **Day** and **Night** modes (Light and Dark themes). Instead of manually changing appearance settings, the extension detects whether it is currently day or night at your location and applies the appropriate mode automatically.

The extension is designed for users who prefer a light desktop during the day and a dark desktop after sunset, providing a seamless transition throughout the day.

## ✨ Features

- 🌅 Automatically switch between **Day** (Light) and **Night** (Dark) modes
- 📍 Uses sunrise and sunset times for your location
- 🔄 Seamless integration with GNOME Shell
- ⚡ Lightweight and easy to configure
- 🌐 Location-based detection via Geoclue

## 🔧 How It Works

Night Shift relies on **Geoclue 2.0** and the **NOAA API** to determine whether the sun is currently above or below the horizon at your location:

1. Your geographic location is determined from Geoclue
2. The location is passed to the NOAA API
3. Night Shift determines when to activate **Day** or **Night** mode based on sunrise/sunset times

## 📋 Requirements

- GNOME Shell 40+
- Geoclue 2.0
- Internet connection (for NOAA API queries)

## 📦 Installation

### Via GNOME Extensions (Recommended)

[Add link to extensions.gnome.org when published]

### Manual Installation

1. Clone or download the repository as a zip file
2. Install using the GNOME Extensions manager:
   ```bash
   gnome-extensions install <path-to-zip>
   ```
3. Enable the extension in GNOME Settings or Extensions app
4. Ensure location services are enabled in GNOME Settings (GNOME uses Geoclue 2.0 for location detection)

## 🚀 Usage

Once installed and enabled:

1. The extension automatically detects your location
2. It monitors sunrise and sunset times
3. Your desktop automatically switches to Light mode at sunrise
4. Your desktop automatically switches to Dark mode at sunset

## ⚙️ Configuration

Currently, Night Shift operates automatically with no manual configuration required. The extension:
- Automatically detects your location using Geoclue
- Fetches sunrise/sunset times from the NOAA API
- Switches your theme at the appropriate times

## 🐛 Troubleshooting

- **Extension not switching themes**: Ensure Geoclue is running and location services are enabled
- **Location not detected**: Check that location services are enabled in GNOME Settings
- **API errors**: Verify your internet connection and NOAA API availability

## 📝 License

GNU General Public License v3.0 - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📧 Support

Found a bug or have a feature request? Please open an [issue](https://github.com/christophermca/gnome-night-shift-extension/issues) on GitHub. For security concerns, please contact the maintainer directly.
