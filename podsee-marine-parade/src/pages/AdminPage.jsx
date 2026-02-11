import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminFetchAllComments, adminToggleHidden, adminDeleteComment } from '../utils/commentService';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (authenticated) {
      loadComments();
    }
  }, [authenticated]);

  const handleLogin = () => {
    const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
    
    if (!adminSecret) {
      setAuthError('Admin secret not configured');
      return;
    }
    
    if (password === adminSecret) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
    }
  };

  const loadComments = async () => {
    setLoading(true);
    setError('');
    
    const { data, error: fetchError } = await adminFetchAllComments();
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setComments(data);
    }
    
    setLoading(false);
  };

  const handleToggleHidden = async (commentId, currentHidden) => {
    const { error } = await adminToggleHidden(commentId, !currentHidden);
    
    if (error) {
      setError(error);
    } else {
      // Update local state
      setComments(prev => 
        prev.map(c => 
          c.comment_id === commentId 
            ? { ...c, hidden: !currentHidden }
            : c
        )
      );
    }
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    const { error } = await adminDeleteComment(commentToDelete.comment_id);
    
    if (error) {
      setError(error);
    } else {
      // Remove from local state
      setComments(prev => prev.filter(c => c.comment_id !== commentToDelete.comment_id));
    }
    
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login screen
  if (!authenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the admin password to access comment moderation.
          </Typography>
          
          <TextField
            fullWidth
            type="password"
            label="Admin Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setAuthError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            error={!!authError}
            helperText={authError}
            sx={{ mb: 2 }}
          />
          
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleLogin}
            size="large"
          >
            Login
          </Button>
        </Paper>
      </Container>
    );
  }

  // Admin dashboard
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Comment Moderation
        </Typography>
        <Button onClick={loadComments} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Centre ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No comments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment.comment_id}>
                    <TableCell>{comment.centre_id}</TableCell>
                    <TableCell>{comment.username}</TableCell>
                    <TableCell sx={{ maxWidth: 400 }}>
                      <Typography variant="body2" noWrap>
                        {comment.text}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={comment.parent_comment_id ? 'Reply' : 'Comment'} 
                        size="small"
                        color={comment.parent_comment_id ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(comment.created_at)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={comment.hidden ? 'Hidden' : 'Visible'} 
                        size="small"
                        color={comment.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleToggleHidden(comment.comment_id, comment.hidden)}
                        title={comment.hidden ? 'Show comment' : 'Hide comment'}
                      >
                        {comment.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(comment)}
                        color="error"
                        title="Delete comment"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Comment?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this comment?
          </Typography>
          {commentToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {commentToDelete.username}
              </Typography>
              <Typography variant="body2">
                {commentToDelete.text}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
