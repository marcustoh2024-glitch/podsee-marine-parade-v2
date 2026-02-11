# Quick Start - Comment System

## 🚀 3-Step Setup

### 1. Run SQL Schema
1. Go to: https://zeekhdsgsxulkjlcuhdx.supabase.co
2. Click "SQL Editor" → "New Query"
3. Copy all content from `supabase-schema.sql`
4. Paste and click "Run"

### 2. Set Admin Password
Edit `.env` file:
```
VITE_ADMIN_SECRET=YourSecurePassword123
```

### 3. Start Development
```bash
npm run dev
```

## ✅ Test Checklist

- [ ] Open app and click on a tuition centre
- [ ] Scroll down to see comment section
- [ ] Post a comment (enter username when prompted)
- [ ] Reply to your comment
- [ ] Visit `/civictyperadmin` and login
- [ ] Hide/show a comment
- [ ] Delete a comment

## 📁 Files Created

### Core Files
- `src/utils/supabaseClient.js` - Database connection
- `src/utils/commentService.js` - API functions
- `src/utils/centreIdGenerator.js` - Postal code → centerId

### Components
- `src/components/CommentSection.jsx` - Main container
- `src/components/CommentItem.jsx` - Individual comment
- `src/components/CommentInput.jsx` - Text input
- `src/components/UsernamePrompt.jsx` - Username dialog

### Admin
- `src/pages/AdminPage.jsx` - Moderation interface

### Database
- `supabase-schema.sql` - Complete database setup

### Updated Files
- `src/components/CentreModal.jsx` - Added CommentSection
- `src/App.jsx` - Added admin route
- `.env` - Added Supabase credentials

## 🔑 Key Features

- ✅ Comments tied to postal code (stable across redeployments)
- ✅ 1-level replies only (no nested replies)
- ✅ Username stored in sessionStorage
- ✅ 500 character limit
- ✅ URL blocking
- ✅ XSS prevention
- ✅ Load more pagination
- ✅ Admin moderation at `/civictyperadmin`

## 🛡️ Security

- Row Level Security (RLS) enabled
- Public: read + insert only
- Admin: update hidden + delete
- Password-protected admin panel
- Service role key for admin operations

## 📊 Database Structure

```
comments table:
├── comment_id (UUID, primary key)
├── centre_id (TEXT, postal code)
├── username (TEXT, max 50 chars)
├── text (TEXT, max 500 chars)
├── parent_comment_id (UUID, nullable)
├── created_at (TIMESTAMPTZ)
└── hidden (BOOLEAN)
```

## 🎯 Admin Panel

URL: `/civictyperadmin`

Features:
- View all comments (including hidden)
- Hide/show comments
- Delete comments
- Filter by centre, username, type
- See creation timestamps

## 💡 Tips

- Username persists for the session only
- Comments load 20 at a time
- Replies load 2 initially, then all on "View more"
- Admin password is in `.env` file
- Postal code = centerId (stable identifier)

## 🐛 Common Issues

**Comments not loading?**
- Check Supabase credentials in `.env`
- Verify SQL schema was run
- Check browser console for errors

**Cannot post comments?**
- Check for URLs in text
- Verify character limit (500 max)
- Ensure username is set

**Admin panel not working?**
- Verify `VITE_ADMIN_SECRET` in `.env`
- Check service role key is correct
- Use correct password

## 📝 Next Steps

See `COMMENT_SYSTEM_SETUP.md` for:
- Detailed setup instructions
- Deployment guide
- Database maintenance queries
- Troubleshooting tips
