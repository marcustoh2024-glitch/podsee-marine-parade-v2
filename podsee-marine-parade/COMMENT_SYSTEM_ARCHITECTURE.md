# Comment System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PODSEE COMMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │ ◄─────► │   Supabase   │ ◄─────► │  PostgreSQL  │
│  React + MUI │         │    Client    │         │   Database   │
└──────────────┘         └──────────────┘         └──────────────┘
```

## Data Flow

### 1. Centre ID Generation
```
Centre Object (from Excel)
    ↓
postalCode: "123456"
    ↓
generateCentreId(centre)
    ↓
centreId: "123456"
    ↓
Used in all comment operations
```

### 2. Comment Creation Flow
```
User clicks "Post" button
    ↓
Check username in sessionStorage
    ↓
If no username → Show UsernamePrompt
    ↓
Validate comment (length, URLs, XSS)
    ↓
Call createComment(centreId, username, text, parentId)
    ↓
Supabase RLS checks permissions
    ↓
Database trigger validates reply depth
    ↓
Insert into comments table
    ↓
Return new comment to frontend
    ↓
Optimistically render in UI
```

### 3. Reply Creation Flow
```
User clicks "Reply" button
    ↓
Check if parent is top-level comment
    ↓
Show inline CommentInput
    ↓
User submits reply
    ↓
Validate reply (same as comment)
    ↓
Call createComment(centreId, username, text, parentCommentId)
    ↓
Database trigger checks parent is not a reply
    ↓
If parent is reply → REJECT with error
    ↓
If parent is top-level → INSERT
    ↓
Return new reply to frontend
    ↓
Add to replies array under parent
```

### 4. Load Comments Flow
```
CentreModal opens
    ↓
CommentSection mounts
    ↓
Call fetchComments(centreId, limit=20, offset=0)
    ↓
Supabase executes get_comments_with_reply_count()
    ↓
Returns top-level comments with reply counts
    ↓
Render comments oldest to newest
    ↓
For each comment with replies > 0:
    ↓
    Auto-load first 2 replies
    ↓
    Show "View more replies" if count > 2
```

## Component Hierarchy

```
CentreModal
└── CommentSection
    ├── CommentInput (top-level)
    ├── UsernamePrompt (dialog)
    └── CommentItem (for each comment)
        ├── Reply button
        ├── CommentInput (inline, for replies)
        └── CommentItem (nested, for replies)
            └── (no further nesting allowed)
```

## Database Schema

```sql
comments
├── comment_id          UUID PRIMARY KEY
├── centre_id           TEXT (postal code)
├── username            TEXT (max 50 chars)
├── text                TEXT (max 500 chars)
├── parent_comment_id   UUID (nullable, FK to comments)
├── created_at          TIMESTAMPTZ
└── hidden              BOOLEAN

Indexes:
├── idx_comments_centre_id
├── idx_comments_parent_comment_id
├── idx_comments_created_at
├── idx_comments_hidden
├── idx_comments_centre_toplevel (composite)
└── idx_comments_replies (composite)

Constraints:
├── fk_parent_comment (CASCADE delete)
├── check_text_not_empty
├── check_text_length (≤ 500)
├── check_username_not_empty
├── check_username_length (≤ 50)
├── check_centre_id_not_empty
└── check_no_urls (regex patterns)

Triggers:
└── trigger_check_reply_depth
    └── Prevents replies to replies
```

## Security Model

### Row Level Security (RLS) Policies

```
┌─────────────────────────────────────────────────────────┐
│                    RLS POLICIES                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PUBLIC USERS (anon role):                              │
│  ├── SELECT: WHERE hidden = FALSE                       │
│  ├── INSERT: WITH CHECK (validations)                   │
│  ├── UPDATE: ❌ DENIED                                   │
│  └── DELETE: ❌ DENIED                                   │
│                                                          │
│  ADMIN (service_role):                                  │
│  ├── SELECT: ALL rows (including hidden)                │
│  ├── INSERT: ✅ ALLOWED                                  │
│  ├── UPDATE: ✅ ALLOWED (hidden field only)              │
│  └── DELETE: ✅ ALLOWED                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Validation Layers

```
Layer 1: Frontend (React)
├── Character limit (500)
├── Empty text check
├── URL pattern detection
└── Username requirement

Layer 2: Service (commentService.js)
├── Text sanitization (XSS prevention)
├── URL validation (regex patterns)
├── Parent comment validation
└── Reply depth check

Layer 3: Database (PostgreSQL)
├── CHECK constraints
├── Foreign key constraints
├── Trigger functions
└── RLS policies
```

## API Functions

### Public API (commentService.js)

