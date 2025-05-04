<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
        SolarCharge Status
      </h1>

      <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400">
        Laddar data...
      </div>
      <div v-if="error" class="text-center text-red-500 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900 rounded">
        Fel vid hämtning av data: {{ error }}
      </div>

      <div v-if="statusData && !loading && !error" class="space-y-3">
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

        <div class="text-center text-xs text-gray-400 dark:text-gray-500 pt-4">
          Senast uppdaterad: {{ formatTimestamp(statusData.timestamp) }}
        </div>
      </div>

      <div v-if="!statusData && !loading && !error" class="text-center text-gray-500 dark:text-gray-400 mt-4">
        Ingen data tillgänglig.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios'; // Using axios for API calls

// --- Reactive State ---
const statusData = ref(null); // Holds the data from the API
const loading = ref(true);    // Tracks loading state
const error = ref(null);      // Holds any error message
const pollingInterval = ref(null); // Holds the interval timer ID

// --- API Configuration ---
// !!! VIKTIGT: Använd din dators IP-adress här !!!
const API_URL = 'http://192.168.87.53:8000/api/v1/status'; // Ersätt med din IP om den ändrats

// --- Fetch Data Function ---
const fetchData = async () => {
  console.log(`[Mobile Debug] Attempting to fetch from: ${API_URL}`); // Log URL
  error.value = null; // Clear previous errors
  // loading.value = true; // Keep loading false for polls
  try {
    // Added explicit timeout (15 seconds)
    const response = await axios.get(API_URL, { timeout: 15000 });
    console.log("[Mobile Debug] Request successful (status code):", response.status); // Log status code
    console.log("[Mobile Debug] Response data:", response.data); // Log raw data
    statusData.value = response.data; // Update reactive state with fetched data
    console.log("[Mobile Debug] State updated successfully."); // Confirm state update
  } catch (err) {
    // Log detailed error information
    console.error("[Mobile Debug] Error fetching data (raw error object):", err);
    console.error("[Mobile Debug] Error config:", err.config); // Log request config
    console.error("[Mobile Debug] Error request:", err.request); // Log request object
    console.error("[Mobile Debug] Error response:", err.response); // Log response object

    // Set user-friendly error message based on error type
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
       error.value = `Timeout vid anslutning till API:et (${err.message})`;
       console.error("[Mobile Debug] Request timed out.");
    } else if (err.response) {
      // Server responded with an error status code (4xx or 5xx)
      error.value = `Serverfel ${err.response.status}: ${err.response.data?.detail || err.message}`;
      console.error("[Mobile Debug] Server responded with error status.");
    } else if (err.request) {
      // Request was made, but no response received (network error, CORS, etc.)
      // This seems to be the case, despite server logs showing 200 OK.
      error.value = 'Ingen kontakt med API:et (err.request). Kontrollera nätverk/brandvägg/URL.';
      console.error("[Mobile Debug] No response received (err.request exists). This is unexpected given server logs.");
    } else {
      // Other errors (e.g., setting up the request)
      error.value = `Okänt klientfel: ${err.message}`;
      console.error("[Mobile Debug] Unknown error during request setup.");
    }
    statusData.value = null; // Clear data on error
  } finally {
    loading.value = false; // Set loading to false after fetch attempt
    console.log("[Mobile Debug] Fetch attempt finished."); // Log end of attempt
  }
};


// --- Lifecycle Hooks ---
onMounted(() => {
  console.log("Component mounted. Starting data fetch.");
  fetchData(); // Fetch data immediately when component mounts

  // Set up polling to fetch data every 10 seconds
  pollingInterval.value = setInterval(fetchData, 10000); // 10000 ms = 10 seconds
});

onUnmounted(() => {
  console.log("Component unmounted. Clearing interval.");
  // Clear the interval when the component is destroyed to prevent memory leaks
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});

// --- Formatting Helpers ---
const formatWatts = (value) => {
  if (value === null || value === undefined) return '-- W';
  // Show kW for larger values for better readability
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)} kW`;
  }
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
    // Format to local time and common format
    return date.toLocaleString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // year: 'numeric', // Optional: Add year/month/day if needed
      // month: '2-digit',
      // day: '2-digit',
    });
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return isoString; // Return raw string on error
  }
};

const formatDecision = (decision, pending) => {
  if (pending !== null && pending !== undefined) {
    return `Väntar (${pending} A)...`;
  }
  if (decision !== null && decision !== undefined) {
    return `${decision} A`;
  }
  return '(ingen ändring)';
};

// --- Dynamic Styling ---
const statusColor = (status) => {
  // Return Tailwind classes based on Wallbox status for visual feedback
  status = status ? status.toLowerCase() : '';
  if (status.includes('charging')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (status.includes('paused')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  if (status.includes('waiting') || status.includes('ready') || status.includes('connected')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (status.includes('error')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'; // Default/Unknown
};

</script>

<style>
/* Include Tailwind base, components, and utilities */
/* This is typically done in your main CSS file (e.g., src/style.css) */
/* Ensure your src/style.css or equivalent imports Tailwind:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
*/

/* Optional: Add minor global styles if needed */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
