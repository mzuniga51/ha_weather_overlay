// Weather Overlay for Home Assistant
// Fullscreen canvas weather animations based on weather entity state
// Version 2.0 - Improved defaults and debugging
(function() {
  'use strict';
  
  // ============================================
  // CONFIGURATION - Edit these values as needed
  // ============================================
  
  // Your weather entity (REQUIRED - change this to match your setup)
  // Examples: 'weather.home', 'weather.openweathermap', 'weather.accuweather'
  const WEATHER_ENTITY = 'weather.home';
  
  // Optional: Toggle to enable/disable overlay (set to '' to disable this feature)
  // If the entity doesn't exist, overlay will always be enabled
  const TOGGLE_ENTITY = 'input_boolean.weather_overlay';
  
  // Optional: Test selector for different weather states (set to '' to disable)
  // Useful for testing different weather effects
  const TEST_ENTITY = 'input_select.weather_overlay_test';
  
  // How often to check weather (in milliseconds)
  const UPDATE_INTERVAL = 5000;
  
  // Optional: Rain sensor for cross-checking (set to '' to disable)
  // If your weather service reports false rain, this sensor can verify
  const RAIN_SENSOR_ENTITY = ''; // e.g., 'sensor.rain_gauge' or 'sensor.hydrawise_rain'
  const REQUIRE_RAIN_CONFIRMATION = false; // Set to true to require rain sensor confirmation
  
  // Dashboard filtering
  // [] = Show on ALL dashboards (recommended for most users)
  // ['lovelace'] = Only on default dashboard
  // ['home', 'weather'] = Only on specific dashboards
  const ENABLED_DASHBOARDS = []; // Empty = ALL dashboards
  
  // Debug mode - set to true to see detailed logs in browser console
  const DEBUG_MODE = true;
  
  // ============================================
  // END CONFIGURATION
  // ============================================
  
  // Logging helper
  function log(message, data = null) {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[Weather Overlay] ${message}`, data);
      } else {
        console.log(`[Weather Overlay] ${message}`);
      }
    }
  }
  
  function warn(message, data = null) {
    if (data) {
      console.warn(`[Weather Overlay] ⚠️ ${message}`, data);
    } else {
      console.warn(`[Weather Overlay] ⚠️ ${message}`);
    }
  }
  
  function error(message, data = null) {
    if (data) {
      console.error(`[Weather Overlay] ❌ ${message}`, data);
    } else {
      console.error(`[Weather Overlay] ❌ ${message}`);
    }
  }
  
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationId = null;
  let currentWeather = null;
  let lastUpdateTime = 0;
  let lightningTimer = 0;
  let lightningInterval = 1500 + Math.random() * 2500;
  let showLightning = false;
  let lightningDuration = 0;
  let lightningBrightness = 0;
  let lightningFadeSpeed = 0;
  let initializationComplete = false;
  
  // Weather particle configurations
  const weatherConfigs = {
    'rainy': {
      maxParticles: 50,
      color: 'rgba(174, 194, 224, 0.35)',
      speedMin: 15,
      speedMax: 25,
      sizeMin: 1,
      sizeMax: 2,
      swayAmount: 0.5,
      type: 'rain'
    },
    'pouring': {
      maxParticles: 50,
      color: 'rgba(174, 194, 224, 0.35)',
      speedMin: 10.5,
      speedMax: 17.5,
      sizeMin: 1,
      sizeMax: 2,
      swayAmount: 0.5,
      type: 'rain',
      lengthMultiplier: 4
    },
    'cloudy': {
      maxParticles: 10,
      color: 'rgba(180, 180, 180, 0.10)',
      speedMin: 0.3,
      speedMax: 0.8,
      sizeMin: 80,
      sizeMax: 150,
      swayAmount: 0.5,
      type: 'clouds'
    },
    'partlycloudy': {
      maxParticles: 6,
      color: 'rgba(200, 200, 200, 0.08)',
      speedMin: 0.4,
      speedMax: 1,
      sizeMin: 70,
      sizeMax: 130,
      swayAmount: 0.6,
      type: 'clouds'
    },
    'fog': {
      maxParticles: 70,
      color: 'rgba(220, 220, 220, 0.05)',
      speedMin: 0.2,
      speedMax: 0.4,
      sizeMin: 1000,
      sizeMax: 2000,
      swayAmount: 0.5,
      type: 'fog'
    },
    'snowy': {
      maxParticles: 40,
      color: 'rgba(255, 255, 255, 0.4)',
      speedMin: 2,
      speedMax: 5,
      sizeMin: 2,
      sizeMax: 5,
      swayAmount: 1.5,
      type: 'snow'
    },
    'snowy-rainy': {
      maxParticles: 50,
      color: 'rgba(200, 210, 230, 0.35)',
      speedMin: 8,
      speedMax: 15,
      sizeMin: 1.5,
      sizeMax: 4,
      swayAmount: 1,
      type: 'mixed'
    },
    'lightning': {
      maxParticles: 0,
      type: 'lightning'
    },
    'lightning-rainy': {
      maxParticles: 50,
      color: 'rgba(174, 194, 224, 0.35)',
      speedMin: 15,
      speedMax: 25,
      sizeMin: 1,
      sizeMax: 2,
      swayAmount: 0.5,
      type: 'rain',
      hasLightning: true
    },
    'clear-night': {
      maxParticles: 36,
      type: 'stars'
    },
    'sunny': {
      maxParticles: 0,
      type: 'sunny'
    },
    // Additional states for compatibility
    'windy': {
      maxParticles: 6,
      color: 'rgba(200, 200, 200, 0.06)',
      speedMin: 2,
      speedMax: 4,
      sizeMin: 70,
      sizeMax: 130,
      swayAmount: 0.6,
      type: 'clouds'
    },
    'hail': {
        maxParticles: 5,
        color: 'rgba(255, 255, 255, 0.4)',
        speedMin: 20,
        speedMax: 30,
        sizeMin: 5,
        sizeMax: 8,
        swayAmount: 0.2,
        type: 'hail'
    },
    'exceptional': {
      maxParticles: 0,
      type: 'sunny'
    }
  };
  
  // Particle class
  class Particle {
    constructor(config) {
      this.reset(config);
      if (config.type === 'stars') {
        this.y = Math.random() * (window.innerHeight * 0.5);
        this.twinkleSpeed = 0.02 + Math.random() * 0.03;
        this.twinklePhase = Math.random() * Math.PI * 2;
      } else {
        this.y = Math.random() * window.innerHeight;
      }
    }
    
    reset(config) {
      this.x = Math.random() * window.innerWidth;
      
      if (config.type === 'stars') {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * (window.innerHeight * 0.3);
        this.size = 1 + Math.random() * 1.5;
        this.phase = Math.random() * 6;
        this.cycleLength = 6;
        this.opacity = 0;
      } else {
        if (config.type === 'clouds') {
          this.x = Math.random() * window.innerWidth;
          this.y = Math.random() * (window.innerHeight * 0.3);
        } else {
          this.y = -10;
        }
        
        this.speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
        this.size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
        this.sway = (Math.random() - 0.5) * config.swayAmount;
        this.opacity = 0.5 + Math.random() * 0.5;
        
        if (config.type === 'clouds') {
          this.puffCount = 5 + Math.floor(Math.random() * 3);
          this.puffSizes = [];
          for (let i = 0; i < this.puffCount; i++) {
            this.puffSizes.push(0.4 + Math.random() * 0.3);
          }
        }
      }
      
      this.type = config.type;
    }
    
    update(config) {
      if (this.type === 'stars') {
        this.phase += 0.016;
        
        if (this.phase >= this.cycleLength) {
          this.phase = 0;
          this.x = Math.random() * window.innerWidth;
          this.y = Math.random() * (window.innerHeight * 0.3);
        }
        
        if (this.phase < 1) {
          this.opacity = this.phase;
        } else if (this.phase < 3) {
          this.opacity = 0.8 + Math.sin((this.phase - 1) * Math.PI) * 0.2;
        } else if (this.phase < 4) {
          this.opacity = 1 - (this.phase - 3);
        } else {
          this.opacity = 0;
        }
        
        return;
      }
      
      if (this.type === 'clouds' || this.type === 'fog') {
        this.x += this.speed;
        if (this.type === 'clouds'){
          this.y += Math.sin(this.x * 0.01) * 0.2;
        } else{
          this.y += Math.sin(this.x * 0.01) * 0.02;
        }
        
        if (this.x > window.innerWidth + this.size) {
          this.x = -this.size;
          this.y = Math.random() * window.innerHeight;
        }
        return;
      }
      
      this.y += this.speed;
      this.x += this.sway;
      
      if (this.y > window.innerHeight) {
        this.reset(config);
      }
      
      if (this.x < 0 || this.x > window.innerWidth) {
        this.x = Math.random() * window.innerWidth;
      }
    }
    
    draw() {
      ctx.globalAlpha = this.opacity;
      
      if (this.type === 'stars') {
        if (this.opacity > 0) {
          ctx.globalAlpha = this.opacity * 0.7;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
          ctx.shadowBlur = 4 + this.opacity * 3;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
      } else if (this.type === 'clouds') {
        const baseOpacity = this.opacity * 0.6;
        const baseColor = weatherConfigs[currentWeather]?.color || 'rgba(180, 180, 180, 0.10)';
        
        for (let i = 0; i < this.puffCount; i++) {
          const angle = (i / this.puffCount) * Math.PI * 2;
          const puffSize = this.size * this.puffSizes[i];
          const offsetX = Math.cos(angle) * this.size * 0.4;
          const offsetY = Math.sin(angle) * this.size * 0.25;
          
          const gradient = ctx.createRadialGradient(
            this.x + offsetX, this.y + offsetY, 0,
            this.x + offsetX, this.y + offsetY, puffSize
          );
          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(0.6, baseColor.replace(/[\d.]+\)$/g, '0.02)'));
          gradient.addColorStop(1, 'rgba(180, 180, 180, 0)');
          
          ctx.globalAlpha = baseOpacity;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x + offsetX, this.y + offsetY, puffSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        
      } else if (this.type === 'snow') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = weatherConfigs[currentWeather]?.color || 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      } else if (this.type === 'mixed') {
        const isMixed = Math.random() > 0.5;
        if (isMixed) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = weatherConfigs[currentWeather]?.color || 'rgba(200, 210, 230, 0.35)';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.sway, this.y + this.size * 4);
          ctx.strokeStyle = weatherConfigs[currentWeather]?.color || 'rgba(200, 210, 230, 0.35)';
          ctx.lineWidth = this.size * 0.7;
          ctx.stroke();
        }
      } else if (this.type === 'rain') {
        const config = weatherConfigs[currentWeather] || {};
        const lengthMult = config.lengthMultiplier || 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.sway, this.y + this.size * 4 * lengthMult);
        ctx.strokeStyle = config.color || 'rgba(174, 194, 224, 0.35)';
        ctx.lineWidth = this.size;
        ctx.stroke();
      } else if (this.type === 'fog') {
        const grad = ctx.createLinearGradient(
            this.x - this.size, 0,
            this.x + this.size, 0

        );
        grad.addColorStop(0, 'rgba(220, 220, 220, 0)');
        grad.addColorStop(0.5, weatherConfigs[currentWeather].color);
        grad.addColorStop(1, 'rgba(220, 220, 220, 0)');
        
        ctx.globalAlpha = this.opacity * 0.2;
        ctx.fillStyle = grad;
        ctx.fillRect(this.x - this.size, this.y -15, this.size * 2000, 300);
        ctx.globalAlpha = 1;
        
      } else if (this.type === 'hail') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = weatherConfigs[currentWeather]?.color || 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      } 


      
      ctx.globalAlpha = 1;
    }
  }
  
  // Initialize canvas
  function initCanvas() {
    if (canvas) {
      log('Canvas already exists, skipping initialization');
      return;
    }
    
    canvas = document.createElement('canvas');
    canvas.id = 'weather-overlay-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    log('Canvas initialized', {
      width: canvas.width,
      height: canvas.height,
      dpr: dpr
    });
  }
  
  // Initialize particles
  function initParticles(weather) {
    particles = [];
    const config = weatherConfigs[weather];
    if (config && config.maxParticles > 0) {
      for (let i = 0; i < config.maxParticles; i++) {
        particles.push(new Particle(config));
      }
    }
    log(`Initialized ${particles.length} particles for ${weather}`);
  }
  
  // Draw sunny ambient glow effect
  function drawSunnyGlow() {
    const sunGradient = ctx.createRadialGradient(
      window.innerWidth * 0.90, window.innerHeight * 0.10, 0,
      window.innerWidth * 0.90, window.innerHeight * 0.10, 500
    );
    sunGradient.addColorStop(0, 'rgba(255, 200, 80, 0.25)');
    sunGradient.addColorStop(0.2, 'rgba(255, 180, 60, 0.15)');
    sunGradient.addColorStop(0.5, 'rgba(255, 160, 40, 0.08)');
    sunGradient.addColorStop(0.8, 'rgba(255, 140, 20, 0.03)');
    sunGradient.addColorStop(1, 'rgba(255, 120, 10, 0)');
    
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(window.innerWidth * 0.90, window.innerHeight * 0.10, 500, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw lightning effect
  function drawLightning() {
    const lightX = Math.random() * canvas.width;
    const lightY = Math.random() * (canvas.height * 0.3);
    
    const gradient = ctx.createRadialGradient(
      lightX, lightY, 0,
      lightX, lightY, canvas.width * 0.8
    );
    
    const colorVariation = Math.random() * 30;
    const blue = 220 + colorVariation;
    const green = 230 + colorVariation;
    
    gradient.addColorStop(0, `rgba(255, ${green}, ${blue}, ${lightningBrightness * 0.4})`);
    gradient.addColorStop(0.3, `rgba(240, ${green - 20}, ${blue - 20}, ${lightningBrightness * 0.25})`);
    gradient.addColorStop(0.7, `rgba(200, ${green - 40}, ${blue - 40}, ${lightningBrightness * 0.1})`);
    gradient.addColorStop(1, 'rgba(180, 190, 210, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${lightningBrightness * 0.15})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Animation loop
  function animate() {
    if (!ctx || !canvas) {
      warn('Canvas or context not available, stopping animation');
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const config = weatherConfigs[currentWeather];
    if (config) {
      if (config.type === 'sunny') {
        drawSunnyGlow();
      }
      
      if (particles.length > 0) {
        particles.forEach(particle => {
          particle.update(config);
          particle.draw();
        });
      }
    }
    
    // Handle lightning effects
    if (config && (config.type === 'lightning' || config.hasLightning)) {
      lightningTimer += 16;
      
      if (showLightning) {
        lightningDuration -= 16;
        
        if (lightningDuration <= 0) {
          showLightning = false;
          lightningTimer = 0;
          lightningInterval = 1500 + Math.random() * 2500;
        } else {
          lightningBrightness = Math.max(0, lightningBrightness - lightningFadeSpeed);
          drawLightning();
        }
      } else if (lightningTimer >= lightningInterval) {
        showLightning = true;
        
        const flashType = Math.random();
        
        if (flashType < 0.3) {
          lightningDuration = 150 + Math.random() * 100;
          lightningBrightness = 0.7 + Math.random() * 0.3;
        } else if (flashType < 0.6) {
          lightningDuration = 600 + Math.random() * 400;
          lightningBrightness = 0.5 + Math.random() * 0.2;
        } else {
          lightningDuration = 300 + Math.random() * 200;
          lightningBrightness = 0.6 + Math.random() * 0.3;
        }
        
        lightningFadeSpeed = lightningBrightness / (lightningDuration / 16);
      }
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Get Home Assistant instance
  function getHomeAssistant() {
    const ha = document.querySelector('home-assistant');
    if (!ha || !ha.hass) {
      return null;
    }
    return ha;
  }
  
  // Get weather state from Home Assistant
  function getWeatherState() {
    try {
      const homeAssistant = getHomeAssistant();
      if (!homeAssistant) {
        warn('Home Assistant not available');
        return null;
      }
      
      // Check if test mode is active
      if (TEST_ENTITY) {
        const testEntity = homeAssistant.hass.states[TEST_ENTITY];
        if (testEntity && testEntity.state && testEntity.state !== 'Use Real Weather') {
          log(`Using TEST weather: ${testEntity.state}`);
          return testEntity.state;
        }
      }
      
      // Use real weather entity
      const weatherEntity = homeAssistant.hass.states[WEATHER_ENTITY];
      if (!weatherEntity) {
        error(`Weather entity '${WEATHER_ENTITY}' not found!`);
        error('Available weather entities:', Object.keys(homeAssistant.hass.states).filter(k => k.startsWith('weather.')));
        return null;
      }
      
      let weatherState = weatherEntity.state;
      log(`Weather entity state: ${weatherState}`);
      
      // Cross-check rainy/pouring with rain sensor if configured
      if (RAIN_SENSOR_ENTITY && REQUIRE_RAIN_CONFIRMATION && (weatherState === 'rainy' || weatherState === 'pouring')) {
        const rainSensor = homeAssistant.hass.states[RAIN_SENSOR_ENTITY];
        
        if (rainSensor) {
          const rainRate = parseFloat(rainSensor.state);
          const isActuallyRaining = !isNaN(rainRate) && rainRate > 0;
          
          if (!isActuallyRaining) {
            log(`Weather says ${weatherState}, but rain sensor shows ${rainRate} - showing cloudy instead`);
            weatherState = 'cloudy';
          } else {
            log(`Rain confirmed by sensor: ${rainRate}`);
          }
        } else {
          warn(`Rain sensor '${RAIN_SENSOR_ENTITY}' not found`);
        }
      }
      
      // Check if weather state is supported
      if (!weatherConfigs[weatherState]) {
        warn(`Unknown weather state: '${weatherState}' - no animation available`);
        warn('Supported states:', Object.keys(weatherConfigs));
      }
      
      return weatherState;
    } catch (err) {
      error('Error getting weather state:', err);
      return null;
    }
  }
  
  // Check if overlay is enabled via toggle
  function isOverlayEnabled() {
    try {
      // If no toggle entity configured, always enabled
      if (!TOGGLE_ENTITY) {
        return true;
      }
      
      const homeAssistant = getHomeAssistant();
      if (!homeAssistant) {
        return true; // Default to enabled if HA not ready
      }
      
      const toggleEntity = homeAssistant.hass.states[TOGGLE_ENTITY];
      if (!toggleEntity) {
        log(`Toggle entity '${TOGGLE_ENTITY}' not found - overlay enabled by default`);
        return true;
      }
      
      const enabled = toggleEntity.state === 'on';
      if (!enabled) {
        log('Overlay disabled via toggle');
      }
      return enabled;
    } catch (err) {
      error('Error checking toggle state:', err);
      return true;
    }
  }
  
  // Check if current dashboard is in the enabled list
  function isOnEnabledDashboard() {
    // If ENABLED_DASHBOARDS is empty, show on all dashboards
    if (!ENABLED_DASHBOARDS || ENABLED_DASHBOARDS.length === 0) {
      log('Dashboard filtering disabled - showing on all dashboards');
      return true;
    }
    
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);
    
    log('Current path:', path);
    log('Path parts:', pathParts);
    
    if (pathParts.length === 0) {
      log('No path parts found - assuming home dashboard');
      return ENABLED_DASHBOARDS.includes('lovelace') || ENABLED_DASHBOARDS.includes('home');
    }
    
    // Check for standard lovelace URLs: /lovelace or /lovelace/dashboard
    if (pathParts[0] === 'lovelace') {
      const dashboardName = pathParts.length === 1 ? 'lovelace' : pathParts[1];
      const enabled = ENABLED_DASHBOARDS.includes(dashboardName);
      log(`Dashboard: '${dashboardName}', Enabled: ${enabled}`);
      return enabled;
    }
    
    // Check for custom dashboard URLs
    // Try matching against each path part
    for (const part of pathParts) {
      if (ENABLED_DASHBOARDS.includes(part)) {
        log(`Dashboard: '${part}', Enabled: true`);
        return true;
      }
    }
    
    // Last part is usually the view/dashboard name
    const dashboardName = pathParts[pathParts.length - 1];
    const enabled = ENABLED_DASHBOARDS.includes(dashboardName);
    log(`Dashboard: '${dashboardName}', Enabled: ${enabled}`);
    
    if (!enabled) {
      log('Dashboard not in enabled list. Enabled dashboards:', ENABLED_DASHBOARDS);
    }
    
    return enabled;
  }
  
  // Update weather and manage animation
  function updateWeather() {
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_INTERVAL) {
      return;
    }
    
    lastUpdateTime = now;
    
    // Check if overlay is enabled
    const enabled = isOverlayEnabled();
    const onEnabledDashboard = isOnEnabledDashboard();
    
    if (!enabled || !onEnabledDashboard) {
      if (canvas) {
        canvas.style.display = 'none';
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        log('Animation stopped (disabled or wrong dashboard)');
      }
      return;
    }
    
    // Show canvas
    if (canvas) {
      canvas.style.display = 'block';
    }
    
    const newWeather = getWeatherState();
    
    if (newWeather && newWeather !== currentWeather) {
      log(`Weather changed: ${currentWeather} -> ${newWeather}`);
      currentWeather = newWeather;
      
      // Reset lightning timers
      lightningTimer = 0;
      showLightning = false;
      lightningDuration = 0;
      lightningBrightness = 0;
      lightningInterval = 1500 + Math.random() * 2500;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      if (weatherConfigs[newWeather]) {
        initParticles(newWeather);
        animate();
        log(`Animation started for: ${newWeather}`);
      } else {
        particles = [];
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        warn(`No animation config for weather: ${newWeather}`);
      }
    } else if (newWeather && !animationId && weatherConfigs[newWeather]) {
      // Restart animation if it was stopped
      initParticles(newWeather);
      animate();
      log(`Animation restarted for: ${newWeather}`);
    }
  }
  
  // Handle window resize
  function handleResize() {
    if (canvas && ctx) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      log('Canvas resized');
    }
  }
  
  // Wait for Home Assistant to load
  function waitForHomeAssistant() {
    log('Waiting for Home Assistant...');
    
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds max
    
    const checkHA = setInterval(() => {
      attempts++;
      const homeAssistant = getHomeAssistant();
      
      if (homeAssistant) {
        clearInterval(checkHA);
        log('Home Assistant ready!');
        init();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkHA);
        error('Home Assistant not found after 30 seconds. Is this a Home Assistant page?');
      }
    }, 500);
  }
  
  // Initialize
  function init() {
    if (initializationComplete) {
      log('Already initialized, skipping');
      return;
    }
    
    log('Initializing Weather Overlay v2.0...');
    log('Configuration:', {
      WEATHER_ENTITY,
      TOGGLE_ENTITY: TOGGLE_ENTITY || '(disabled)',
      TEST_ENTITY: TEST_ENTITY || '(disabled)',
      RAIN_SENSOR_ENTITY: RAIN_SENSOR_ENTITY || '(disabled)',
      ENABLED_DASHBOARDS: ENABLED_DASHBOARDS.length ? ENABLED_DASHBOARDS : '(all dashboards)'
    });
    
    initCanvas();
    
    // Check if overlay is enabled
    if (!isOverlayEnabled()) {
      log('Overlay is disabled via toggle');
      if (canvas) {
        canvas.style.display = 'none';
      }
    } else if (!isOnEnabledDashboard()) {
      log('Not on enabled dashboard');
      if (canvas) {
        canvas.style.display = 'none';
      }
    } else {
      // Initial weather check
      const weather = getWeatherState();
      if (weather) {
        currentWeather = weather;
        if (weatherConfigs[weather]) {
          initParticles(weather);
          animate();
          log(`Started with weather: ${weather}`);
        } else {
          warn(`Weather '${weather}' has no animation config`);
        }
      }
    }
    
    // Setup periodic weather checks
    setInterval(updateWeather, 1000);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Listen for URL changes (dashboard navigation)
    let lastPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        log('Dashboard changed, re-checking...');
        lastUpdateTime = 0; // Force immediate update
        updateWeather();
      }
    }, 500);
    
    initializationComplete = true;
    log('✅ Initialization complete!');
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForHomeAssistant);
  } else {
    waitForHomeAssistant();
  }
  
  log('Module loaded - v2.0');
})();
