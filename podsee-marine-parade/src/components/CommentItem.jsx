import { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider, CircularProgress, Alert } from '@mui/material';
import CommentInput from './CommentInput';
import { fetchReplies, createComment, getReplyCount } from '../utils/commentService';

export default function CommentItem({ 
  comment, 
  centreId, 
  username, 
  onUsernameRequired,
  isReply = false 
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [totalReplyCount, setTotalReplyCount] = useState(comment.reply_count || 0);
  const [error, setError] = useState('');

  // Load initial 2 replies if this is a top-level comment with replies
  useEffect(() => {
    if (!isReply && totalReplyCount > 0 && !repliesLoaded) {
      loadInitialReplies();
    }
  }, [totalReplyCount]);

  const loadInitialReplies = async () => {
    setLoadingReplies(true);
    const { data, error } = await fetchReplies(comment.comment_id, 2, 0);
    
    if (error) {
      setError(error);
    } else {
      setReplies(data);
      setRepliesLoaded(true);
    }
    
    setLoadingReplies(false);
  };

  const loadMoreReplies = async () => {
    setLoadingReplies(true);
    const { data, error } = await fetchReplies(comment.comment_id, 100, 0); // Load all
    
    if (error) {
      setError(error);
    } else {
      setReplies(data);
    }
    
    setLoadingReplies(false);
  };

  const handleReplyClick = () => {
    if (!username) {
      onUsernameRequired();
      return;
    }
    setShowReplyInput(true);
  };

  const handleReplySubmit = async (text) => {
    const { data, error } = await createComment(
      centreId,
      username,
      text,
      comment.comment_id
    );
    
    if (error) {
      throw new Error(error);
    }
    
    // Add new reply to list
    setReplies(prev => [...prev, data]);
    setTotalReplyCount(prev => prev + 1);
    setShowReplyInput(false);
    
    // If replies weren't loaded yet, mark them as loaded
    if (!repliesLoaded) {
      setRepliesLoaded(true);
    }
  };

  const handleReplyCancel = () => {
    setShowReplyInput(false);
  };

  const showViewMoreButton = repliesLoaded && totalReplyCount > replies.length;

  return (
    <Box sx={{ mb: isReply ? 1.5 : 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
            {comment.username}
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {comment.text}
          </Typography>
          
          {!isReply && (
            <Box sx={{ mt: 0.5 }}>
              <Button 
                size="small" 
                onClick={handleReplyClick}
                sx={{ 
                  textTransform: 'none', 
                  minWidth: 'auto',
                  p: 0,
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'transparent', color: 'primary.main' }
                }}
              >
                Reply
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Replies section */}
      {!isReply && repliesLoaded && replies.length > 0 && (
        <Box sx={{ ml: 4, mt: 1.5 }}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.comment_id}
              comment={reply}
              centreId={centreId}
              username={username}
              onUsernameRequired={onUsernameRequired}
              isReply={true}
            />
          ))}
        </Box>
      )}

      {/* View more replies button */}
      {!isReply && showViewMoreButton && (
        <Box sx={{ ml: 4, mt: 1 }}>
          <Button
            size="small"
            onClick={loadMoreReplies}
            disabled={loadingReplies}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            {loadingReplies ? (
              <CircularProgress size={16} />
            ) : (
              `View more replies (${totalReplyCount - replies.length})`
            )}
          </Button>
        </Box>
      )}

      {/* Loading initial replies */}
      {!isReply && !repliesLoaded && totalReplyCount > 0 && loadingReplies && (
        <Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Loading replies...
          </Typography>
        </Box>
      )}

      {/* Reply input */}
      {!isReply && showReplyInput && (
        <Box sx={{ ml: 4, mt: 1 }}>
          <CommentInput
            onSubmit={handleReplySubmit}
            onCancel={handleReplyCancel}
            placeholder={`Reply to ${comment.username}...`}
            isReply={true}
            autoFocus={true}
          />
        </Box>
      )}

      {!isReply && <Divider sx={{ mt: 2, borderColor: 'rgba(0, 0, 0, 0.08)' }} />}
    </Box>
  );
}
