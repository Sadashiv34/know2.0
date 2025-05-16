import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppContext } from '../context/AppContext';

const Profile = () => {
  const { currentUser, signOutUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const q = query(
            collection(db, 'user_info'),
            where('uid', '==', currentUser.uid)
          );

          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
      navigate('/login');
    } catch (error) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  if (!currentUser) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Not logged in
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <IconButton onClick={goBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Username
            </Typography>
            <Typography variant="body1">
              {userData?.username || 'Not available'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Phone Number
            </Typography>
            <Typography variant="body1">
              {userData?.phone_number || 'Not available'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              User ID
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {currentUser.uid}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Account Created
            </Typography>
            <Typography variant="body1">
              {currentUser.metadata?.creationTime ?
                new Date(currentUser.metadata.creationTime).toLocaleString() :
                'Not available'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Last Sign In
            </Typography>
            <Typography variant="body1">
              {currentUser.metadata?.lastSignInTime ?
                new Date(currentUser.metadata.lastSignInTime).toLocaleString() :
                'Not available'}
            </Typography>
          </Box>
        </Paper>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSignOut}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign Out'}
        </Button>

        <Button
          variant="outlined"
          onClick={goBack}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
