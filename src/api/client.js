import axios from 'axios';

// Placeholder: Replace with actual tunnel URL in PRD3 (Meta-PRD Replacement Rule)
// PRD2: Using SOLARCHARGE_BACKEND_HOSTNAME as a stable placeholder hostname
const API_BASE_URL = "SOLARCHARGE_BACKEND_HOSTNAME";

/**
 * Check if a hostname is private (localhost, LAN IP, or .local domain)
 * @param {string} hostname - The hostname to check
 * @returns {boolean} - True if hostname is private/local
 */
function isPrivateHostname(hostname) {
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isMdns = hostname.endsWith(".local");
  return isLocalhost || isIPv4 || isMdns;
}

/**
 * Compute the API base URL based on the current browser location
 * @returns {string} - The base URL for API calls
 */
function computeBaseUrl() {
  const h = window.location.hostname;
  
  // Local and LAN access keep working during PRD1
  if (isPrivateHostname(h)) {
    return `http://${h}:8000`;
  }
  
  // Public build on GitHub Pages will use the placeholder (and fail by design in PRD1)
  return API_BASE_URL;
}

// Create and export the configured axios instance
export const api = axios.create({
  baseURL: computeBaseUrl(),
  timeout: 15000,
});

// Export the base URL for debugging purposes
export const currentBaseUrl = computeBaseUrl();
