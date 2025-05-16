import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fab,
  Tooltip,
  Container,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { format } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CustomerList from '../components/customer/CustomerList';
import CustomerModal from '../components/customer/CustomerModal';
import { useAppContext } from '../context/AppContext';

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState('');
  const [todayDate, setTodayDate] = useState(new Date());
  const { selectedDate, currentUser, signOutUser, totalRevenue } = useAppContext();
  const navigate = useNavigate();

  // Update the date at midnight
  useEffect(() => {
    // Set initial date
    setTodayDate(new Date());

    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    // Set a timeout to update the date at midnight
    const timer = setTimeout(() => {
      setTodayDate(new Date());
    }, timeUntilMidnight);

    // Clear the timeout when component unmounts
    return () => clearTimeout(timer);
  }, [todayDate]); // Re-run when todayDate changes (which happens at midnight)

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOutUser();
    handleMenuClose();
  };

  const goToProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  // Fetch username from user_info collection when currentUser changes
  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser) {
        try {
          const q = query(
            collection(db, 'user_info'),
            where('uid', '==', currentUser.uid)
          );

          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUsername(userData.username || 'User');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      }
    };

    fetchUsername();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-white">
      <Container maxWidth="md" className="py-4">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}
             sx={{ borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
              History
            </Typography>

            {/* Info chips for date and revenue */}
            <Box display="flex" mt={1} gap={2}>
              <Chip
                icon={<CalendarTodayIcon fontSize="small" />}
                label={`Today: ${format(todayDate, 'dd MMM yyyy')}`}
                variant="outlined"
                size="small"
                sx={{ borderRadius: '4px' }}
              />

              <Chip
                icon={<MonetizationOnIcon fontSize="small" />}
                label={`Total Revenue: ₹${totalRevenue.toFixed(2)}`}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ borderRadius: '4px' }}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center">
            {username && (
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {username}
              </Typography>
            )}
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: '#f0f0f0', color: '#666', width: 32, height: 32 }}>
                <span className="text-sm">👤</span>
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={goToProfile}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => {
                navigate('/history');
                handleMenuClose();
              }}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                History
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <CustomerList />

        <Tooltip title="Add New Rental" placement="left">
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              background: 'linear-gradient(145deg, #4285F4, #356ac3)',
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              '&:hover': {
                background: 'linear-gradient(145deg, #356ac3, #4285F4)',
              }
            }}
            onClick={handleOpenModal}
          >
            <AddIcon sx={{ fontSize: '28px' }} />
          </Fab>
        </Tooltip>

        <CustomerModal
          open={modalOpen}
          onClose={handleCloseModal}
        />
      </Container>
    </div>
  );
};

export default Home;