```javascript
// Fetch top-level comments with reply counts
fetchComments(centreId, limit, offset)
  → Returns: { data: Comment[], error: string }

// Fetch replies for a parent comment
fetchReplies(parentCommentId, limit, offset)
  → Returns: { data: Comment[], error: string }

// Get total reply count
getReplyCount(parentCommentId)
  → Returns: { count: number, error: string }

// Create comment or reply
createComment(centreId, username, text, parentCommentId?)
  → Returns: { data: Comment, error: string }
```

### Admin API (commentService.js)

```javascript
// Fetch all comments (including hidden)
adminFetchAllComments()
  → Returns: { data: Comment[], error: string }

// Toggle comment visibility
adminToggleHidden(commentId, hidden)
  → Returns: { data: Comment, error: string }

// Delete comment permanently
adminDeleteComment(commentId)
  → Returns: { error: string }
```

## Performance Optimizations

### 1. Efficient Queries
```sql
-- Single query for comments + reply counts
-- Avoids N+1 problem
get_comments_with_reply_count(centre_id, limit, offset)
  → LEFT JOIN to count replies
  → Returns comments with reply_count in one query
```

### 2. Lazy Loading
```
Initial load:
├── 20 top-level comments
└── 2 replies per comment (auto-loaded)

On demand:
├── "Load more comments" → Next 20 comments
└── "View more replies" → All remaining replies
```

### 3. Optimistic Updates
```
User posts comment
    ↓
Immediately add to UI (optimistic)
    ↓
Send to database in background
    ↓
If error → Remove from UI + show error
    ↓
If success → Keep in UI
```

### 4. Indexed Queries
```
All queries use indexes:
├── centre_id + created_at (top-level comments)
├── parent_comment_id + created_at (replies)
└── hidden (filtering)
```

## Admin Panel Architecture

```
/civictyperadmin
    ↓
AdminPage component
    ↓
Password authentication (VITE_ADMIN_SECRET)
    ↓
If authenticated:
    ↓
    Use supabaseAdmin client (service_role)
    ↓
    Fetch all comments (including hidden)
    ↓
    Display in Material-UI Table
    ↓
    Actions:
    ├── Toggle visibility (hide/show)
    └── Delete permanently
```

## State Management

### CommentSection State
```javascript
{
  username: string,              // From sessionStorage
  showUsernamePrompt: boolean,   // Dialog visibility
  comments: Comment[],           // Top-level comments
  loading: boolean,              // Initial load
  loadingMore: boolean,          // Pagination
  error: string,                 // Error messages
  hasMore: boolean,              // More comments available
  offset: number                 // Pagination offset
}
```

### CommentItem State
```javascript
{
  showReplyInput: boolean,       // Reply input visibility
  replies: Comment[],            // Loaded replies
  repliesLoaded: boolean,        // Replies fetched
  loadingReplies: boolean,       // Loading state
  totalReplyCount: number,       // Total replies
  error: string                  // Error messages
}
```

## Error Handling

```
Frontend Validation Error
    ↓
Show inline error message
    ↓
User corrects input
    ↓
Clear error

Database Error
    ↓
Catch in commentService
    ↓
Return { data: null, error: message }
    ↓
Display Alert component
    ↓
User can retry

Network Error
    ↓
Supabase client handles retry
    ↓
If persistent → Show error
    ↓
User can refresh
```

## Deployment Considerations

### Environment Variables
```
Development (.env):
├── VITE_SUPABASE_URL
├── VITE_SUPABASE_ANON_KEY
├── VITE_SUPABASE_SERVICE_KEY
└── VITE_ADMIN_SECRET

Production (Vercel):
├── Same variables
└── Set in Vercel dashboard
```

### Database Migrations
```
Initial setup:
└── Run supabase-schema.sql once

Future changes:
├── Create migration SQL files
├── Test in development
└── Run in production
```

### Monitoring
```
Supabase Dashboard:
├── Query performance
├── RLS policy hits
├── Error logs
└── Database size
```

## Scalability

### Current Limits
- 20 comments per page
- 2 initial replies per comment
- 500 characters per comment
- 50 characters per username

### Future Scaling Options
1. Increase pagination limits
2. Add infinite scroll
3. Implement caching (Redis)
4. Add full-text search
5. Implement rate limiting
6. Add CDN for static assets

## Testing Strategy

### Manual Testing
1. Post comment without username → Should prompt
2. Post comment with URL → Should reject
3. Post comment > 500 chars → Should reject
4. Reply to top-level comment → Should work
5. Reply to reply → Should reject
6. Load more comments → Should paginate
7. View more replies → Should load all
8. Admin hide comment → Should disappear
9. Admin delete comment → Should remove

### Edge Cases
- Empty postal code → Error
- Deleted parent comment → Cascade delete replies
- Hidden parent comment → Hide replies too
- Concurrent posts → Handle race conditions
- Network timeout → Show error + retry
