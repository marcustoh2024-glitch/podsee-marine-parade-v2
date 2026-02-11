import { useState, useEffect } from 'react';
import { Box, Typography, Divider, Button, CircularProgress, Alert } from '@mui/material';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import UsernamePrompt from './UsernamePrompt';
import { fetchComments, createComment } from '../utils/commentService';
import { generateCentreId } from '../utils/centreIdGenerator';

export default function CommentSection({ centre }) {
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const centreId = generateCentreId(centre);

  // Load username from sessionStorage on mount
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('podsee_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Load initial comments
  useEffect(() => {
    loadComments();
  }, [centreId]);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    
    const { data, error: fetchError } = await fetchComments(centreId, 20, 0);
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setComments(data);
      setHasMore(data.length === 20);
      setOffset(20);
    }
    
    setLoading(false);
  };

  const loadMoreComments = async () => {
    setLoadingMore(true);
    
    const { data, error: fetchError } = await fetchComments(centreId, 20, offset);
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setComments(prev => [...prev, ...data]);
      setHasMore(data.length === 20);
      setOffset(prev => prev + 20);
    }
    
    setLoadingMore(false);
  };

  const handleCommentSubmit = async (text) => {
    if (!username) {
      setShowUsernamePrompt(true);
      throw new Error('Username required');
    }

    const { data, error: createError } = await createComment(
      centreId,
      username,
      text,
      null // top-level comment
    );
    
    if (createError) {
      throw new Error(createError);
    }
    
    // Add new comment to the end (oldest first order)
    setComments(prev => [...prev, { ...data, reply_count: 0 }]);
  };

  const handleUsernameSubmit = (newUsername) => {
    setUsername(newUsername);
    setShowUsernamePrompt(false);
  };

  const handleUsernameRequired = () => {
    setShowUsernamePrompt(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Fixed header with divider and title */}
      <Box sx={{ flexShrink: 0, px: 3, pt: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Comments
        </Typography>
      </Box>

      {/* Scrollable comments area */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 3, minHeight: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.comment_id}
                comment={comment}
                centreId={centreId}
                username={username}
                onUsernameRequired={handleUsernameRequired}
              />
            ))}
            
            {/* Load more button */}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  onClick={loadMoreComments}
                  disabled={loadingMore}
                  variant="outlined"
                  startIcon={loadingMore && <CircularProgress size={16} />}
                >
                  {loadingMore ? 'Loading...' : 'Load more comments'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Sticky comment input at bottom */}
      <Box 
        sx={{ 
          flexShrink: 0,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: 'background.paper',
          p: 2
        }}
      >
        {!username ? (
          <Button 
            variant="outlined" 
            onClick={() => setShowUsernamePrompt(true)}
            fullWidth
          >
            Set username to comment
          </Button>
        ) : (
          <CommentInput
            onSubmit={handleCommentSubmit}
            placeholder="Write a comment..."
          />
        )}
      </Box>

      {/* Username prompt dialog */}
      <UsernamePrompt
        open={showUsernamePrompt}
        onSubmit={handleUsernameSubmit}
        onCancel={() => setShowUsernamePrompt(false)}
      />
    </Box>
  );
}
