# Enhanced Error Reporting Features

## Overview
The Solar Charge Frontend now includes comprehensive error reporting and connection status monitoring, providing users with clear visual feedback about the system's health and data freshness.

## Features

### 1. Connection Status Badge
A prominent badge at the top of the dashboard shows the current connection state:

- **🟢 Live data** - Real-time connection to wallbox, fresh data
- **🟡 Cachad data** - Connected but using cached values (shows cache age)
- **🟡 Begränsad** - Rate limited due to too many API calls
- **🟠 Tillfälligt fel** - Transient connection error, retrying
- **🔴 Offline** - No connection to wallbox

### 2. Visual Indicators

#### Data Freshness
- Clock icon appears on the main status when displaying cached data
- Cache age displayed in the connection badge (e.g., "5m gammal")
- Timestamp shows cache warning in yellow when data is stale

#### Color-Coded Status
The main status panel changes color based on connection health:
- **Green** shades for normal charging (darker when cached)
- **Orange** for rate limiting or transient errors
- **Red** for offline state or critical errors

### 3. Control Disabling

When the wallbox is disconnected:
- Controls panel becomes semi-transparent (60% opacity)
- Warning message appears explaining why controls are disabled
- Toggle switches and selectors are disabled with cursor change
- Tooltip on hover explains the disabled state

### 4. Enhanced Error Messages

The system now displays:
- **Connection errors** with specific details
- **Wallbox errors** in a separate section
- **Rate limiting** warnings
- **Cache age** information

## Implementation Details

### New API Fields Utilized

The frontend now processes these backend fields:
```javascript
{
  wallbox_connected: boolean,        // Is wallbox reachable?
  wallbox_client_state: string,      // online|rate_limited|transient_error|offline
  wallbox_last_error: string,        // Last error message
  data_from_cache: boolean,          // Is data from cache?
  cache_age_seconds: number,         // Age of cached data
  connection_error: boolean          // General connection error flag
}
```

### Computed Properties

The following reactive properties manage the UI state:
- `isWallboxConnected` - Controls enable/disable state
- `connectionStatusClass` - Badge background styling
- `connectionIndicatorClass` - Status dot color and animation
- `connectionStatusText` - Human-readable status with emoji
- `wallboxDisconnectedMessage` - Context-specific error message

### User Experience Improvements

1. **Clear Visual Hierarchy**
   - Most important info (connection state) at the top
   - Progressive disclosure of error details
   - Consistent color coding throughout

2. **Graceful Degradation**
   - App remains usable with cached data
   - Clear indication when controls won't work
   - Helpful error messages guide users

3. **Real-time Feedback**
   - Pulsing indicators for active states
   - Immediate visual response to connection changes
   - Cache age updates automatically

## Testing the Features

### Simulating Different States

1. **Live Data (Normal Operation)**
   - Backend connected to wallbox
   - Fresh data flowing
   - All controls enabled

2. **Cached Data**
   - Backend loses connection temporarily
   - Shows last known values
   - Cache age indicator appears

3. **Rate Limited**
   - Too many API calls to wallbox
   - Yellow warning state
   - Controls may be limited

4. **Offline State**
   - Complete loss of wallbox connection
   - Red indicators
   - Controls fully disabled

## Mobile Responsiveness

All error reporting features are fully responsive:
- Connection badge scales appropriately
- Error messages wrap correctly
- Touch targets remain accessible
- Visual indicators clearly visible on small screens

## Accessibility

- ARIA labels for screen readers
- Sufficient color contrast ratios
- Keyboard navigation support
- Descriptive tooltips for disabled states

## Future Enhancements

Potential improvements for future versions:
- Historical connection status graph
- Push notifications for critical errors
- Automatic retry with exponential backoff visualization
- Connection quality metrics (latency, success rate)
- User-configurable alert thresholds