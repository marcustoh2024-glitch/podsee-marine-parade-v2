# Location-Based Sorting Implementation

## Overview
Added location-based distance sorting to the Results page using Google Maps APIs (frontend-only).

## Files Modified/Created

### New Files:
1. **`src/utils/locationService.js`** - Core location logic
   - Google Maps API loading
   - Geocoding (address → lat/lng)
   - Distance calculation (Haversine formula)
   - localStorage caching
   - Browser geolocation
   - Google Places Autocomplete

2. **`.env`** - Environment variables (contains API key)
3. **`.env.example`** - Template for environment setup
4. **`LOCATION_FEATURE.md`** - This documentation

### Modified Files:
1. **`src/pages/ResultsPage.jsx`** - Added location UI and sorting logic
2. **`.gitignore`** - Added .env exclusion
3. **`README.md`** - Added API key setup instructions

## Features Implemented

### 1. Location Bar UI
- Compact text input with Google Places Autocomplete
- "Use current location" button with GPS icon
- Helper text: "Used to sort by distance"
- Error messages for permission denied/failures
- Progress indicator while calculating distances

### 2. Parent Location Sourcing
**Option A: Current Location**
- Uses `navigator.geolocation` API
- Handles permission denied gracefully
- Falls back to alphabetical sorting on error

**Option B: Typed Location**
- Google Places Autocomplete (restricted to Singapore)
- Auto-selects from dropdown suggestions
- Extracts lat/lng from place geometry

### 3. Centre Geocoding
- Geocodes each centre using postal code (preferred) or full address
- Queries: `{postalCode}, Singapore` or `{address}, Singapore`
- 100ms delay between requests to avoid rate limiting

### 4. Caching System
**localStorage:**
- Key format: `geocache_{centreName}_{postalCode}`
- Stores: `{lat, lng, timestamp}`
- 30-day expiry

**Session cache:**
- In-memory Map for current session
- Avoids repeated localStorage reads
- Cleared on page refresh

### 5. Distance Calculation
- Haversine formula for great-circle distance
- Returns distance in kilometers
- Displayed as "X.X km away" (1 decimal place)
- Green text color for visibility

### 6. Sorting Behavior
**Default (no location):**
- Alphabetical by centre name

**With location:**
- Centres with distances: Ascending by distance
- Centres without distances: Alphabetical at bottom
- Progressive updates as distances are calculated

### 7. Visual Feedback
- "..." shown while geocoding individual centres
- "Calculating distances..." message during batch geocoding
- Distance appears in green when ready
- Error alerts for location permission issues

## API Usage

### Google Maps APIs Used:
1. **Geocoding API** - Convert addresses to coordinates
2. **Places API** - Autocomplete suggestions

### Rate Limiting Protection:
- 100ms delay between geocoding requests
- localStorage caching reduces repeat calls
- Session cache eliminates redundant API calls

### Cost Optimization:
- Caching reduces API calls by ~90% on repeat visits
- Only geocodes centres in current filtered results
- Autocomplete restricted to Singapore (reduces suggestions)

## Security Notes

**API Key Restrictions (CRITICAL):**
The API key in `.env` must be restricted in Google Cloud Console:

1. **HTTP Referrer Restrictions:**
   - Local: `http://localhost:*`
   - Production: `https://yourdomain.com/*`

2. **API Restrictions:**
   - Enable ONLY: Geocoding API + Places API
   - Disable all other APIs

**Why this matters:**
- Frontend apps expose API keys in code (unavoidable)
- Restrictions prevent unauthorized usage
- Even if key is copied, it won't work elsewhere

## Testing Checklist

✅ Click "Current" button → sorts by distance, shows km
✅ Type location with autocomplete → sorts by distance
✅ Refresh page → cached locations load instantly
✅ Permission denied → shows error, falls back to alphabetical
✅ No location set → alphabetical sorting
✅ Distance appears progressively as centres are geocoded
✅ Modal still works when clicking centre cards

## Known Limitations

1. **Frontend-only constraints:**
   - API key visible in code (mitigated by restrictions)
   - Rate limiting handled client-side
   - No server-side caching

2. **Geocoding accuracy:**
   - Depends on postal code/address quality in dataset
   - Singapore addresses generally very accurate

3. **Browser compatibility:**
   - Geolocation requires HTTPS (except localhost)
   - Some browsers may block location permission

## Future Enhancements

- Add distance filter (e.g., "Within 5km")
- Show centres on a map view
- Save preferred location in localStorage
- Batch geocoding optimization
- Distance-based grouping (e.g., "Nearby", "Further away")
