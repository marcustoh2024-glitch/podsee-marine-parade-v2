import { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';

export default function CommentInput({ 
  onSubmit, 
  onCancel, 
  placeholder = "Write a comment...",
  isReply = false,
  autoFocus = false 
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    
    if (!trimmed) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (trimmed.length > 500) {
      setError('Comment must be 500 characters or less');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onSubmit(trimmed);
      setText('');
      setIsFocused(false);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const showMetadata = isFocused || text.length > 0;

  // For reply comments, keep the original multi-line layout
  if (isReply) {
    return (
      <Box sx={{ mt: 1 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
          autoFocus={autoFocus}
          error={!!error}
          helperText={error || `${text.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
          sx={{ mb: 1 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading} size="small">
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !text.trim()}
            size="small"
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </Box>
    );
  }

  // For main comment input: compact, single-line with inline Post button
  return (
    <Box>
      {/* Input row with inline Post button */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          error={!!error}
          inputProps={{ 
            maxLength: 500,
            style: { 
              padding: '12px 14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              height: '48px'
            }
          }}
        />
        
        {text.trim() && (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            sx={{ 
              minWidth: '80px',
              height: '48px',
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Post'}
          </Button>
        )}
      </Box>
      
      {/* Metadata row - only shown when focused or has text */}
      {showMetadata && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 1,
          px: 1
        }}>
          <Typography variant="caption" color="text.secondary">
            Don't share private info. Comments are public.
          </Typography>
          <Typography 
            variant="caption" 
            color={text.length > 450 ? 'error.main' : 'text.secondary'}
          >
            {text.length}/500
          </Typography>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, px: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
