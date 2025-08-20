<template>
  <div class="min-h-screen bg-gray-800 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
    <div class="w-full max-w-sm">
      <div
        :class="topStatusBackgroundClass"
        class="rounded-lg p-4 mb-6 flex items-center justify-center space-x-3 shadow-lg"
      >
        <component :is="topStatusIcon" class="h-8 w-8 text-white" />
        <span class="text-2xl font-bold text-white">{{ topStatusText }}</span>
      </div>

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
            <CarElectricOutlineIcon class="h-8 w-8 text-green-400" />
          </div>
          <div class="text-sm text-gray-400">Laddning</div>
          <div class="text-xl font-semibold">{{ formatWatts(statusData?.charge_power_w_calculated) }}</div>
        </div>

        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="text-sm text-gray-400">Överskott</div>
          <div class="text-xl font-semibold">{{ formatWatts(calculatedSurplus) }}</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <EvStationIcon class="h-8 w-8 text-purple-400" />
          </div>
          <div class="text-sm text-gray-400">Satt Ström</div>
          <div class="text-xl font-semibold">{{ formatAmps(statusData?.estimated_set_amps) }}</div>
        </div>

        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <ScaleIcon class="h-8 w-8 text-orange-400" />
          </div>
          <div class="text-sm text-gray-400">Tillagd Energi</div>
          <div class="text-xl font-semibold">{{ formatKwh(statusData?.added_energy_kwh) }}</div>
        </div>
        <div class="bg-gray-700 p-3 rounded-lg shadow-md text-center">
          <div class="flex justify-center mb-1">
            <CogsIcon class="h-8 w-8 text-teal-400" />
          </div>
          <div class="text-sm text-gray-400">Beslut</div>
          <div class="text-xl font-semibold">{{ formatDecision(statusData?.decision_amps, statusData?.hysteresis_pending_amps) }}</div>
        </div>
      </div>


      <div class="bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold text-center mb-4">Inställningar</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label for="optimizerSwitch" class="font-medium">Optimering Aktiv:</label>
            <button
              id="optimizerSwitch"
              @click="toggleOptimizer"
              :class="optimizerEnabled ? 'bg-green-500' : 'bg-gray-500'"
              class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
              role="switch"
              :aria-checked="optimizerEnabled.toString()"
              :disabled="isUpdatingControl"
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
            <label for="minAmpsSelect" class="font-medium">Lägsta Laddström:</label>
            <select
              id="minAmpsSelect"
              v-model="selectedMinAmps"
              @change="handleMinAmpsChange"
              :disabled="isUpdatingControl"
              class="block w-24 rounded-md border-gray-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-600 text-gray-100 p-1.5 text-sm"
            >
              <option v-for="amp in ampOptions" :key="amp" :value="amp">
                {{ `${amp} A` }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading && !statusData" class="text-center text-gray-400 mt-4">Laddar data...</div>
      <div v-if="error" class="text-center text-red-400 mt-4 p-2 bg-red-900 bg-opacity-50 rounded">{{ error }}</div>
      <div v-if="controlError" class="text-center text-orange-400 mt-4 p-2 bg-orange-900 bg-opacity-50 rounded">{{ controlError }}</div>
      <div v-if="isUpdatingControl" class="text-center text-sm text-gray-400 mt-2">Uppdaterar inställning...</div>

      <div v-if="statusData" class="text-center text-xs text-gray-500 mt-6">
        Senast uppdaterad: {{ formatTimestamp(statusData.timestamp) }}
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

// --- API Endpoints ---
// Using centralized API client from src/api/client.js
const STATUS_API_PATH = '/api/v1/status';
const CONTROL_API_PATH = '/api/v1/control';

// Log current API base URL for debugging
console.log('[API] Using base URL:', currentBaseUrl);

// --- Beräknade Värden (som tidigare) ---
const calculatedSurplus = computed(() => {
  if (statusData.value?.net_power_w !== undefined && statusData.value.net_power_w < 0) {
    return -statusData.value.net_power_w; // Exporterar, så positivt överskott
  }
  return 0; // Importerar eller noll, så inget överskott
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
  const wbStatus = statusData.value.wallbox_status.toLowerCase();
  if (wbStatus.includes('charging')) return 'bg-green-500';
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
            console.warn(`API returned min_override_amps (${statusData.value.min_override_amps}) not in options, defaulting to 0.`);
            selectedMinAmps.value = 0;
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

// NYTT: Formatteringsfunktion för kWh
const formatKwh = (value) => {
  if (value === null || value === undefined) return '-- kWh';
  // Visa med en decimal om inte heltal, annars ingen decimal
  return `${value.toFixed(Number.isInteger(value) ? 0 : 1)} kWh`;
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

</script>

<style>
/* Se till att Tailwind är importerat i din huvudsakliga CSS-fil */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
