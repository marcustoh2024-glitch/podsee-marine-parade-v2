import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';

export default function UsernamePrompt({ open, onSubmit, onCancel }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = username.trim();
    
    if (!trimmed) {
      setError('Username is required');
      return;
    }
    
    if (trimmed.length > 50) {
      setError('Username must be 50 characters or less');
      return;
    }
    
    // Store in sessionStorage
    sessionStorage.setItem('podsee_username', trimmed);
    onSubmit(trimmed);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Choose a Username</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter a username to start commenting. It will be saved for this session only.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          inputProps={{ maxLength: 50 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
