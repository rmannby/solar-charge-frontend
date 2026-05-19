# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Solar Charge Frontend is a Vue 3 + Vite application that provides a real-time dashboard for monitoring and controlling a solar charge optimization system. The app displays power metrics, charging status, and allows manual control of the charging process.

## Common Development Commands

### Start Development
```bash
npm run dev                    # Start dev server on localhost:5173
npm run dev -- --host        # Start with network access for other devices
npm run dev -- --port 3000   # Use specific port if needed
```

### Build and Preview
```bash
npm run build                 # Build for production (outputs to dist/)
npm run preview              # Preview production build locally
```

### Dependencies
```bash
npm install                   # Install all dependencies
rm -rf node_modules package-lock.json && npm install  # Clean reinstall
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3 with Composition API and `<script setup>` syntax
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS utility classes
- **HTTP Client**: Axios for API communication
- **SVG Icons**: vite-svg-loader (imports SVGs as Vue components)

### Application Structure
This is a single-page application (SPA) with:
- **Main Component**: `src/App.vue` - Contains the entire dashboard interface
- **Entry Point**: `src/main.js` - Application bootstrap
- **Assets**: `src/assets/` - SVG icons imported as Vue components
- **Styling**: Tailwind CSS with dark theme (gray-800 background)

### Key Features
1. **Real-time Dashboard**: Two rows of metric cards with 10-second polling
   - Row 1 (house): Nät (grid) | Solkraft (PV) | Batteri (SOC % + ↑↓/Vila)
   - Row 2 (car): Laddning | Beslut ⚙ | Tillagd Energi
2. **Battery Display**: Color-coded SOC (green→red) with charge direction as subtext. Direction threshold = 200 W to filter BMS balancing pulses.
3. **SOC Lock Banner**: Shows when `battery_soc_paused=true` explaining why car charging is paused.
4. **Status Monitoring**: Wallbox status bar with color-coded indicators and icons
5. **Manual Controls**: Battery priority section + standard controls
   - Battery priority quick-select: [Av] [Balanserat] [Huset Först] (sets min_soc to 0/70/90 %)
   - Min SOC dropdown (0 = off, 50–100 % in steps of 5)
   - Optimizer Aktiv toggle
   - Lägsta Laddström (min override amps, bypasses SOC lock)
   - Högsta Laddström (max override amps, reserves solar for house battery)
6. **Enhanced Error Reporting**:
   - Connection status badges (🟢 Live, 🟡 Cachad, 🔴 Offline)
   - Cache age indicators
   - Disabled controls when wallbox disconnected

### API Integration
The app dynamically determines the API URL based on the browser's location:
- **When accessed via localhost**: API calls go to `http://localhost:8000`
- **When accessed via network IP**: API calls go to `http://<same-ip>:8000`
- **Status Endpoint**: `GET /api/v1/status` - Fetches all dashboard data
- **Control Endpoint**: `PUT /api/v1/control` - Updates system settings

API calls use 10-15 second timeouts and include comprehensive error handling for network issues.

#### Network Access and Mobile Support
The application supports access from mobile devices and other machines on the network:
- **Dynamic API URL**: Automatically detects the access point (localhost vs network IP) and adjusts API calls accordingly
- **CORS Configuration**: Backend must be configured to allow the frontend's network IP in CORS headers
- **Mobile Access**: Fully functional on mobile browsers (tested with iPhone/Safari)

#### Status API fields (GET /api/v1/status)
Power metrics:
- **`net_power_w`**: Grid import/export (negative = exporting)
- **`solar_production_w`**: DC PV production from Solis S6 (W)
- **`charge_power_w_calculated`**: Current EV charging power (W)
- **`estimated_set_amps`**: Currently set charging current (A)
- **`decision_amps`**: Optimizer target amps

Battery fields:
- **`battery_soc_pct`**: House battery state of charge (0–100 %)
- **`battery_power_w`**: Battery power (positive=discharging, negative=charging)
- **`battery_soc_paused`**: True when SOC lock is holding car charging paused
- **`battery_min_soc`**: Currently configured SOC threshold (0 = disabled)
- **`max_override_amps`**: Currently configured max car charging current

Control settings (also in GET response for UI sync):
- **`optimizer_enabled`**, **`min_override_amps`**, **`battery_min_soc`**, **`max_override_amps`**

Wallbox connection:
- **`wallbox_connected`**, **`wallbox_client_state`**, **`wallbox_last_error`**
- **`data_from_cache`**, **`cache_age_seconds`**, **`connection_error`**

#### Control API (PUT /api/v1/control)
Accepts any subset of: `optimizer_enabled`, `min_override_amps`, `battery_min_soc`, `max_override_amps`

### Vue 3 Patterns Used
- **Composition API**: All logic uses `<script setup>` syntax
- **Reactive Data**: Uses `ref()` for reactive state management
- **Computed Properties**: For derived values and dynamic styling
- **Lifecycle Hooks**: `onMounted` and `onUnmounted` for component lifecycle
- **Component Icons**: SVG files imported as Vue components via vite-svg-loader

### Data Flow
1. App mounts and starts 10-second polling interval
2. `fetchData()` calls status API and updates reactive state
3. User interactions trigger `updateControlSettings()` API calls
4. Computed properties automatically update UI based on status data
5. Error states are managed separately for status vs control operations

### Styling Approach
- Dark theme with gray-800 background and gray-100 text
- Grid-based layout using Tailwind's responsive grid classes
- Color-coded status indicators (green=charging, yellow=paused, blue=waiting, red=error)
- Consistent spacing and shadow effects throughout the interface

## Development Notes

### Configuration Files
- `vite.config.js` - Vite configuration with Vue and SVG loader plugins
- `tailwind.config.js` - Tailwind CSS configuration scanning Vue files
- `postcss.config.js` - PostCSS configuration for Tailwind processing

### Icon System
SVG icons in `src/assets/` are imported as Vue components:
```javascript
import BatteryChargingOutlineIcon from './assets/battery-charging-outline.svg?component';
```

### API Configuration
API base URL is dynamically determined in App.vue based on the browser's current location:
- Uses `window.location.hostname` to detect if accessed via localhost or network IP
- Automatically constructs the correct API URL (port 8000) for the current access method
- No manual configuration needed when switching between local and network access

### Error Handling Strategy
- Network errors show user-friendly Swedish messages
- Separate error states for status fetching vs control operations
- Loading states prevent UI interactions during API calls

### Recommended IDE Setup
- VS Code with Volar extension (as specified in `.vscode/extensions.json`)
- Vue 3 Script Setup support for proper syntax highlighting and IntelliSense

## Troubleshooting

### Network Access Issues
If the app isn't accessible from other devices:
1. **Start dev server with host flag**: `npm run dev -- --host`
2. **Check firewall**: Ensure port 5173 (dev) or your chosen port is open
3. **Verify CORS**: Backend must include the frontend's network IP in CORS allowed origins
4. **API connectivity**: Ensure backend is also accessible on port 8000 from the network

### Mobile Access
For mobile device access:
1. Start the dev server with `npm run dev -- --host`
2. Find your machine's network IP (e.g., `192.168.x.x`)
3. Access the app using `http://<your-ip>:5173` on your mobile browser
4. The app will automatically use the correct API endpoint

### Recent Fixes (2025-08-17)
- ✅ **Fixed Network Access**: Made the API URL dynamic to work from any access point
- ✅ **Resolved CORS Issues**: Updated backend to allow the correct network IP
- ✅ **Enabled Mobile Access**: iPhone and other mobile devices can now monitor and control the solar charging system
