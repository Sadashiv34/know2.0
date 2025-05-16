import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';

const Login = ({ onSuccess }) => {
  const { signInUser, registerUser, authLoading, authError } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    // Common validation for both login and register
    if (!formData.username || !formData.password) {
      setFormError('Please fill in all required fields');
      return false;
    }

    if (formData.username.length < 3) {
      setFormError('Username must be at least 3 characters');
      return false;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    // Additional validation for registration
    if (!isLogin) {
      if (!formData.phone) {
        setFormError('Phone number is required');
        return false;
      }

      if (!/^\d{10}$/.test(formData.phone)) {
        setFormError('Phone number must be 10 digits');
        return false;
      }
    }

    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let result;

      if (isLogin) {
        result = await signInUser(formData.username, formData.password);
      } else {
        result = await registerUser(formData.username, formData.password, formData.phone);
      }

      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Typography>

        {(authError || formError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError || formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />

          {!isLogin && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Phone Number"
              type="tel"
              id="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              inputProps={{ maxLength: 10 }}
              helperText="10-digit phone number"
            />
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={authLoading}
          >
            {authLoading ? (
              <CircularProgress size={24} />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>

          <Box textAlign="center">
            <Button
              onClick={() => setIsLogin(!isLogin)}
              variant="text"
              sx={{ mt: 1 }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
