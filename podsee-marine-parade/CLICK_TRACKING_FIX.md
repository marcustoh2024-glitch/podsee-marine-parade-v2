# Click Tracking Bug Fix

## 🐛 Problem
- Frontend sends correct `clickType` ("WhatsApp", "Phone", "Website")
- Google Sheets always records "Website"
- Root cause: Google Apps Script is reading wrong field

## ✅ Frontend Changes Applied

### 1. Fixed `.env` file
```diff
- CLICK_LOG_WEBHOOK_URL=https://script.google.com/...
+ VITE_CLICK_LOG_WEBHOOK_URL=https://script.google.com/...
```

### 2. Added diagnostic logging to `CentreModal.jsx`
- Logs webhook URL status
- Logs full payload before sending
- Confirms request sent

## 🔧 Google Apps Script Fix Required

Your Google Apps Script is likely using `e.parameter.clickType` which doesn't work with JSON POST requests.

### Current (Buggy) Code:
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // ❌ WRONG: e.parameter only works for URL query params
  const clickType = e.parameter.clickType || 'Website'; // Always defaults to 'Website'
  
  sheet.appendRow([
    e.parameter.centreName,
    clickType,
    e.parameter.destinationUrl,
    // ...
  ]);
}
```

### Fixed Code:
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // ✅ CORRECT: Parse JSON from POST body
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    Logger.log('Failed to parse JSON: ' + error);
    return ContentService.createTextOutput('Error parsing JSON');
  }
  
  // Log for debugging
  Logger.log('Received data: ' + JSON.stringify(data));
  
  sheet.appendRow([
    data.centreName || 'unknown',
    data.clickType || 'unknown',  // No default to 'Website'
    data.destinationUrl || '',
    data.sourcePage || '',
    data.userAgent || '',
    data.timestamp || new Date().toISOString()
  ]);
  
  return ContentService.createTextOutput('Success');
}
```

## 📋 Deployment Steps

### Step 1: Update Google Apps Script
1. Go to: https://script.google.com/
2. Open your webhook script
3. Replace the `doPost` function with the fixed version above
4. Click "Deploy" → "Manage deployments"
5. Click "Edit" (pencil icon) on your current deployment
6. Change version to "New version"
7. Click "Deploy"
8. Copy the new webhook URL (if it changed)

### Step 2: Update Vercel Environment Variables
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. **Delete these variables:**
   - `CLICK_LOG_WEBHOOK_URL` (no VITE_ prefix)
   - `VITE_CLICK_LOG_WEBHOOK_URL_Whatsapp` (unused)
3. **Keep/Update this variable:**
   - `VITE_CLICK_LOG_WEBHOOK_URL` = your Google Apps Script webhook URL
4. Make sure it's enabled for all environments (Production, Preview, Development)

### Step 3: Deploy Frontend Changes
```bash
cd podsee-marine-parade
git add .
git commit -m "fix: Add diagnostic logging for click tracking and fix env var"
git push origin main
```

Vercel will auto-deploy. Wait 1-2 minutes for deployment to complete.

### Step 4: Clear Browser Cache
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Or open in Incognito/Private window

## 🧪 Testing & Verification

### 1. Open Browser DevTools
- Open Console tab
- Go to your site: https://podsee-tuition-marine-parade.vercel.app

### 2. Click Each Button Type
You should see console logs like:

**WhatsApp button:**
```
🔍 Click Tracking Debug: {clickType: "WhatsApp", destination: "https://wa.me/...", ...}
📤 Sending tracking payload: {centreName: "...", clickType: "WhatsApp", ...}
✅ Tracking request sent
```

**Call button:**
```
🔍 Click Tracking Debug: {clickType: "Phone", destination: "tel:...", ...}
📤 Sending tracking payload: {centreName: "...", clickType: "Phone", ...}
✅ Tracking request sent
```

**Website button:**
```
🔍 Click Tracking Debug: {clickType: "Website", destination: "https://...", ...}
📤 Sending tracking payload: {centreName: "...", clickType: "Website", ...}
✅ Tracking request sent
```

### 3. Check Google Sheets
- Wait 5-10 seconds
- Refresh your Google Sheet
- Verify the `clickType` column now shows:
  - "WhatsApp" for WhatsApp clicks
  - "Phone" for Call clicks
  - "Website" for Website clicks

### 4. Check Network Tab (Optional)
- DevTools → Network tab
- Filter: "script.google.com"
- Click a button
- Check Request Payload shows correct `clickType`

## 🎯 Expected Results

After all fixes:
- ✅ Console shows correct clickType being sent
- ✅ Google Sheets records correct clickType
- ✅ All three button types work correctly
- ✅ No more "Website" default for everything

## 🔍 Troubleshooting

### If clickType is still "Website":
1. Verify Google Apps Script was updated and redeployed
2. Check Apps Script logs: Script Editor → Executions
3. Verify the webhook URL in Vercel matches the deployed script

### If console shows "❌ Missing":
1. Verify `VITE_CLICK_LOG_WEBHOOK_URL` exists in Vercel
2. Redeploy from Vercel dashboard
3. Clear browser cache

### If no logs appear:
1. Check browser console for errors
2. Verify the modal is using the updated code
3. Try hard refresh or incognito mode
