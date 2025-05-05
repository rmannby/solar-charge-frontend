<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
        SolarCharge Status & Kontroll
      </h1>

      <div v-if="loading && !statusData" class="text-center text-gray-500 dark:text-gray-400">
        Laddar data...
      </div>
      <div v-if="error" class="text-center text-red-500 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900 rounded mb-4">
        {{ error }}
      </div>
      <div v-if="controlError" class="text-center text-orange-500 dark:text-orange-400 p-3 bg-orange-100 dark:bg-orange-900 rounded mb-4">
        Fel vid uppdatering av inställning: {{ controlError }}
      </div>

      <div v-if="statusData" class="space-y-3 mb-6">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <span class="font-semibold text-gray-600 dark:text-gray-300 text-right">Nät (P_han):</span>
          <span class="text-gray-900 dark:text-gray-100">{{ formatWatts(statusData.net_power_w) }}</span>

          <span class="font-semibold text-gray-600 dark:text-gray-300 text-right">Potentiell Effekt:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ formatWatts(statusData.limited_instant_target_power_w) }}</span>

          <span class="font-semibold text-gray-600 dark:text-gray-300 text-right">Laddeffekt:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ formatWatts(statusData.charge_power_w_calculated) }}</span>

          <span class="font-semibold text-gray-600 dark:text-gray-300 text-right">Wallbox Status:</span>
          <span :class="statusColor(statusData.wallbox_status)" class="px-2 py-0.5 rounded text-sm inline-block">
            {{ statusData.wallbox_status || '--' }}
          </span>

          <span class="font-semibold text-gray-600 dark:text-gray-300 text-right">Satt ström:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ formatAmps(statusData.estimated_set_amps) }}</span>

          <span class="font-semibold text-gray-600 dark:text-gray-300 text-right">Beslut:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ formatDecision(statusData.decision_amps, statusData.hysteresis_pending_amps) }}</span>
        </div>
        <div class="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
          Senast uppdaterad: {{ formatTimestamp(statusData.timestamp) }}
        </div>
      </div>

       <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center mb-3">Inställningar</h2>

        <div class="flex items-center justify-between">
          <label for="optimizerSwitch" class="font-medium text-gray-700 dark:text-gray-300">Optimering Aktiv:</label>
          <button
            id="optimizerSwitch"
            @click="toggleOptimizer"
            :class="optimizerEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
            class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          <label for="minAmpsSelect" class="font-medium text-gray-700 dark:text-gray-300">Lägsta Laddström:</label>
          <select
            id="minAmpsSelect"
            v-model="selectedMinAmps"
            @change="handleMinAmpsChange"
            :disabled="isUpdatingControl"
            class="block w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1"
          >
            <option v-for="amp in ampOptions" :key="amp" :value="amp">
              {{ `${amp} A` }}
            </option>
          </select>
        </div>
         <div v-if="isUpdatingControl" class="text-center text-sm text-gray-500 dark:text-gray-400">
            Uppdaterar inställning...
         </div>
      </div>


      <div v-if="!statusData && !loading && !error" class="text-center text-gray-500 dark:text-gray-400 mt-4">
        Ingen data tillgänglig.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import axios from 'axios';

// --- Reactive State ---
const statusData = ref(null);
const loading = ref(true);
const error = ref(null);
const controlError = ref(null);
const pollingInterval = ref(null);
const isUpdatingControl = ref(false);

// --- Control State ---
const optimizerEnabled = ref(true);
const selectedMinAmps = ref(0);

// --- API Configuration ---
const API_BASE_URL = 'http://192.168.87.53:8000'; // Använd din PC's IP
const STATUS_API_URL = `${API_BASE_URL}/api/v1/status`;
const CONTROL_API_URL = `${API_BASE_URL}/api/v1/control`;

// --- Options for Dropdown (JUSTERAD) ---
const ampOptions = computed(() => {
  // Generera array [0, 6, 7, 8, ..., 16]
  // Antaganden: Min laddström = 6A, Max laddström = 16A. Justera vid behov.
  const minChargeableAmps = 6;
  const maxChargeableAmps = 16;
  const options = [0]; // Starta med 0
  for (let i = minChargeableAmps; i <= maxChargeableAmps; i++) {
    options.push(i);
  }
  return options;
});

