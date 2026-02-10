# Marine Parade Tuition Centre Search - Implementation Notes

## What Was Implemented

### ✅ Complete Features
1. **Dataset Loading & Parsing**
   - Excel file loaded from `/public` folder
   - Parses both `centres` and `offerings` sheets
   - Frontend-only implementation using xlsx library

2. **Subject & Level Normalization**
   - Math/Mathematics → Mathematics
   - POA/Principle of Accounts (POA) → POA
   - J1/J2 levels ignored (only JC1/JC2 shown)
   - S5 included in filter options

3. **Landing Page (/) - Filter Selection**
   - Dynamic Level filter (P1-P6, S1-S5, JC1-JC2, IB, Y5(IB), Y6(IB))
   - Dynamic Subject filter (19 subjects including extras from dataset)
   - Both filters required before search
   - Navigates to /results with query params

4. **Results Page (/results) - Centre Listing**
   - "Back to filters" button (resets and returns to /)
   - Title "Tuition Centres"
   - Filter chips showing selected Level & Subject
   - "X centres found" count
   - Cards sorted alphabetically by centre_name showing:
     - Centre name
     - Description (first non-empty note from offerings)
     - Address + postal code
     - Full list of levels offered
     - Full list of subjects offered

5. **Science Umbrella Logic**
   - Subject = "Science" matches: Science OR Biology OR Chemistry OR Physics
   - Other subjects match exactly

6. **Centre Detail Modal**
   - Opens on card click (not a new page)
   - Shows centre name, address, postal code
   - Primary action button:
     - WhatsApp → opens wa.me/<number>
     - LandLine → opens tel:<number>
   - Secondary action: Visit Website (opens in new tab)
   - Close X button

## File Structure

```
podsee-marine-parade/
├── public/
│   └── database_ready_final (Marine Parade).xlsx  ← Dataset
├── src/
│   ├── components/
│   │   ├── CentreModal.jsx                        ← NEW: Modal component
│   │   ├── MaterialChipSelector.jsx               ← Existing chip selector
│   │   └── ...
│   ├── pages/
│   │   ├── LandingPage.jsx                        ← UPDATED: Dynamic filters
│   │   └── ResultsPage.jsx                        ← UPDATED: Full results list
│   ├── utils/
│   │   └── dataLoader.js                          ← NEW: Data loading & filtering
│   └── ...
```

## Key Functions (dataLoader.js)

### Normalization
- `normalizeSubject(subject)` - Maps Math→Mathematics, POA variants→POA
- `normalizeLevel(level)` - Returns null for J1/J2 (ignored)

### Data Loading
- `loadCentresData()` - Loads Excel, parses sheets, aggregates centre data
  - Returns array of centres with levels/subjects as sorted arrays
  - Uses first non-empty note as description

### Filtering
- `getFilterOptions(centres)` - Extracts unique levels/subjects for filters
- `filterCentres(centres, level, subject)` - Filters by level AND subject
  - Implements Science umbrella logic
  - Returns alphabetically sorted results

## Customization Guide

### To Change Subject Order
Edit `SUBJECT_ORDER` array in `src/utils/dataLoader.js` (lines 17-35)

### To Change Level Order
Edit `LEVEL_ORDER` array in `src/utils/dataLoader.js` (lines 38-43)

### To Add New Subject Normalization
Add to `SUBJECT_NORMALIZATION` object in `src/utils/dataLoader.js` (lines 4-9)

### To Change Description Logic
Modify the note aggregation in `loadCentresData()` function (lines 73-76)
- Current: First non-empty note
- Alternative: Change to longest note, join with separator, etc.

## Manual Test Checklist

### Landing Page
- [ ] Logo displays correctly
- [ ] Level chips load dynamically (should show P1-P6, S1-S5, JC1-JC2, IB, Y5(IB), Y6(IB))
- [ ] Subject chips load dynamically (19 subjects)
- [ ] Error shows if search clicked without both selections
- [ ] Search navigates to /results with correct query params

### Results Page
- [ ] "Back to filters" returns to / and resets selections
- [ ] Title shows "Tuition Centres"
- [ ] Filter chips display selected level and subject
- [ ] Count shows correct number of centres
- [ ] Cards display all required info (name, description, address, levels, subjects)
- [ ] Cards sorted alphabetically by name
- [ ] Clicking card opens modal

### Science Umbrella Test
- [ ] Select any level + "Science" subject
- [ ] Results should include centres offering Science OR Biology OR Chemistry OR Physics
- [ ] Select same level + "Biology" subject
- [ ] Results should ONLY include centres offering Biology (not other sciences)

### Modal
- [ ] Opens on card click
- [ ] Shows centre name, address, postal code
- [ ] WhatsApp button opens wa.me link (no prefill)
- [ ] Call button opens tel: link for landlines
- [ ] Website button opens in new tab
- [ ] Close X button works

### Edge Cases
- [ ] Centres with no description show without description field
- [ ] Centres with no website don't show website button
- [ ] Centres with no contact number don't show contact button
- [ ] Empty results show "0 centres found"

## Running the App

```bash
cd podsee-marine-parade
npm install
npm run dev
```

Visit http://localhost:5173

## Build for Production

```bash
npm run build
```

Output in `dist/` folder.
