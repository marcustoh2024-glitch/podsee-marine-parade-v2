/**
 * Location Service
 * Handles Google Maps API loading, geocoding, distance calculation, and caching
 */

const CACHE_PREFIX = 'geocache_';
const CACHE_EXPIRY_DAYS = 30;

// In-memory cache for current session
const sessionCache = new Map();

/**
 * Load Google Maps API dynamically
 */
export function loadGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Check if script is already being loaded
    if (window.googleMapsLoading) {
      // Wait for existing load to complete
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve(window.google);
        }
      }, 100);
      return;
    }

    window.googleMapsLoading = true;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.googleMapsLoading = false;
      resolve(window.google);
    };

    script.onerror = () => {
      window.googleMapsLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Get cached centre location from localStorage
 */
export function getCachedCentreLocation(centreName, postalCode) {
  const cacheKey = `${CACHE_PREFIX}${centreName}_${postalCode}`;
  
  // Check session cache first
  if (sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey);
  }

  // Check localStorage
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - data.timestamp;
      const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (age < maxAge) {
        const location = { lat: data.lat, lng: data.lng };
        sessionCache.set(cacheKey, location);
        return location;
      } else {
        // Expired, remove it
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }

  return null;
}

/**
 * Save centre location to cache
 */
export function setCachedCentreLocation(centreName, postalCode, lat, lng) {
  const cacheKey = `${CACHE_PREFIX}${centreName}_${postalCode}`;
  const location = { lat, lng };

  // Save to session cache
  sessionCache.set(cacheKey, location);

  // Save to localStorage
  try {
    const data = {
      lat,
      lng,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving to cache:', error);
  }
}

/**
 * Geocode a centre address to get lat/lng
 */
export async function geocodeCentre(centre) {
  // Check cache first
  const cached = getCachedCentreLocation(centre.name, centre.postalCode);
  if (cached) {
    return cached;
  }

  try {
    const google = await loadGoogleMapsAPI();
    const geocoder = new google.maps.Geocoder();

    // Build query - prefer postal code for Singapore addresses
    let query = '';
    if (centre.postalCode) {
      query = `${centre.postalCode}, Singapore`;
    } else if (centre.address) {
      query = `${centre.address}, Singapore`;
    } else {
      throw new Error('No address or postal code available');
    }

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };

          // Cache the result
          setCachedCentreLocation(centre.name, centre.postalCode, location.lat, location.lng);
          
          resolve(location);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding centre:', centre.name, error);
    throw error;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using browser geolocation
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Initialize Google Places Autocomplete on an input element
 */
export async function initializeAutocomplete(inputElement, onPlaceSelected) {
  try {
    const google = await loadGoogleMapsAPI();
    
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      componentRestrictions: { country: 'sg' }, // Restrict to Singapore
      fields: ['geometry', 'formatted_address']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address
        };
        onPlaceSelected(location);
      }
    });

    return autocomplete;
  } catch (error) {
    console.error('Error initializing autocomplete:', error);
    throw error;
  }
}
