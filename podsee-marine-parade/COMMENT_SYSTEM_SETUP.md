# Comment System Setup Guide

## Overview
This guide will help you set up the complete comment system for your Podsee Marine Parade platform.

## Architecture Summary

### Centre ID Strategy
- **centerId = postalCode**: Each centre is uniquely identified by its postal code
- This ensures comments persist across deployments and CSV reseeding
- Postal codes are stable and won't change unless a centre physically moves

### Database
- **Table**: `comments`
- **Features**: Comments, replies (1-level only), moderation
- **Security**: Row Level Security (RLS) policies for public read/insert, admin update/delete

### Frontend
- **Comment Section**: Appears in centre modal below action buttons
- **Features**: Username (sessionStorage), reply system, load more, validation
- **Admin Panel**: `/civictyperadmin` for moderation

---

## Step 1: Install Supabase Client

Run this command in your terminal:

```bash
cd podsee-marine-parade
npm install @supabase/supabase-js
```

---

## Step 2: Set Up Database Schema

1. Go to your Supabase project: https://zeekhdsgsxulkjlcuhdx.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql` (in the root of podsee-marine-parade folder)
5. Paste it into the SQL Editor
6. Click "Run" button
7. Verify you see "Success. No rows returned" message

This will create:
- `comments` table with proper indexes
- RLS policies for security
- Database functions for validation
- Trigger to prevent nested replies

---

## Step 3: Configure Admin Password

1. Open `podsee-marine-parade/.env`
2. Find the line: `VITE_ADMIN_SECRET=your_secure_admin_password_here`
3. Replace `your_secure_admin_password_here` with a strong password
4. Save the file

Example:
```
VITE_ADMIN_SECRET=MySecurePassword123!
```

---

## Step 4: Test the System

### Start Development Server

```bash
cd podsee-marine-parade
npm run dev
```

### Test Comments

1. Open your app in the browser
2. Navigate to the results page
3. Click on any tuition centre
4. Scroll down in the modal to see the comment section
5. Try posting a comment (you'll be prompted for a username first)
6. Try replying to a comment
7. Test "Load more" buttons

### Test Admin Panel

1. Navigate to: `http://localhost:5173/civictyperadmin`
2. Enter the admin password you set in Step 3
3. You should see all comments in a table
4. Test hiding/showing comments
5. Test deleting comments

---

## Step 5: Deploy to Production

### Update Environment Variables

When deploying to Vercel/production:

1. Go to your Vercel project settings
2. Add these environment variables:
   - `VITE_SUPABASE_URL` = `https://zeekhdsgsxulkjlcuhdx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key from .env)
   - `VITE_SUPABASE_SERVICE_KEY` = (your service key from .env)
   - `VITE_ADMIN_SECRET` = (your admin password)

2. Redeploy your application

---

## Features & Validation

### Comment Validation
- ✅ Maximum 500 characters
- ✅ No empty comments
- ✅ No URLs or links allowed
- ✅ XSS prevention (HTML tags stripped)
- ✅ Username required (stored in sessionStorage)

### Reply System
- ✅ Only 1-level deep (no nested replies)
- ✅ Replies only allowed on top-level comments
- ✅ Database trigger enforces this rule

### Performance
- ✅ Efficient queries with proper indexing
- ✅ Load more pagination (20 comments at a time)
- ✅ Lazy loading of replies (2 initial, load more on demand)
- ✅ No N+1 queries

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Public users: read + insert only
- ✅ Admin: update hidden field + delete
- ✅ Service role key for admin operations
- ✅ Password-protected admin panel

---

## Troubleshooting

### Comments not loading
1. Check browser console for errors
2. Verify Supabase credentials in `.env`
3. Verify SQL schema was run successfully
4. Check RLS policies are enabled

### Cannot post comments
1. Check for validation errors in the UI
2. Verify username is set (check sessionStorage)
3. Check for URL patterns in comment text
4. Verify character limit (500 max)

### Admin panel not working
1. Verify `VITE_ADMIN_SECRET` is set in `.env`
2. Check service role key is correct
3. Verify you're using the correct password

### Replies not working
1. Check if parent comment is a top-level comment
2. Verify database trigger is installed
3. Check browser console for errors

---

## Database Maintenance

### View all comments
```sql
SELECT * FROM comments ORDER BY created_at DESC;
```

### Count comments by centre
```sql
SELECT centre_id, COUNT(*) as comment_count 
FROM comments 
WHERE parent_comment_id IS NULL 
GROUP BY centre_id 
ORDER BY comment_count DESC;
```

### Find hidden comments
```sql
SELECT * FROM comments WHERE hidden = TRUE;
```

### Delete all comments (use with caution!)
```sql
DELETE FROM comments;
```

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure the SQL schema was run successfully

---

## Next Steps

Optional enhancements you can add later:
- Like/heart functionality
- Timestamps display
- User avatars
- Email notifications for replies
- Report/flag system
- Rate limiting
- Profanity filter
