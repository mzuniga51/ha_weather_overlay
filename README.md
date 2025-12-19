# Weather Overlay for Home Assistant 🌦️

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/mzuniga51/weather-overlay.svg)](https://github.com/mzuniga51/weather-overlay/releases)
[![License](https://img.shields.io/github/license/mzuniga51/weather-overlay.svg)](LICENSE)

> **Note**: Replace `mzuniga51` with your actual GitHub username throughout this repository.

Fullscreen animated weather effects that automatically change based on your weather entity - inspired by Home Assistant's Winter Mode, but for all weather conditions!

## 🎬 Demo

<!-- Add your screenshots/GIFs here -->
<!-- ![Rain Effect](screenshots/rain.gif) -->
<!-- ![Stars Effect](screenshots/stars.gif) -->
<!-- ![Lightning Effect](screenshots/lightning.gif) -->

[**▶️ View Live Demo**](examples/weather-canvas-demo.html) - Download and open in your browser!

## ✨ Features

- **11 Weather Animations**
  - 🌧️ Rain (150 particles)
  - ⛈️ Heavy Rain (300 particles)
  - ☁️ Cloudy (25 drifting clouds)
  - ⛅ Partly Cloudy (15 lighter clouds)
  - 🌫️ Fog (dense mist)
  - ⚡ Lightning (ambient flashes only - no visible bolts)
  - ⛈️ Lightning + Rain (combined effect)
  - ❄️ Snow (100 falling snowflakes)
  - 🌨️ Snowy-Rainy (150 mixed precipitation)
  - 🌙 Clear Night (200 twinkling stars in 4 drifting groups)
  - ☀️ Sunny (warm golden glow with sun circle)
  - ⚪ Hail ( falling hailstones)

- **Smart Controls**
  - Toggle on/off anytime
  - Test selector to preview any effect
  - Automatic mode follows your weather entity
  
- **Seamless Integration**
  - Fullscreen overlay - covers entire dashboard
  - Click-through - interact with dashboard normally
  - Works on all Home Assistant themes
  - Compatible with any weather integration

- **Performance**
  - Smooth 60fps animations
  - Low CPU usage
  - Mobile-friendly

## 📦 Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend**
3. Click the **+** button
4. Search for **"Weather Overlay"**
5. Click **Install**
6. Follow the setup steps below

### Manual Installation

1. Download `weather-overlay.js` from the [latest release](https://github.com/mzuniga51/weather-overlay/releases)
2. Copy it to `/config/www/weather-overlay.js`
3. Follow the setup steps below

## ⚙️ Setup

### Step 1: Enable Packages

Add to your `configuration.yaml`:
```yaml
homeassistant:
  packages: !include_dir_named packages
```

Create the folder if it doesn't exist:
```bash
mkdir /config/packages
```

### Step 2: Install Helper Package

Copy `packages/weather_overlay.yaml` to `/config/packages/`

This creates:
- `input_boolean.weather_overlay` - Toggle switch
- `input_select.weather_overlay_test` - Effect selector

### Step 3: Load JavaScript

Add to `configuration.yaml`:
```yaml
frontend:
  extra_module_url:
    - /hacsfiles/weather-overlay/weather-overlay.js  # If installed via HACS
    # - /local/weather-overlay.js  # If installed manually
```

### Step 4: Configure Weather Entity

Edit `weather-overlay.js` (line 7) or `/hacsfiles/weather-overlay/weather-overlay.js`:
```javascript
const WEATHER_ENTITY = 'weather.home';  // Change to YOUR weather entity
```

Find your weather entity:
1. Go to **Developer Tools** → **States**
2. Search for "weather"
3. Copy the entity ID (e.g., `weather.pirateweather`, `weather.openweathermap`)

### Step 5: Add Dashboard Card

Copy contents of `examples/dashboard_card.yaml` to a new card on your dashboard:

```yaml
type: entities
title: Weather Overlay Controls
entities:
  - entity: input_boolean.weather_overlay
    name: Enable Overlay
  - entity: input_select.weather_overlay_test
    name: Test Effect
```

### Step 6: Restart

Restart Home Assistant:
- **Settings** → **System** → **Restart**

### Step 7: Clear Browser Cache

Important! Clear your browser cache:
- **Ctrl+Shift+R** (Windows/Linux)
- **Cmd+Shift+R** (Mac)

## 🎮 Usage

1. **Turn on the toggle** - "Enable Overlay"
2. **Select an effect** from the dropdown:
   - Choose "Use Real Weather" for automatic mode
   - Or select a specific effect to test it
3. **Watch the magic!** ✨

## 🎨 Supported Weather States

Works automatically with these weather entity states:

| State | Pirate Weather | Met.no | OpenWeatherMap | MeteoSwiss |
|-------|----------------|--------|----------------|-------------|
| `rainy` | ✅ | ✅ | ✅ | ✅ |
| `pouring` | ✅ | ✅ | ✅ | ✅ |
| `cloudy` | ✅ | ✅ | ✅ | ✅ |
| `partlycloudy` | ✅ | ✅ | ✅ | ✅ |
| `fog` | ✅ | ✅ | ✅ | ✅ |
| `lightning` | ✅ | ✅ | ✅ | ✅ |
| `lightning-rainy` | ✅ | ✅ | ✅ | ✅ |
| `snowy` | ✅ | ✅ | ✅ | ✅ |
| `snowy-rainy` | ✅ | ✅ | ✅ | ✅ |
| `clear-night` | ✅ | ✅ | ✅ | ✅ |
| `sunny` | ✅ | ✅ | ✅ | ✅ |
| `hail` | - | - | - | ✅ |

Other states (like `windy`) will show no animation.

## 🔧 Customization

Edit `weather-overlay.js` to customize:

**Dashboard Filtering** (line 18):
```javascript
const ENABLED_DASHBOARDS = [];  // Empty = show on all dashboards
// Or specify dashboards:
const ENABLED_DASHBOARDS = ['lovelace', 'mobile'];  // Only these dashboards
```
See [Dashboard Filtering Guide](docs/DASHBOARD_FILTERING.md) for details.

**Particle Count** (lines 27-115):
```javascript
'rainy': {
  maxParticles: 150,  // Change to 200 for more rain
  // ...
}
```

**Colors**:
```javascript
color: 'rgba(174, 194, 224, 0.7)',  // Adjust RGBA values
```

**Animation Speed**:
```javascript
speedMin: 15,
speedMax: 25,  // Adjust speed range
```

**Star Drift** (lines 160-180):
```javascript
this.driftSpeed = 0.0003;  // Increase for faster drift
```

**Lightning Frequency** (line 504):
```javascript
lightningInterval = 1500 + Math.random() * 2500;  // Milliseconds between flashes
```

## 🐛 Troubleshooting

### Effects not showing?
1. Check browser console (F12) for errors
2. Verify toggle is ON
3. Confirm weather entity name is correct
4. Clear browser cache (Ctrl+Shift+R)
5. Try test selector to force an effect

### Some effects work, others don't?
- Make sure you downloaded the latest version
- Clear browser cache completely
- Check console for JavaScript errors

### Canvas not visible?
```javascript
// Check in browser console:
document.getElementById('weather-overlay-canvas')
// Should return: <canvas id="weather-overlay-canvas" ...>
```

**See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed debugging steps.**

## 📁 Repository Structure

```
weather-overlay/
├── dist/
│   └── weather-overlay.js          # Main JavaScript file
├── packages/
│   └── weather_overlay.yaml        # Helper entities package
├── examples/
│   ├── dashboard_card.yaml         # Example control card
│   └── weather-canvas-demo.html    # Standalone demo
├── docs/
│   ├── INSTALLATION.md             # Detailed setup guide
│   └── TROUBLESHOOTING.md          # Debugging help
├── README.md                       # This file
├── info.md                         # HACS description
└── hacs.json                       # HACS metadata
```

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest new weather effects
- Submit pull requests
- Share screenshots/videos

## 📝 To-Do / Ideas

- [x] Add hail effect
- [ ] Add tornado/extreme wind effect
- [ ] Add customization UI (instead of editing JS)
- [ ] Add seasonal effects (autumn leaves, etc.)
- [ ] Performance mode for slower devices
- [ ] Add rainbow effect for post-rain

## 📄 License

MIT License - feel free to use, modify, and share!

## 🙏 Credits

- Inspired by Home Assistant's **Winter Mode** feature
- Canvas animation techniques from various open-source projects
- Thanks to the Home Assistant community!

## ⭐ Support

If you like this project:
- ⭐ Star it on GitHub
- 🐛 Report issues
- 💡 Suggest features
- 📣 Share with others!

## 📊 Stats

<!-- Badges will auto-update once repository is public -->
![GitHub stars](https://img.shields.io/github/stars/mzuniga51/weather-overlay)
![GitHub forks](https://img.shields.io/github/forks/mzuniga51/weather-overlay)
![GitHub issues](https://img.shields.io/github/issues/mzuniga51/weather-overlay)

---

**Made with ❤️ for the Home Assistant community**

Enjoy your weather effects! 🌦️⚡❄️☀️🌙
