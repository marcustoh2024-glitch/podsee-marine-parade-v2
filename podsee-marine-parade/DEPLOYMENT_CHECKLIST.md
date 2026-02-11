# Deployment Checklist

## 🎯 Pre-Deployment Checklist

### ✅ Database Setup
- [ ] Logged into Supabase dashboard (https://zeekhdsgsxulkjlcuhdx.supabase.co)
- [ ] Opened SQL Editor
- [ ] Copied content from `supabase-schema.sql`
- [ ] Ran SQL script successfully
- [ ] Verified "Success. No rows returned" message
- [ ] Checked that `comments` table exists in Table Editor

### ✅ Environment Configuration
- [ ] Opened `.env` file
- [ ] Verified `VITE_SUPABASE_URL` is set
- [ ] Verified `VITE_SUPABASE_ANON_KEY` is set
- [ ] Verified `VITE_SUPABASE_SERVICE_KEY` is set
- [ ] Changed `VITE_ADMIN_SECRET` to a secure password
- [ ] Saved `.env` file

### ✅ Dependencies
- [ ] Ran `npm install` in `podsee-marine-parade` folder
- [ ] Verified `@supabase/supabase-js` is installed
- [ ] No installation errors

### ✅ Local Testing
- [ ] Started dev server with `npm run dev`
- [ ] Opened app in browser
- [ ] Navigated to results page
- [ ] Clicked on a tuition centre
- [ ] Scrolled down to see comment section
- [ ] Posted a test comment (entered username when prompted)
- [ ] Replied to the test comment
- [ ] Verified reply appears nested under parent
- [ ] Tested "Load more" buttons (if applicable)
- [ ] Visited `/civictyperadmin`
- [ ] Logged in with admin password
- [ ] Verified test comments appear in admin panel
- [ ] Tested hiding a comment
- [ ] Verified hidden comment doesn't show in modal
- [ ] Tested showing the comment again
- [ ] Tested deleting a comment
- [ ] Verified deleted comment is removed

### ✅ Validation Testing
- [ ] Tried posting empty comment → Should reject
- [ ] Tried posting comment with URL → Should reject
- [ ] Tried posting comment > 500 chars → Should reject
- [ ] Tried replying to a reply → Should reject
- [ ] Tried posting without username → Should prompt
- [ ] Verified username persists in session
- [ ] Opened new tab → Username should be gone
- [ ] Re-entered username → Should persist again

### ✅ Edge Case Testing
- [ ] Tested with centre that has no comments
- [ ] Tested with centre that has many comments
- [ ] Tested with comment that has no replies
- [ ] Tested with comment that has many replies
- [ ] Tested rapid clicking (no duplicate posts)
- [ ] Tested network error handling (disconnect wifi briefly)

---

## 🚀 Production Deployment

### Step 1: Prepare Environment Variables
```bash
# Copy these values from your .env file:
VITE_SUPABASE_URL=https://zeekhdsgsxulkjlcuhdx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_SUPABASE_SERVICE_KEY=eyJhbGci...
VITE_ADMIN_SECRET=your_secure_password
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
VITE_CLICK_LOG_WEBHOOK_URL=https://script.google.com...
```

### Step 2: Configure Vercel
- [ ] Logged into Vercel dashboard
- [ ] Selected your project
- [ ] Went to Settings → Environment Variables
- [ ] Added all 6 environment variables above
- [ ] Set environment to "Production"
- [ ] Saved changes

### Step 3: Deploy
- [ ] Committed all changes to git
- [ ] Pushed to main branch
- [ ] Vercel auto-deploys (or trigger manual deploy)
- [ ] Waited for deployment to complete
- [ ] Checked deployment logs for errors

### Step 4: Production Testing
- [ ] Visited production URL
- [ ] Tested posting a comment
- [ ] Tested replying to a comment
- [ ] Visited `/civictyperadmin` on production
- [ ] Logged in with admin password
- [ ] Tested moderation features
- [ ] Verified all features work as expected

### Step 5: Monitor
- [ ] Checked Supabase dashboard for query performance
- [ ] Checked Vercel analytics for errors
- [ ] Monitored first few user comments
- [ ] Verified no console errors in browser

---

## 🔒 Security Checklist

### Environment Variables
- [ ] `.env` file is in `.gitignore`
- [ ] Never committed `.env` to git
- [ ] Admin secret is strong (12+ characters, mixed case, numbers, symbols)
- [ ] Service role key is kept secret (never exposed to frontend)

### Supabase Security
- [ ] RLS policies are enabled on `comments` table
- [ ] Tested that public users can't update/delete
- [ ] Tested that admin operations require service role
- [ ] Verified URL blocking works at database level

### Admin Panel
- [ ] Admin route is not linked from public pages
- [ ] Admin password is not default value
- [ ] Admin password is documented securely (password manager)
- [ ] Only trusted people have admin password

---

## 📊 Post-Deployment Monitoring

### Week 1
- [ ] Check comment volume daily
- [ ] Monitor for spam or inappropriate content
- [ ] Check Supabase query performance
- [ ] Verify no errors in logs
- [ ] Test admin moderation if needed

### Week 2-4
- [ ] Check comment volume weekly
- [ ] Review most active centres
- [ ] Check database size growth
- [ ] Optimize if needed

### Ongoing
- [ ] Regular admin panel checks
- [ ] Moderate inappropriate content
- [ ] Monitor database performance
- [ ] Plan future enhancements

---

## 🐛 Troubleshooting Guide

### Comments Not Loading
**Symptoms**: Comment section shows loading spinner forever

**Checks**:
1. Open browser console → Check for errors
2. Check Supabase credentials in environment variables
3. Verify SQL schema was run successfully
4. Check RLS policies are enabled
5. Test Supabase connection in SQL Editor

**Fix**:
```javascript
// Check supabaseClient.js has correct credentials
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Cannot Post Comments
**Symptoms**: Error message when trying to post

**Checks**:
1. Check error message in UI
2. Check browser console for details
3. Verify username is set (check sessionStorage)
4. Check comment doesn't contain URLs
5. Check comment length (max 500 chars)

**Fix**:
```javascript
// Clear sessionStorage and try again
sessionStorage.removeItem('podsee_username');
```

### Admin Panel Not Working
**Symptoms**: Cannot login or see comments

**Checks**:
1. Verify `VITE_ADMIN_SECRET` is set
2. Check service role key is correct
3. Verify password matches .env value
4. Check browser console for errors

**Fix**:
```javascript
// Verify admin secret
console.log(import.meta.env.VITE_ADMIN_SECRET);
```

### Replies Not Working
**Symptoms**: Cannot reply or error when replying

**Checks**:
1. Check if trying to reply to a reply (not allowed)
2. Verify parent comment exists
3. Check database trigger is installed
4. Check browser console for errors

**Fix**:
```sql
-- Verify trigger exists in Supabase SQL Editor
SELECT * FROM pg_trigger WHERE tgname = 'trigger_check_reply_depth';
```

### Performance Issues
**Symptoms**: Slow loading, laggy UI

**Checks**:
1. Check number of comments per centre
2. Verify indexes are created
3. Check Supabase query performance
4. Monitor network requests

**Fix**:
```sql
-- Verify indexes in Supabase SQL Editor
SELECT indexname FROM pg_indexes WHERE tablename = 'comments';
```

---

## 📞 Support Resources

### Documentation
- `COMMENT_SYSTEM_SETUP.md` - Complete setup guide
- `QUICK_START_COMMENTS.md` - Quick reference
- `COMMENT_SYSTEM_ARCHITECTURE.md` - Technical details
- `IMPLEMENTATION_SUMMARY.md` - Overview

### External Resources
- Supabase Docs: https://supabase.com/docs
- Material-UI Docs: https://mui.com/material-ui/
- React Docs: https://react.dev/

### Database Access
- Supabase Dashboard: https://zeekhdsgsxulkjlcuhdx.supabase.co
- SQL Editor: Dashboard → SQL Editor
- Table Editor: Dashboard → Table Editor
- Logs: Dashboard → Logs

---

## ✅ Final Verification

Before marking deployment as complete:

- [ ] All items in Pre-Deployment Checklist completed
- [ ] All items in Production Deployment completed
- [ ] All items in Security Checklist completed
- [ ] Tested all core features in production
- [ ] Documented admin password securely
- [ ] Set up monitoring alerts (optional)
- [ ] Informed team about new feature
- [ ] Provided admin access to relevant people

---

## 🎉 Deployment Complete!

Once all items are checked, your comment system is live and ready for users!

**Next Steps**:
1. Monitor usage for first week
2. Gather user feedback
3. Plan future enhancements
4. Celebrate! 🎊
