-- ============================================
-- PODSEE COMMENT SYSTEM - DATABASE SCHEMA
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Project: https://zeekhdsgsxulkjlcuhdx.supabase.co
-- ============================================

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id TEXT NOT NULL,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  parent_comment_id UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Foreign key constraint: replies must reference valid parent comments
  CONSTRAINT fk_parent_comment 
    FOREIGN KEY (parent_comment_id) 
    REFERENCES comments(comment_id) 
    ON DELETE CASCADE,
  
  -- Validation constraints
  CONSTRAINT check_text_not_empty CHECK (LENGTH(TRIM(text)) > 0),
  CONSTRAINT check_text_length CHECK (LENGTH(text) <= 500),
  CONSTRAINT check_username_not_empty CHECK (LENGTH(TRIM(username)) > 0),
  CONSTRAINT check_username_length CHECK (LENGTH(username) <= 50),
  CONSTRAINT check_centre_id_not_empty CHECK (LENGTH(TRIM(centre_id)) > 0),
  
  -- Prevent URLs in comments (basic patterns)
  CONSTRAINT check_no_urls CHECK (
    text !~* 'https?://' AND 
    text !~* 'www\.' AND
    text !~* '\.[a-z]{2,}/'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_centre_id ON comments(centre_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_hidden ON comments(hidden);

-- Composite index for fetching top-level comments by centre
CREATE INDEX IF NOT EXISTS idx_comments_centre_toplevel 
  ON comments(centre_id, created_at) 
  WHERE parent_comment_id IS NULL AND hidden = FALSE;

-- Composite index for fetching replies
CREATE INDEX IF NOT EXISTS idx_comments_replies 
  ON comments(parent_comment_id, created_at) 
  WHERE parent_comment_id IS NOT NULL AND hidden = FALSE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public users can read non-hidden comments
CREATE POLICY "Public users can read non-hidden comments"
  ON comments
  FOR SELECT
  USING (hidden = FALSE);

-- Policy 2: Public users can insert comments (with validation via function)
CREATE POLICY "Public users can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (
    -- Ensure basic validations
    LENGTH(TRIM(text)) > 0 AND
    LENGTH(text) <= 500 AND
    LENGTH(TRIM(username)) > 0 AND
    LENGTH(username) <= 50 AND
    LENGTH(TRIM(centre_id)) > 0 AND
    hidden = FALSE
  );

-- Policy 3: Admin can update hidden field (service role only)
CREATE POLICY "Admin can update hidden field"
  ON comments
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy 4: Admin can delete comments (service role only)
CREATE POLICY "Admin can delete comments"
  ON comments
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- DATABASE FUNCTION: Validate Reply Depth
-- ============================================
-- This function prevents replies to replies (enforces 1-level nesting only)

CREATE OR REPLACE FUNCTION check_reply_depth()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a reply (has parent_comment_id)
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Check if the parent is itself a reply
    IF EXISTS (
      SELECT 1 FROM comments 
      WHERE comment_id = NEW.parent_comment_id 
      AND parent_comment_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Cannot reply to a reply. Replies are only allowed on top-level comments.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce reply depth
DROP TRIGGER IF EXISTS trigger_check_reply_depth ON comments;
CREATE TRIGGER trigger_check_reply_depth
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION check_reply_depth();

-- ============================================
-- DATABASE FUNCTION: Get Comments with Reply Count
-- ============================================
-- Efficient function to fetch top-level comments with reply counts

CREATE OR REPLACE FUNCTION get_comments_with_reply_count(
  p_centre_id TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  comment_id UUID,
  centre_id TEXT,
  username TEXT,
  text TEXT,
  created_at TIMESTAMPTZ,
  reply_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.comment_id,
    c.centre_id,
    c.username,
    c.text,
    c.created_at,
    COUNT(r.comment_id) AS reply_count
  FROM comments c
  LEFT JOIN comments r ON r.parent_comment_id = c.comment_id AND r.hidden = FALSE
  WHERE c.centre_id = p_centre_id
    AND c.parent_comment_id IS NULL
    AND c.hidden = FALSE
  GROUP BY c.comment_id, c.centre_id, c.username, c.text, c.created_at
  ORDER BY c.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================

-- Check if table was created successfully
-- SELECT * FROM comments LIMIT 1;

-- Check if indexes were created
-- SELECT indexname FROM pg_indexes WHERE tablename = 'comments';

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'comments';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this entire SQL script in Supabase SQL Editor
-- 2. Verify no errors occurred
-- 3. Test by inserting a sample comment manually
-- ============================================