// --- Fetch Status Data Function ---
const fetchData = async () => {
  if (!statusData.value) { loading.value = true; }
  error.value = null;
  try {
    const response = await axios.get(STATUS_API_URL, { timeout: 10000 });
    statusData.value = response.data;
    if (!isUpdatingControl.value) {
        optimizerEnabled.value = statusData.value.optimizer_enabled;
        // Säkerställ att värdet från API finns i våra options, annars sätt till 0
        if (ampOptions.value.includes(statusData.value.min_override_amps)) {
             selectedMinAmps.value = statusData.value.min_override_amps;
        } else {
             console.warn(`API returned min_override_amps (${statusData.value.min_override_amps}) not in options, defaulting to 0.`);
             selectedMinAmps.value = 0;
        }
    }
    console.log("Status data fetched:", statusData.value);
  } catch (err) {
    console.error("Error fetching status data:", err);
    if (err.response) { error.value = `Serverfel ${err.response.status}: ${err.response.data?.detail || err.message}`; }
    else if (err.request) { error.value = 'Ingen kontakt med API:et (status).'; }
    else { error.value = `Klientfel (status): ${err.message}`; }
  } finally {
    loading.value = false;
  }
};

// --- Update Control Settings Function ---
const updateControlSettings = async (settings) => {
  if (isUpdatingControl.value) return;
  isUpdatingControl.value = true;
  controlError.value = null;
  console.log("[Control] Sending update:", settings);
  try {
    const response = await axios.put(CONTROL_API_URL, settings, { timeout: 15000 });
    console.log("[Control] Update successful:", response.data);
    if (response.data.optimizer_enabled !== undefined) {
        optimizerEnabled.value = response.data.optimizer_enabled;
    }
    if (response.data.min_override_amps !== undefined) {
         // Säkerställ att värdet från API finns i våra options
         if (ampOptions.value.includes(response.data.min_override_amps)) {
             selectedMinAmps.value = response.data.min_override_amps;
         } else {
             selectedMinAmps.value = 0; // Fallback till 0 om API returnerar ogiltigt värde
         }
    }
  } catch (err) {
    console.error("[Control] Error updating settings:", err);
    if (err.response) { controlError.value = `Serverfel ${err.response.status}: ${err.response.data?.detail || err.message}`; }
    else if (err.request) { controlError.value = 'Ingen kontakt med API:et (kontroll).'; }
    else { controlError.value = `Klientfel (kontroll): ${err.message}`; }
  } finally {
    isUpdatingControl.value = false;
  }
};

// --- Event Handlers ---
const toggleOptimizer = () => {
  updateControlSettings({ optimizer_enabled: !optimizerEnabled.value });
};
const handleMinAmpsChange = (event) => {
  const newMinAmps = parseInt(event.target.value, 10);
  updateControlSettings({ min_override_amps: newMinAmps });
};

// --- Lifecycle Hooks ---
onMounted(() => {
  console.log("Component mounted. Starting data fetch.");
  fetchData();
  pollingInterval.value = setInterval(fetchData, 10000);
});
onUnmounted(() => {
  console.log("Component unmounted. Clearing interval.");
  if (pollingInterval.value) { clearInterval(pollingInterval.value); }
});

// --- Formatting Helpers ---
const formatWatts = (value) => {
  if (value === null || value === undefined) return '-- W';
  if (Math.abs(value) >= 1000) { return `${(value / 1000).toFixed(1)} kW`; }
  return `${value.toFixed(0)} W`;
};
const formatAmps = (value) => {
  if (value === null || value === undefined) return '-- A';
  return `${value} A`;
};
const formatTimestamp = (isoString) => {
  if (!isoString) return '--';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) { return isoString; }
};
const formatDecision = (decision, pending) => {
  if (pending !== null && pending !== undefined) { return `Väntar (${pending} A)...`; }
  if (decision !== null && decision !== undefined) { return `${decision} A`; }
  return '(ingen ändring)';
};

// --- Dynamic Styling ---
const statusColor = (status) => {
  status = status ? status.toLowerCase() : '';
  if (status.includes('charging')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status.includes('paused')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  if (status.includes('waiting') || status.includes('ready') || status.includes('connected')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (status.includes('error')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

</script>

<style>
/* Ensure Tailwind is imported in your main CSS file */
</style>
