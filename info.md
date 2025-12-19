# Weather Overlay for Home Assistant

Fullscreen animated weather effects that automatically react to your weather entity - just like Winter Mode, but for ALL weather conditions!

## ✨ Features

- **11 Weather Animations**: Rain, heavy rain, clouds, partly cloudy, fog, lightning, lightning+rain, snow, mixed precipitation, stars, and sunny glow
- **Automatic**: Changes based on your weather entity state
- **Toggle Control**: Easy on/off switch
- **Test Mode**: Preview any effect instantly
- **Non-Intrusive**: Click-through fullscreen overlay
- **Smooth Performance**: 60fps canvas animations
- **Universal**: Works with any Home Assistant weather integration

## 🎨 Weather Effects

| Effect | Description |
|--------|-------------|
| 🌧️ Rain | 150 falling raindrops |
| ⛈️ Heavy Rain | 300 heavy raindrops |
| ☁️ Cloudy | 25 large drifting clouds |
| ⛅ Partly Cloudy | 15 light clouds |
| 🌫️ Fog | Dense mist particles |
| ⚡ Lightning | Ambient flashes (no bolts) |
| ⛈️ Lightning + Rain | Combined effect |
| ❄️ Snow | Falling snowflakes |
| 🌨️ Mixed | Snow and rain |
| 🌙 Clear Night | 200 twinkling stars in 4 drifting groups |
| ☀️ Sunny | Warm golden glow with sun circle |
| ⚪ Hail | 5 falling hailstones |

## 📋 Requirements

- Home Assistant (2023.x or newer)
- Any weather integration (Met.no, OpenWeatherMap, Pirate Weather, etc.)
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Installation

1. Install via HACS
2. Add to configuration.yaml:
```yaml
frontend:
  extra_module_url:
    - /hacsfiles/weather-overlay/weather-overlay.js

homeassistant:
  packages: !include_dir_named packages
```
3. Copy package file to `/config/packages/`
4. Edit weather entity name in the JS file
5. Restart Home Assistant
6. Add control card to dashboard

See full installation guide in the repository!

## 🎮 Usage

Once installed:
- Toggle "Enable Overlay" to turn animations on/off
- Use dropdown to test different weather effects
- Set to "Use Real Weather" for automatic mode

## 📸 Screenshots

See the repository for demo video and screenshots!

## 🆘 Support

Full documentation, troubleshooting guide, and examples in the [GitHub repository](https://github.com/mzuniga51/weather-overlay).

---

**Inspired by Home Assistant's Winter Mode** ❄️⚡🌧️☀️
