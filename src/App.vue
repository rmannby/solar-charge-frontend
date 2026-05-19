<template>
  <div class="min-h-screen bg-gray-800 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
    <div class="w-full max-w-sm">
      <!-- Connection Status Badge -->
      <div v-if="statusData" class="mb-2 flex justify-center">
        <div 
          :class="connectionStatusClass"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold space-x-1"
        >
          <span :class="connectionIndicatorClass" class="w-2 h-2 rounded-full"></span>
          <span>{{ connectionStatusText }}</span>
          <span v-if="statusData.data_from_cache && statusData.cache_age_seconds" class="opacity-75">
            ({{ formatCacheAge(statusData.cache_age_seconds) }})
          </span>
        </div>
      </div>

      <div
        :class="topStatusBackgroundClass"
        class="rounded-lg p-4 mb-6 flex items-center justify-center space-x-3 shadow-lg relative"
      >
        <component :is="topStatusIcon" class="h-8 w-8 text-white" />
        <span class="text-2xl font-bold text-white">{{ topStatusText }}</span>
        
        <!-- Data freshness indicator -->
        <div v-if="statusData?.data_from_cache" class="absolute top-2 right-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
               class="w-5 h-5 text-yellow-300" title="Data från cache">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Rad 1: Nät | Solkraft | Batteri SOC -->
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <TransmissionTowerIcon class="h-8 w-8 text-blue-400" />
          </div>
          <div class="text-sm text-gray-400">Nät</div>
          <div class="text-xl font-semibold">{{ formatWatts(statusData?.net_power_w) }}</div>
        </div>

        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="text-sm text-gray-400">Solkraft</div>
          <div class="text-xl font-semibold">{{ formatWatts(statusData?.solar_production_w) }}</div>
        </div>

        <!-- Batteri SOC + effekt -->
        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" :class="socIconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="18" height="11" rx="2" stroke-width="2"/>
              <path d="M20 11h2v3h-2z" stroke-width="1.5"/>
              <rect x="4" y="9" width="7" height="7" rx="1" :fill="socFillColor" stroke="none"/>
            </svg>
          </div>
          <div class="text-sm text-gray-400">Batteri</div>
          <div class="text-xl font-semibold" :class="socTextColor">{{ formatSoc(statusData?.battery_soc_pct) }}</div>
          <div class="text-xs font-medium mt-0.5" :class="batteryPowerTextColor">{{ formatBatteryPower(statusData?.battery_power_w) }}</div>
        </div>
      </div>

      <!-- Rad 2: Laddning bil | Batteri-effekt | Tillagd Energi -->
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <CarElectricOutlineIcon class="h-8 w-8 text-green-400" />
          </div>
          <div class="text-sm text-gray-400">Laddning</div>
          <div class="text-xl font-semibold">{{ formatWatts(statusData?.charge_power_w_calculated) }}</div>
        </div>

        <!-- Beslut -->
        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <CogsIcon class="h-8 w-8 text-teal-400" />
          </div>
          <div class="text-sm text-gray-400">Beslut</div>
          <div class="text-xl font-semibold">{{ formatDecision(statusData?.decision_amps, statusData?.hysteresis_pending_amps) }}</div>
        </div>

        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <ScaleIcon class="h-8 w-8 text-orange-400" />
          </div>
          <div class="text-sm text-gray-400">Tillagd Energi</div>
          <div class="text-xl font-semibold">{{ formatKwh(statusData?.added_energy_kwh) }}</div>
        </div>
      </div>

      <!-- SOC-lås-varning -->
      <div v-if="statusData?.battery_soc_paused" class="mb-3 p-2 bg-blue-900 bg-opacity-60 rounded-lg border border-blue-600">
        <div class="flex items-center space-x-2 text-blue-300 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Hussbatteri prioriteras — billaddning pausad tills SOC ≥ {{ statusData?.battery_min_soc }}%</span>
        </div>
      </div>


      <div class="bg-gray-700 p-4 rounded-lg shadow-md" :class="{ 'opacity-60': !isWallboxConnected }">
        <h2 class="text-lg font-semibold text-center mb-4">Inställningar</h2>
        
        <!-- Warning message when wallbox is not connected -->
        <div v-if="!isWallboxConnected" class="mb-4 p-2 bg-orange-900 bg-opacity-50 rounded-lg border border-orange-600">
          <div class="flex items-center space-x-2 text-orange-300 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>{{ wallboxDisconnectedMessage }}</span>
          </div>
        </div>
        
        <div class="space-y-4">

          <!-- Batteri-prioritet -->
          <div>
            <div class="text-sm font-medium mb-2" :class="{ 'text-gray-400': !isWallboxConnected }">Batteri-prioritet:</div>
            <div class="flex gap-2 mb-2">
              <button v-for="preset in socPresets" :key="preset.label"
                @click="applyBatteryPreset(preset.soc)"
                :disabled="isUpdatingControl || !isWallboxConnected"
                :class="[
                  selectedMinSoc === preset.soc ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300',
                  'flex-1 px-2 py-1 rounded text-sm font-medium transition-colors',
                  (isUpdatingControl || !isWallboxConnected) ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-500 hover:text-white'
                ]"
              >{{ preset.label }}</button>
            </div>
            <div class="flex items-center justify-between">
              <label for="minSocSelect" class="text-sm" :class="{ 'text-gray-400': !isWallboxConnected }">Min SOC:</label>
              <select
                id="minSocSelect"
                v-model="selectedMinSoc"
                @change="handleMinSocChange"
                :disabled="isUpdatingControl || !isWallboxConnected"
                class="block w-24 rounded-md border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-600 text-gray-100 p-1.5 text-sm"
                :class="{ 'cursor-not-allowed': !isWallboxConnected }"
              >
                <option v-for="s in socOptions" :key="s" :value="s">{{ s === 0 ? 'Av' : s + ' %' }}</option>
              </select>
            </div>
          </div>

          <div class="border-t border-gray-600 pt-4">
          <div class="flex items-center justify-between">
            <label for="optimizerSwitch" class="font-medium" :class="{ 'text-gray-400': !isWallboxConnected }">Optimering Aktiv:</label>
            <button
              id="optimizerSwitch"
              @click="toggleOptimizer"
              :class="optimizerEnabled ? 'bg-green-500' : 'bg-gray-500'"
              class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
              role="switch"
              :aria-checked="optimizerEnabled.toString()"
              :disabled="isUpdatingControl || !isWallboxConnected"
              :title="!isWallboxConnected ? 'Kontroller inaktiverade - ingen anslutning till wallbox' : ''"
            >
              <span class="sr-only">Aktivera/Inaktivera Optimering</span>
              <span
                :class="optimizerEnabled ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                aria-hidden="true"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <label for="minAmpsSelect" class="font-medium" :class="{ 'text-gray-400': !isWallboxConnected }">Lägsta Laddström:</label>
            <select
              id="minAmpsSelect"
              v-model="selectedMinAmps"
              @change="handleMinAmpsChange"
              :disabled="isUpdatingControl || !isWallboxConnected"
              :title="!isWallboxConnected ? 'Kontroller inaktiverade - ingen anslutning till wallbox' : ''"
              class="block w-24 rounded-md border-gray-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-600 text-gray-100 p-1.5 text-sm"
              :class="{ 'cursor-not-allowed': !isWallboxConnected }"
            >
              <option v-for="amp in ampOptions" :key="amp" :value="amp">
                {{ `${amp} A` }}
              </option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <label for="maxAmpsSelect" class="font-medium" :class="{ 'text-gray-400': !isWallboxConnected }">Högsta Laddström:</label>
            <select
              id="maxAmpsSelect"
              v-model="selectedMaxAmps"
              @change="handleMaxAmpsChange"
              :disabled="isUpdatingControl || !isWallboxConnected"
              :title="!isWallboxConnected ? 'Kontroller inaktiverade - ingen anslutning till wallbox' : ''"
              class="block w-24 rounded-md border-gray-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-600 text-gray-100 p-1.5 text-sm"
              :class="{ 'cursor-not-allowed': !isWallboxConnected }"
            >
              <option v-for="amp in maxAmpOptions" :key="amp" :value="amp">
                {{ amp === 0 ? 'Ingen gräns' : `${amp} A` }}
              </option>
            </select>
          </div>
          </div><!-- /border-t -->
        </div>
      </div>

      <div v-if="loading && !statusData" class="text-center text-gray-400 mt-4">Laddar data...</div>
      
      <!-- Enhanced error display with connection details -->
      <div v-if="error || wallboxLastError" class="mt-4 space-y-2">
        <div v-if="error" class="text-center text-red-400 p-2 bg-red-900 bg-opacity-50 rounded">
          {{ error }}
        </div>
        <div v-if="wallboxLastError" class="text-center text-orange-400 p-2 bg-orange-900 bg-opacity-50 rounded">
          <div class="text-sm font-semibold">Wallbox fel:</div>
          <div class="text-xs">{{ wallboxLastError }}</div>
        </div>
      </div>
      
      <div v-if="controlError" class="text-center text-orange-400 mt-4 p-2 bg-orange-900 bg-opacity-50 rounded">{{ controlError }}</div>
      <div v-if="isUpdatingControl" class="text-center text-sm text-gray-400 mt-2">Uppdaterar inställning...</div>

      <div v-if="statusData" class="text-center text-xs text-gray-500 mt-6">
        <div>Senast uppdaterad: {{ formatTimestamp(statusData.timestamp) }}</div>
        <div v-if="statusData.data_from_cache && statusData.cache_age_seconds" class="text-yellow-500">
          (Data från cache - {{ formatCacheAge(statusData.cache_age_seconds) }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { api, currentBaseUrl } from './api/client';

// --- Importera SVG-ikoner som Vue-komponenter ---
// Befintliga ikoner
import BatteryChargingOutlineIcon from './assets/battery-charging-outline.svg?component';
import BatteryClockOutlineIcon from './assets/battery-clock-outline.svg?component';
import PowerPlugBatteryOutlineIcon from './assets/power-plug-battery-outline.svg?component';
import TransmissionTowerIcon from './assets/transmission-tower.svg?component';
import CarElectricOutlineIcon from './assets/car-electric-outline.svg?component';
import EvStationIcon from './assets/ev-station.svg?component';
import CogsIcon from './assets/cogs.svg?component';
// NYTT: Importera ikon för Tillagd Energi (ersätt med din faktiska ikonfil)
import ScaleIcon from './assets/scale.svg?component'; // Antagande att du har scale.svg


// --- Reaktiva variabler (som tidigare) ---
const statusData = ref(null);
const loading = ref(true);
const error = ref(null);
const controlError = ref(null);
const pollingInterval = ref(null);
const isUpdatingControl = ref(false);
const optimizerEnabled = ref(true);
const selectedMinAmps = ref(0);
const selectedMinSoc = ref(0);
const selectedMaxAmps = ref(0);

// SOC-förinställningar
const socPresets = [
  { label: 'Av', soc: 0 },
  { label: 'Balanserat', soc: 70 },
  { label: 'Huset Först', soc: 90 },
];

// Dropdown-alternativ för SOC (0 = av, sedan 50-100% i steg om 5)
const socOptions = [0, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

// Dropdown-alternativ för max laddström
const maxAmpOptions = computed(() => {
  const options = [0]; // 0 = ingen gräns
  for (let i = 6; i <= 16; i++) options.push(i);
  return options;
});

// SOC-färgkodning
const socLevel = computed(() => {
  const s = statusData.value?.battery_soc_pct;
  if (s === null || s === undefined) return 'unknown';
  if (s >= 75) return 'high';
  if (s >= 50) return 'medium';
  if (s >= 25) return 'low';
  return 'critical';
});
const socIconColor = computed(() => ({
  'text-green-400': socLevel.value === 'high',
  'text-yellow-400': socLevel.value === 'medium',
  'text-orange-400': socLevel.value === 'low',
  'text-red-400':    socLevel.value === 'critical',
  'text-gray-500':   socLevel.value === 'unknown',
}));
const socFillColor = computed(() => ({
  high: '#4ade80', medium: '#facc15', low: '#fb923c', critical: '#f87171', unknown: '#6b7280',
}[socLevel.value]));
const socTextColor = computed(() => ({
  'text-green-400': socLevel.value === 'high',
  'text-yellow-400': socLevel.value === 'medium',
  'text-orange-400': socLevel.value === 'low',
  'text-red-400':    socLevel.value === 'critical',
}));

// Batterieffekt-färgkodning
const BAT_THRESHOLD_W = 200; // Ignorera små underhållspulsar från BMS
const batteryPowerIconColor = computed(() => {
  const p = statusData.value?.battery_power_w;
  if (p === null || p === undefined) return 'text-gray-500';
  if (p > BAT_THRESHOLD_W) return 'text-orange-400';  // urladdar
  if (p < -BAT_THRESHOLD_W) return 'text-teal-400';   // laddar
  return 'text-gray-500';                             // vila/balansering
});
const batteryPowerTextColor = computed(() => batteryPowerIconColor.value);

// --- API Endpoints ---
// Using centralized API client from src/api/client.js
const STATUS_API_PATH = '/api/v1/status';
const CONTROL_API_PATH = '/api/v1/control';

// Log current API base URL for debugging
console.log('[API] Using base URL:', currentBaseUrl);

// Connection status computed properties
const isWallboxConnected = computed(() => {
  return statusData.value?.wallbox_connected === true;
});

const wallboxClientState = computed(() => {
  return statusData.value?.wallbox_client_state || 'unknown';
});

const wallboxLastError = computed(() => {
  return statusData.value?.wallbox_last_error || null;
});

const wallboxDisconnectedMessage = computed(() => {
  if (wallboxClientState.value === 'offline') {
    return 'Wallbox är offline - kontroller inaktiverade';
  } else if (wallboxClientState.value === 'rate_limited') {
    return 'Wallbox begränsad - för många anrop';
  } else if (wallboxClientState.value === 'transient_error') {
    return 'Tillfälligt fel - försöker igen...';
  }
  return 'Ingen anslutning till wallbox';
});

const connectionStatusClass = computed(() => {
  if (!statusData.value) return 'bg-gray-600 text-gray-300';
  
  if (wallboxClientState.value === 'online' && !statusData.value.data_from_cache) {
    return 'bg-green-900 text-green-300 border border-green-600';
  } else if (wallboxClientState.value === 'online' && statusData.value.data_from_cache) {
    return 'bg-yellow-900 text-yellow-300 border border-yellow-600';
  } else if (wallboxClientState.value === 'rate_limited') {
    return 'bg-orange-900 text-orange-300 border border-orange-600';
  } else if (wallboxClientState.value === 'transient_error') {
    return 'bg-orange-900 text-orange-300 border border-orange-600';
  } else if (wallboxClientState.value === 'offline') {
    return 'bg-red-900 text-red-300 border border-red-600';
  }
  return 'bg-gray-600 text-gray-300';
});

const connectionIndicatorClass = computed(() => {
  if (!statusData.value) return 'bg-gray-400';
  
  if (wallboxClientState.value === 'online' && !statusData.value.data_from_cache) {
    return 'bg-green-400 animate-pulse';
  } else if (wallboxClientState.value === 'online' && statusData.value.data_from_cache) {
    return 'bg-yellow-400';
  } else if (wallboxClientState.value === 'rate_limited') {
    return 'bg-orange-400';
  } else if (wallboxClientState.value === 'transient_error') {
    return 'bg-orange-400 animate-pulse';
  } else if (wallboxClientState.value === 'offline') {
    return 'bg-red-400';
  }
  return 'bg-gray-400';
});

const connectionStatusText = computed(() => {
  if (!statusData.value) return 'Ansluter...';
  
  if (wallboxClientState.value === 'online' && !statusData.value.data_from_cache) {
    return '🟢 Live data';
  } else if (wallboxClientState.value === 'online' && statusData.value.data_from_cache) {
    return '🟡 Cachad data';
  } else if (wallboxClientState.value === 'rate_limited') {
    return '🟡 Begränsad';
  } else if (wallboxClientState.value === 'transient_error') {
    return '🟠 Tillfälligt fel';
  } else if (wallboxClientState.value === 'offline') {
    return '🔴 Offline';
  }
  return 'Okänd status';
});

const topStatusText = computed(() => {
  if (!statusData.value || !statusData.value.wallbox_status) return 'OKÄND';
  const wbStatus = statusData.value.wallbox_status.toLowerCase();
  if (wbStatus.includes('charging')) return 'LADDAR';
  if (wbStatus.includes('paused')) return 'PAUSAD';
  if (wbStatus.includes('waiting')) return 'VÄNTAR';
  if (wbStatus.includes('ready')) return 'REDO';
  if (wbStatus.includes('connected') && !wbStatus.includes('charging')) return 'ANSLUTEN';
  if (wbStatus.includes('error')) return 'FEL';
  return statusData.value.wallbox_status.toUpperCase();
});

const topStatusBackgroundClass = computed(() => {
  if (!statusData.value || !statusData.value.wallbox_status) return 'bg-gray-600';
  
  // Override color if wallbox is disconnected or has errors
  if (!isWallboxConnected.value) {
    if (wallboxClientState.value === 'offline') return 'bg-red-600';
    if (wallboxClientState.value === 'rate_limited') return 'bg-orange-600';
    if (wallboxClientState.value === 'transient_error') return 'bg-orange-500';
  }
  
  const wbStatus = statusData.value.wallbox_status.toLowerCase();
  if (wbStatus.includes('charging')) {
    // Show different shade if using cached data while charging
    return statusData.value.data_from_cache ? 'bg-green-600' : 'bg-green-500';
  }
  if (wbStatus.includes('paused')) return 'bg-yellow-500';
  if (wbStatus.includes('waiting') || wbStatus.includes('ready') || wbStatus.includes('connected')) return 'bg-blue-500';
  if (wbStatus.includes('error')) return 'bg-red-500';
  return 'bg-gray-600';
});

// --- Befintliga ikoner för toppstatus (som tidigare) ---
const PauseIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>`
};
const HourglassIcon = { // Används för OKÄND, ANSLUTEN och som fallback
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l-2.4-4.5m2.4 4.5l-2.4 4.5M6 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M6 12l2.4-4.5m-2.4 4.5l2.4 4.5m12-3H4.5" /></svg>`
};
const ErrorIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`
};

// --- Uppdaterad beräknad egenskap för toppstatusikon (som tidigare) ---
const topStatusIcon = computed(() => {
  if (!statusData.value || !statusData.value.wallbox_status) return HourglassIcon; // Fallback för okänd status
  const wbStatus = statusData.value.wallbox_status.toLowerCase();

  if (wbStatus.includes('charging')) return BatteryChargingOutlineIcon;
  if (wbStatus.includes('waiting')) return BatteryClockOutlineIcon;
  if (wbStatus.includes('ready')) return PowerPlugBatteryOutlineIcon;
  if (wbStatus.includes('paused')) return PauseIcon;
  if (wbStatus.includes('error')) return ErrorIcon;
  
  if (wbStatus.includes('connected') && !wbStatus.includes('charging')) return HourglassIcon; 

  return HourglassIcon; // Generell fallback
});

// --- Ampere-alternativ (som tidigare) ---
const ampOptions = computed(() => {
  const minChargeableAmps = 6;
  const maxChargeableAmps = 16; // Eller hämta från config/API om det varierar
  const options = [0];
  for (let i = minChargeableAmps; i <= maxChargeableAmps; i++) {
    options.push(i);
  }
  return options;
});

// --- API-anrop (fetchData, updateControlSettings - som tidigare) ---
const fetchData = async () => {
  if (!statusData.value) { loading.value = true; }
  error.value = null;
  try {
    const response = await api.get(STATUS_API_PATH);
    statusData.value = response.data;
    // Uppdatera lokala kontroller endast om vi inte just nu skickar en uppdatering
    if (!isUpdatingControl.value) {
        optimizerEnabled.value = statusData.value.optimizer_enabled;
        if (ampOptions.value.includes(statusData.value.min_override_amps)) {
            selectedMinAmps.value = statusData.value.min_override_amps;
        } else {
            selectedMinAmps.value = 0;
        }
        if (socOptions.includes(statusData.value.battery_min_soc)) {
            selectedMinSoc.value = statusData.value.battery_min_soc;
        } else {
            selectedMinSoc.value = 0;
        }
        if (maxAmpOptions.value.includes(statusData.value.max_override_amps)) {
            selectedMaxAmps.value = statusData.value.max_override_amps;
        } else {
            selectedMaxAmps.value = 0;
        }
    }
  } catch (err) {
    console.error("Error fetching status data:", err);
    if (err.response) { error.value = `Serverfel ${err.response.status}: ${err.response.data?.detail || err.message}`; }
    else if (err.request) { error.value = 'Ingen kontakt med API:et (status).'; }
    else { error.value = `Klientfel (status): ${err.message}`; }
  } finally {
    loading.value = false;
  }
};

const updateControlSettings = async (settings) => {
  if (isUpdatingControl.value) return;
  isUpdatingControl.value = true;
  controlError.value = null;
  console.log("[Control] Sending update:", settings);
  try {
    const response = await api.put(CONTROL_API_PATH, settings);
    console.log("[Control] Update successful:", response.data);
    // Uppdatera lokala kontroller baserat på API-svaret
    if (response.data.optimizer_enabled !== undefined) {
        optimizerEnabled.value = response.data.optimizer_enabled;
    }
    if (response.data.min_override_amps !== undefined) {
        if (ampOptions.value.includes(response.data.min_override_amps)) {
            selectedMinAmps.value = response.data.min_override_amps;
        } else {
            // Om API:et returnerar ett oväntat värde (bör inte hända om backend clampar)
            selectedMinAmps.value = 0;
        }
    }
    // Hämta ny status direkt efter lyckad kontrolluppdatering för snabbare feedback
    await fetchData();
  } catch (err) {
    console.error("[Control] Error updating settings:", err);
    if (err.response) { controlError.value = `Serverfel ${err.response.status}: ${err.response.data?.detail || err.message}`; }
    else if (err.request) { error.value = 'Ingen kontakt med API:et (kontroll).'; }
    else { error.value = `Klientfel (kontroll): ${err.message}`; }
  } finally {
    isUpdatingControl.value = false;
  }
};

// --- Event Handlers (som tidigare) ---
const toggleOptimizer = () => {
  updateControlSettings({ optimizer_enabled: !optimizerEnabled.value });
};
const handleMinAmpsChange = (event) => {
  const newMinAmps = parseInt(event.target.value, 10);
  updateControlSettings({ min_override_amps: newMinAmps });
};
const handleMinSocChange = (event) => {
  selectedMinSoc.value = parseInt(event.target.value, 10);
  updateControlSettings({ battery_min_soc: selectedMinSoc.value });
};
const handleMaxAmpsChange = (event) => {
  const newMax = parseInt(event.target.value, 10);
  updateControlSettings({ max_override_amps: newMax });
};
const applyBatteryPreset = (soc) => {
  selectedMinSoc.value = soc;
  updateControlSettings({ battery_min_soc: soc });
};

// --- Lifecycle Hooks (som tidigare) ---
onMounted(() => {
  fetchData();
  pollingInterval.value = setInterval(fetchData, 10000); // Poll var 10e sekund
});
onUnmounted(() => {
  if (pollingInterval.value) { clearInterval(pollingInterval.value); }
});

// --- Formatteringsfunktioner ---
const formatWatts = (value) => {
  if (value === null || value === undefined) return '-- W';
  if (Math.abs(value) >= 1000) { return `${(value / 1000).toFixed(1)} kW`; }
  return `${value.toFixed(0)} W`;
};
const formatAmps = (value) => {
  if (value === null || value === undefined) return '-- A';
  return `${value} A`;
};

const formatKwh = (value) => {
  if (value === null || value === undefined) return '-- kWh';
  // Visa med en decimal om inte heltal, annars ingen decimal
  return `${value.toFixed(Number.isInteger(value) ? 0 : 1)} kWh`;
};

const formatCacheAge = (seconds) => {
  if (!seconds || seconds < 1) return 'nyss';
  if (seconds < 60) return `${Math.floor(seconds)}s gammal`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m gammal`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h gammal`;
  return `${Math.floor(seconds / 86400)}d gammal`;
};

const formatTimestamp = (isoString) => {
  if (!isoString) return '--';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) { return isoString; } // Fallback om datumet är ogiltigt
};
const formatDecision = (decision, pending) => {
  if (pending !== null && pending !== undefined) { return `Väntar (${pending} A)...`; }
  if (decision !== null && decision !== undefined) { return `${decision} A`; }
  return '(ingen ändring)';
};
const formatSoc = (value) => {
  if (value === null || value === undefined) return '-- %';
  return `${value} %`;
};
const formatBatteryPower = (value) => {
  if (value === null || value === undefined) return '-- W';
  const abs = Math.abs(value);
  const str = abs >= 1000 ? `${(abs / 1000).toFixed(1)} kW` : `${abs.toFixed(0)} W`;
  if (value > BAT_THRESHOLD_W) return `↑ ${str}`;   // urladdar
  if (value < -BAT_THRESHOLD_W) return `↓ ${str}`;  // laddar
  return 'Vila';
};

</script>

<style>
/* Se till att Tailwind är importerat i din huvudsakliga CSS-fil */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
