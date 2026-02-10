# Podsee Marine Parade - Phase 1

Clean rebuild of the Podsee Marine Parade tuition search landing page.

## Tech Stack
- Vite + React
- React Router DOM
- Frontend only (no backend/database)
- Mobile-first design
- Google Maps API (Geocoding + Places)

## Features (Phase 1)
- Landing page with Level + Subject filters (chip UI)
- Single-select filters with validation
- Search navigation to /results with query params
- Results page with centre listings
- Location-based distance sorting
- WhatsApp CTA integration
- SMU footer

## Getting Started

```bash
npm install
npm run dev
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Google Maps API Key Setup

**IMPORTANT SECURITY NOTES:**

Your Google Maps API key must be properly restricted in Google Cloud Console to prevent unauthorized usage:

1. **HTTP Referrer Restrictions:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your API key
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domains:
     - For local development: `http://localhost:*`
     - For production: `https://yourdomain.com/*`

2. **API Restrictions:**
   - Under "API restrictions", select "Restrict key"
   - Enable only these APIs:
     - ✅ Geocoding API
     - ✅ Places API
   - This prevents the key from being used for other Google services

3. **Enable Required APIs:**
   - Geocoding API (for converting addresses to coordinates)
   - Places API (for location autocomplete)

**Why these restrictions matter:**
- The API key is visible in frontend code (this is normal for client-side apps)
- Restrictions ensure the key only works on your website
- Even if someone copies your key, it won't work elsewhere

## Location Features

The app includes location-based sorting:
- **Current Location**: Click "Current" button to use device GPS
- **Type Location**: Use the search box with Google Places autocomplete
- **Distance Display**: Shows "X.X km away" for each centre
- **Smart Sorting**: Centres sorted by distance when location is set
- **Caching**: Centre locations cached in localStorage to reduce API calls

## Project Structure
```
src/
├── components/
│   ├── ChipSelector.jsx    # Reusable chip selector component
│   ├── ChipSelector.css
│   └── CentreModal.jsx     # Centre details modal
├── pages/
│   ├── LandingPage.jsx     # Main landing page
│   ├── LandingPage.css
│   ├── ResultsPage.jsx     # Results with location sorting
│   └── ResultsPage.css
├── utils/
│   ├── dataLoader.js       # Excel data loading
│   └── locationService.js  # Google Maps integration
├── App.jsx                 # Router setup
└── main.jsx               # Entry point
```

## Next Steps (Future Phases)
- Enhanced filtering options
- Centre reviews/ratings
- Saved favourites
- Share functionality
